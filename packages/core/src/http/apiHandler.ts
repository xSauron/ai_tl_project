/**
 * The one wrapper every Route Handler goes through. Lifecycle, in order:
 * CSRF → session → parse (params, query, body) → request scope → rate limit → handler → envelope.
 *
 * `core` never imports `next`: handlers take a web-standard `Request` and
 * return a web-standard `Response`, which is what Next 16 Route Handlers use.
 */
import type { z } from "zod";

import type { RequestCradle } from "../container/cradle.ts";
import { withScope as defaultWithScope } from "../container/scope.ts";
import { createRequestLogger, getLogger, REQUEST_ID_HEADER, type Logger } from "../logger.ts";
import type { RateLimiter, RateLimitWindow } from "./rate-limit.ts";
import { MAX_JSON_BODY_BYTES } from "../validators/limits.ts";
import { resolveSessionActor, type Actor } from "./auth.ts";
import {
  ERROR_CODES,
  ForbiddenError,
  isAppError,
  PayloadTooLargeError,
  RateLimitedError,
  UnauthorizedError,
  ValidationError,
  type AppError,
  type EnvelopeError,
  type FieldErrors,
} from "./errors.ts";

/** State-changing requests must carry `x-plantai-request: 1`; `apiCall` always sets it. */
export const CSRF_HEADER = "x-plantai-request";
export const CSRF_HEADER_VALUE = "1";
/** Methods that never change state and so skip the CSRF check. */
export const CSRF_SAFE_METHODS: ReadonlySet<string> = new Set(["GET", "HEAD"]);

/** `fieldErrors` key for a Zod issue on the whole value (empty path), e.g. "body must be an object". */
export const ROOT_FIELD_ERROR_KEY = "_root";
export const INVALID_JSON_MESSAGE = "Request body must be valid JSON.";
export const INTERNAL_ERROR_MESSAGE = "Something went wrong. Try again later.";
export const DEFAULT_SUCCESS_STATUS = 200;

const INTERNAL_SERVER_ERROR_STATUS = 500;
const JSON_CONTENT_TYPE = "application/json";
const RETRY_AFTER_HEADER = "retry-after";

export type AuthMode = "required" | "public";
export type SuccessStatus = 200 | 201 | 202;
type Schema = z.ZodType | undefined;
type Infer<S extends Schema> = S extends z.ZodType ? z.output<S> : undefined;
type ActorFor<A extends AuthMode> = A extends "required" ? Actor : Actor | null;

/** Next 16 passes `params` as a Promise; static routes may pass no context at all. */
export interface ApiRouteContext {
  params: Promise<Record<string, string | string[]>>;
}

/** What a rate-limit rule may key on: the parsed request, before the handler runs. */
export type RateLimitContext<A extends AuthMode, P extends Schema, Q extends Schema, B extends Schema> = Pick<
  ApiContext<A, P, Q, B>,
  "req" | "actor" | "params" | "query" | "body"
>;

export interface RateLimitRule<A extends AuthMode, P extends Schema, Q extends Schema, B extends Schema>
  extends RateLimitWindow {
  /** Namespaces the keys, e.g. `"login"`. */
  name: string;
  /** Keys this request counts under; `null` entries are skipped (e.g. no trusted client IP). */
  keys: (ctx: RateLimitContext<A, P, Q, B>) => readonly (string | null)[];
}

export interface ApiHandlerOptions<A extends AuthMode, P extends Schema, Q extends Schema, B extends Schema> {
  auth: A;
  params?: P;
  query?: Q;
  body?: B;
  /** Checked after parsing (keys may use the body, e.g. the e-mail), before the handler; over the limit → 429. */
  rateLimit?: readonly RateLimitRule<A, P, Q, B>[];
  successStatus?: SuccessStatus;
}

export interface ApiContext<A extends AuthMode, P extends Schema, Q extends Schema, B extends Schema> {
  req: Request;
  actor: ActorFor<A>;
  params: Infer<P>;
  query: Infer<Q>;
  body: Infer<B>;
  cradle: RequestCradle;
  log: Logger;
  /** Merged into a successful response, e.g. `headers.append("set-cookie", …)`. Dropped on errors. */
  headers: Headers;
}

export type RouteHandler = (req: Request, routeCtx?: ApiRouteContext) => Promise<Response>;
export type ResolveActor = (req: Request) => Promise<Actor | null>;
export type WithScope = <T>(fn: (cradle: RequestCradle) => Promise<T>) => Promise<T>;

export interface ApiHandlerDeps {
  resolveActor: ResolveActor;
  withScope?: WithScope;
  /** Parent of each request's child logger; defaults to the process logger. */
  getLogger?: () => Logger;
}

export type ApiHandler = <
  T,
  A extends AuthMode,
  P extends Schema = undefined,
  Q extends Schema = undefined,
  B extends Schema = undefined,
>(
  options: ApiHandlerOptions<A, P, Q, B>,
  handler: (ctx: ApiContext<A, P, Q, B>) => Promise<T>,
) => RouteHandler;

function assertCsrf(req: Request): void {
  if (CSRF_SAFE_METHODS.has(req.method)) return;
  if (req.headers.get(CSRF_HEADER) === CSRF_HEADER_VALUE) return;
  throw new ForbiddenError({
    code: ERROR_CODES.CSRF_REJECTED,
    message: "The request is missing its CSRF header.",
  });
}

function toFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length === 0 ? ROOT_FIELD_ERROR_KEY : issue.path.map(String).join(".");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

async function parseWith(schema: z.ZodType, input: unknown): Promise<unknown> {
  const result = await schema.safeParseAsync(input);
  if (!result.success) throw new ValidationError(toFieldErrors(result.error));
  return result.data;
}

/** Repeated keys become arrays (`?tag=a&tag=b` → `{ tag: ["a", "b"] }`). */
function searchParamsToObject(searchParams: URLSearchParams): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};
  for (const [key, value] of searchParams) {
    const existing = query[key];
    if (existing === undefined) query[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else query[key] = [existing, value];
  }
  return query;
}

function invalidJson(cause?: unknown): ValidationError {
  return new ValidationError(undefined, { message: INVALID_JSON_MESSAGE, cause });
}

/** Reads at most `MAX_JSON_BODY_BYTES`; `content-length` is checked first but never trusted alone. */
async function readBodyBytes(req: Request): Promise<Uint8Array> {
  const declaredLength = Number(req.headers.get("content-length"));
  if (declaredLength > MAX_JSON_BODY_BYTES) throw new PayloadTooLargeError();
  if (req.body === null) return new Uint8Array();

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    total += chunk.value.byteLength;
    if (total > MAX_JSON_BODY_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    chunks.push(chunk.value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function readJsonBody(req: Request): Promise<unknown> {
  const bytes = await readBodyBytes(req);
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    throw invalidJson(error);
  }
}

function jsonResponse(payload: unknown, status: number, requestId: string, extraHeaders: Headers | Record<string, string> = {}): Response {
  const headers = new Headers(extraHeaders);
  headers.set("content-type", JSON_CONTENT_TYPE);
  headers.set(REQUEST_ID_HEADER, requestId);
  return new Response(JSON.stringify(payload), { status, headers });
}

async function enforceRateLimits<A extends AuthMode, P extends Schema, Q extends Schema, B extends Schema>(
  rules: readonly RateLimitRule<A, P, Q, B>[],
  ctx: RateLimitContext<A, P, Q, B>,
  limiter: RateLimiter,
): Promise<void> {
  for (const rule of rules) {
    for (const key of rule.keys(ctx)) {
      if (key === null) continue;
      const decision = await limiter.consume(`${rule.name}:${key}`, rule);
      if (!decision.allowed) throw new RateLimitedError(decision.retryAfterSec);
    }
  }
}

function appErrorResponse(error: AppError, requestId: string): Response {
  const headers: Record<string, string> =
    error instanceof RateLimitedError ? { [RETRY_AFTER_HEADER]: String(error.retryAfterSec) } : {};
  return jsonResponse({ ok: false, error: error.toEnvelopeError() }, error.status, requestId, headers);
}

function internalErrorResponse(requestId: string): Response {
  const error: EnvelopeError = { code: ERROR_CODES.INTERNAL, message: INTERNAL_ERROR_MESSAGE };
  return jsonResponse({ ok: false, error }, INTERNAL_SERVER_ERROR_STATUS, requestId);
}

/** Builds an `apiHandler` bound to explicit collaborators (the actor resolver, scope and logger). */
export function createApiHandler({
  resolveActor,
  withScope = defaultWithScope,
  getLogger: getParentLogger = getLogger,
}: ApiHandlerDeps): ApiHandler {
  return (options, handler) => async (req, routeCtx) => {
    const startedAt = performance.now();
    const { logger: log, requestId } = createRequestLogger(req.headers, getParentLogger());

    let response: Response;
    try {
      assertCsrf(req);

      const actor = await resolveActor(req);
      if (options.auth === "required" && actor === null) throw new UnauthorizedError();

      const params = options.params ? await parseWith(options.params, await routeCtx?.params ?? {}) : undefined;
      const query = options.query
        ? await parseWith(options.query, searchParamsToObject(new URL(req.url).searchParams))
        : undefined;
      const body = options.body ? await parseWith(options.body, await readJsonBody(req)) : undefined;

      const responseHeaders = new Headers();
      const data = await withScope(async (cradle) => {
        const ctx = {
          req,
          // Narrowed above: a "required" route never reaches here with a null actor.
          actor: actor as ActorFor<typeof options.auth>,
          params: params as never,
          query: query as never,
          body: body as never,
          cradle,
          log,
          headers: responseHeaders,
        };
        await enforceRateLimits(options.rateLimit ?? [], ctx, cradle.rateLimiter);
        return handler(ctx);
      });
      response = jsonResponse(
        { ok: true, data: data ?? null },
        options.successStatus ?? DEFAULT_SUCCESS_STATUS,
        requestId,
        responseHeaders,
      );
    } catch (error) {
      if (isAppError(error)) {
        response = appErrorResponse(error, requestId);
      } else {
        log.error({ err: error }, "Unhandled error in API handler");
        response = internalErrorResponse(requestId);
      }
    }

    log.info(
      {
        method: req.method,
        path: new URL(req.url).pathname,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
      },
      "API request",
    );
    return response;
  };
}

/** The app's handler: the actor comes from the session cookie (`http/auth.ts`). */
export const apiHandler: ApiHandler = createApiHandler({ resolveActor: resolveSessionActor });
