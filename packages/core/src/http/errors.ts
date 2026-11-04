/**
 * Typed application errors. Services throw these; `apiHandler` maps them to
 * an HTTP status and the error envelope `{ code, message, fieldErrors?, details? }`.
 * Clients switch on `code` (a stable SCREAMING_SNAKE string), never on `message`.
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

/** Field messages keyed by dotted path, e.g. `{ "beds.0.name": ["Required"] }`. */
export type FieldErrors = Record<string, string[]>;

/** Codes used by the app-primitives spec. Feature specs add their own. */
export const ERROR_CODES = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CSRF_REJECTED: "CSRF_REJECTED",
  REGISTRATION_FAILED: "REGISTRATION_FAILED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  LIMIT_REACHED: "LIMIT_REACHED",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  INTERNAL: "INTERNAL",
} as const;

export type KnownErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
} as const;

export interface AppErrorOptions {
  status: number;
  fieldErrors?: FieldErrors;
  details?: JsonObject;
  /** Kept for server logs only; never serialized. */
  cause?: unknown;
}

/** Per-instance overrides accepted by every subclass. */
export interface ErrorOverrides {
  code?: string;
  message?: string;
  fieldErrors?: FieldErrors;
  details?: JsonObject;
  cause?: unknown;
}

/** The `error` member of the `{ ok: false, error }` envelope. */
export interface EnvelopeError {
  code: string;
  message: string;
  fieldErrors?: FieldErrors;
  details?: JsonObject;
}

export class AppError extends Error {
  override name = "AppError";
  readonly code: string;
  readonly status: number;
  readonly fieldErrors: FieldErrors | undefined;
  readonly details: JsonObject | undefined;

  constructor(code: string, message: string, options: AppErrorOptions) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.code = code;
    this.status = options.status;
    this.fieldErrors = options.fieldErrors;
    this.details = options.details;
  }

  /** The client-safe shape: no stack, no cause, undefined keys omitted. */
  toEnvelopeError(): EnvelopeError {
    const envelope: EnvelopeError = { code: this.code, message: this.message };
    if (this.fieldErrors !== undefined) envelope.fieldErrors = this.fieldErrors;
    if (this.details !== undefined) envelope.details = this.details;
    return envelope;
  }

  /** Makes `JSON.stringify(error)` safe as well. */
  toJSON(): EnvelopeError {
    return this.toEnvelopeError();
  }
}

function buildOptions(status: number, overrides: ErrorOverrides): AppErrorOptions {
  return {
    status,
    fieldErrors: overrides.fieldErrors,
    details: overrides.details,
    cause: overrides.cause,
  };
}

export class NotFoundError extends AppError {
  override name = "NotFoundError";

  constructor(overrides: ErrorOverrides = {}) {
    super(
      overrides.code ?? ERROR_CODES.NOT_FOUND,
      overrides.message ?? "The requested resource was not found.",
      buildOptions(HTTP_STATUS.NOT_FOUND, overrides),
    );
  }
}

export class UnauthorizedError extends AppError {
  override name = "UnauthorizedError";

  constructor(overrides: ErrorOverrides = {}) {
    super(
      overrides.code ?? ERROR_CODES.UNAUTHORIZED,
      overrides.message ?? "Authentication is required.",
      buildOptions(HTTP_STATUS.UNAUTHORIZED, overrides),
    );
  }
}

export class ForbiddenError extends AppError {
  override name = "ForbiddenError";

  constructor(overrides: ErrorOverrides = {}) {
    super(
      overrides.code ?? ERROR_CODES.FORBIDDEN,
      overrides.message ?? "You are not allowed to perform this action.",
      buildOptions(HTTP_STATUS.FORBIDDEN, overrides),
    );
  }
}

export class ValidationError extends AppError {
  override name = "ValidationError";

  constructor(fieldErrors?: FieldErrors, overrides: Omit<ErrorOverrides, "fieldErrors"> = {}) {
    super(
      overrides.code ?? ERROR_CODES.VALIDATION_FAILED,
      overrides.message ?? "The request is invalid.",
      buildOptions(HTTP_STATUS.UNPROCESSABLE_CONTENT, { ...overrides, fieldErrors }),
    );
  }
}

export class ConflictError extends AppError {
  override name = "ConflictError";

  constructor(overrides: ErrorOverrides = {}) {
    super(
      overrides.code ?? ERROR_CODES.CONFLICT,
      overrides.message ?? "The request conflicts with the current state.",
      buildOptions(HTTP_STATUS.CONFLICT, overrides),
    );
  }
}

export class RateLimitedError extends AppError {
  override name = "RateLimitedError";
  /** Whole seconds until a retry may succeed; `apiHandler` sends it as `Retry-After`. */
  readonly retryAfterSec: number;

  constructor(retryAfterSec: number, overrides: Omit<ErrorOverrides, "details"> = {}) {
    const wholeSeconds = Math.max(0, Math.ceil(retryAfterSec));
    super(
      overrides.code ?? ERROR_CODES.RATE_LIMITED,
      overrides.message ?? "Too many requests. Try again later.",
      buildOptions(HTTP_STATUS.TOO_MANY_REQUESTS, { ...overrides, details: { retryAfterSec: wholeSeconds } }),
    );
    this.retryAfterSec = wholeSeconds;
  }
}

export class AiUnavailableError extends AppError {
  override name = "AiUnavailableError";

  constructor(overrides: ErrorOverrides = {}) {
    super(
      overrides.code ?? ERROR_CODES.AI_UNAVAILABLE,
      overrides.message ?? "The assistant is unavailable. Try again later.",
      buildOptions(HTTP_STATUS.SERVICE_UNAVAILABLE, overrides),
    );
  }
}

export class PayloadTooLargeError extends AppError {
  override name = "PayloadTooLargeError";

  constructor(overrides: ErrorOverrides = {}) {
    super(
      overrides.code ?? ERROR_CODES.PAYLOAD_TOO_LARGE,
      overrides.message ?? "The request body is too large.",
      buildOptions(HTTP_STATUS.PAYLOAD_TOO_LARGE, overrides),
    );
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
