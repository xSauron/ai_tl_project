/**
 * The one wrapper every Route Handler goes through. Lifecycle, in order:
 * CSRF → session → parse (params, query, body) → request scope → handler → envelope.
 *
 * `core` never imports `next`: handlers take a web-standard `Request` and
 * return a web-standard `Response`, which is what Next 16 Route Handlers use.
 */
import type { z } from "zod";

import type { RequestCradle } from "../container/cradle.ts";
import { withScope as defaultWithScope } from "../container/scope.ts";
import { createRequestLogger, getLogger, REQUEST_ID_HEADER, type Logger } from "../logger.ts";
import { MAX_JSON_BODY_BYTES } from "../validators/limits.ts";
import type { Actor } from "./auth.ts";
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

export interface ApiHandlerOptions<A extends AuthMode, P extends Schema, Q extends Schema, B extends Schema> {
  auth: A;
  params?: P;
  query?: Q;
  body?: B;
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

function jsonResponse(payload: unknown, status: number, requestId: string, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": JSON_CONTENT_TYPE, [REQUEST_ID_HEADER]: requestId, ...extraHeaders },
  });
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

      const data = await withScope((cradle) =>
        handler({
          req,
          // Narrowed above: a "required" route never reaches here with a null actor.
          actor: actor as ActorFor<typeof options.auth>,
          params: params as never,
          query: query as never,
          body: body as never,
          cradle,
          log,
        }),
      );
      response = jsonResponse({ ok: true, data: data ?? null }, options.successStatus ?? DEFAULT_SUCCESS_STATUS, requestId);
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

/** Until sessions land, no request has an actor, so every "required" route fails closed with 401. */
const resolveNoActor: ResolveActor = async () => null;

export const apiHandler: ApiHandler = createApiHandler({ resolveActor: resolveNoActor });
