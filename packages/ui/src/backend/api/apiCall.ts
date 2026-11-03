/**
 * The only sanctioned `fetch()` to `/api/*` (AGENTS.md "Reusable API & UI
 * layer"; an ESLint `no-restricted-syntax` rule bans raw `/api` fetches
 * elsewhere). It speaks the server's JSON envelope
 * `{ ok: true, data } | { ok: false, error: { code, message, fieldErrors?, details? } }`
 * and never throws: transport and parsing failures become client-side codes.
 *
 * `ui` must not import `core`, so the envelope is checked with small type
 * guards here instead of a shared type or a Zod schema.
 */

/**
 * Must match `CSRF_HEADER`/`CSRF_HEADER_VALUE` in
 * `packages/core/src/http/apiHandler.ts` (`ui` can't import `core`);
 * `tests/contracts/csrf-header.test.ts` asserts they are equal.
 */
export const CSRF_HEADER = "x-plantai-request";
export const CSRF_HEADER_VALUE = "1";

/** Codes `apiCall` produces itself, next to the server's stable codes. */
export const CLIENT_ERROR_CODES = {
  /** `fetch` failed: offline, DNS, CORS, connection reset. */
  NETWORK: "NETWORK",
  /** The response wasn't JSON or didn't match the envelope. */
  BAD_RESPONSE: "BAD_RESPONSE",
  /** The caller's `signal` aborted the request; usually not shown to the user. */
  ABORTED: "ABORTED",
  /** `body` couldn't be serialized to JSON (e.g. a cycle or a BigInt). */
  INVALID_BODY: "INVALID_BODY",
} as const;

export const CLIENT_ERROR_MESSAGES = {
  NETWORK: "Can't reach the server. Check your connection and try again.",
  BAD_RESPONSE: "The server sent an unexpected response. Try again later.",
  ABORTED: "The request was cancelled.",
  INVALID_BODY: "The request could not be prepared.",
} as const satisfies Record<keyof typeof CLIENT_ERROR_CODES, string>;

/** `status` for failures that never got an HTTP response. */
export const NO_RESPONSE_STATUS = 0;

const JSON_CONTENT_TYPE = "application/json";
const ABORT_ERROR_NAME = "AbortError";

export type FieldErrors = Record<string, string[]>;

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: FieldErrors;
  details?: Record<string, unknown>;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: ApiErrorBody };

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiCallOptions {
  /** Defaults to `POST` when a `body` is given, `GET` otherwise. */
  method?: ApiMethod;
  /** Serialized with `JSON.stringify`; omit for no body. */
  body?: unknown;
  signal?: AbortSignal;
}

type ClientErrorCode = keyof typeof CLIENT_ERROR_CODES;

function failure(code: ClientErrorCode, status = NO_RESPONSE_STATUS): ApiResult<never> {
  return { ok: false, status, error: { code: CLIENT_ERROR_CODES[code], message: CLIENT_ERROR_MESSAGES[code] } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFieldErrors(value: unknown): value is FieldErrors {
  return (
    isRecord(value) &&
    Object.values(value).every((messages) => Array.isArray(messages) && messages.every((m) => typeof m === "string"))
  );
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.message === "string" &&
    (value.fieldErrors === undefined || isFieldErrors(value.fieldErrors)) &&
    (value.details === undefined || isRecord(value.details))
  );
}

function isAbort(error: unknown, signal: AbortSignal | undefined): boolean {
  // Not `instanceof Error`: a DOMException isn't an Error in every environment.
  return signal?.aborted === true || (typeof error === "object" && error !== null && "name" in error && error.name === ABORT_ERROR_NAME);
}

/** A success envelope on an error status (or the reverse) is treated as malformed. */
function toResult<T>(response: Response, payload: unknown): ApiResult<T> {
  if (!isRecord(payload)) return failure("BAD_RESPONSE", response.status);
  if (payload.ok === true && response.ok && "data" in payload) return { ok: true, data: payload.data as T };
  if (payload.ok === false && !response.ok && isErrorBody(payload.error)) {
    return { ok: false, status: response.status, error: payload.error };
  }
  return failure("BAD_RESPONSE", response.status);
}

function serialize(body: unknown): string | undefined {
  return body === undefined ? undefined : JSON.stringify(body);
}

export async function apiCall<T>(path: string, options: ApiCallOptions = {}): Promise<ApiResult<T>> {
  const { body, signal } = options;
  const method = options.method ?? (body === undefined ? "GET" : "POST");

  let serialized: string | undefined;
  try {
    serialized = serialize(body);
  } catch {
    return failure("INVALID_BODY");
  }

  const headers: Record<string, string> = { accept: JSON_CONTENT_TYPE, [CSRF_HEADER]: CSRF_HEADER_VALUE };
  if (serialized !== undefined) headers["content-type"] = JSON_CONTENT_TYPE;

  let response: Response;
  let text: string;
  try {
    response = await fetch(path, { method, headers, body: serialized, signal, credentials: "same-origin" });
    text = await response.text();
  } catch (error) {
    return failure(isAbort(error, signal) ? "ABORTED" : "NETWORK");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return failure("BAD_RESPONSE", response.status);
  }
  return toResult<T>(response, payload);
}
