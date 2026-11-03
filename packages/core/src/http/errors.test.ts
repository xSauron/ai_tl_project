import { describe, expect, it } from "vitest";

import {
  AiUnavailableError,
  AppError,
  ConflictError,
  ERROR_CODES,
  ForbiddenError,
  isAppError,
  NotFoundError,
  PayloadTooLargeError,
  RateLimitedError,
  UnauthorizedError,
  ValidationError,
  type ErrorOverrides,
  type JsonObject,
} from "./errors.ts";

type Factory = (overrides?: ErrorOverrides) => AppError;

const SUBCLASSES: { name: string; create: Factory; ctor: abstract new (...args: never[]) => AppError; status: number; code: string }[] = [
  { name: "NotFoundError", create: (o) => new NotFoundError(o), ctor: NotFoundError, status: 404, code: "NOT_FOUND" },
  { name: "UnauthorizedError", create: (o) => new UnauthorizedError(o), ctor: UnauthorizedError, status: 401, code: "UNAUTHORIZED" },
  { name: "ForbiddenError", create: (o) => new ForbiddenError(o), ctor: ForbiddenError, status: 403, code: "FORBIDDEN" },
  {
    name: "ValidationError",
    create: (o) => new ValidationError(o?.fieldErrors, o),
    ctor: ValidationError,
    status: 422,
    code: "VALIDATION_FAILED",
  },
  { name: "ConflictError", create: (o) => new ConflictError(o), ctor: ConflictError, status: 409, code: "CONFLICT" },
  { name: "RateLimitedError", create: (o) => new RateLimitedError(30, o), ctor: RateLimitedError, status: 429, code: "RATE_LIMITED" },
  { name: "AiUnavailableError", create: (o) => new AiUnavailableError(o), ctor: AiUnavailableError, status: 503, code: "AI_UNAVAILABLE" },
  {
    name: "PayloadTooLargeError",
    create: (o) => new PayloadTooLargeError(o),
    ctor: PayloadTooLargeError,
    status: 413,
    code: "PAYLOAD_TOO_LARGE",
  },
];

describe("AppError subclasses", () => {
  it.each(SUBCLASSES)("$name defaults to $status / $code", ({ name, create, ctor, status, code }) => {
    const error = create();

    expect(error.status).toBe(status);
    expect(error.code).toBe(code);
    expect(error.name).toBe(name);
    expect(error.message).not.toBe("");
    expect(error).toBeInstanceOf(ctor);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(isAppError(error)).toBe(true);
  });

  it.each(SUBCLASSES)("$name accepts a code and message override and keeps its status", ({ create, status }) => {
    const error = create({ code: "CUSTOM_CODE", message: "Custom message." });

    expect(error.code).toBe("CUSTOM_CODE");
    expect(error.message).toBe("Custom message.");
    expect(error.status).toBe(status);
  });

  it.each(SUBCLASSES)("$name default message leaks nothing request-specific", ({ create }) => {
    const { message } = create();

    expect(message).not.toMatch(/[0-9a-f]{8}-|@|stack|sql/i);
  });

  it.each([
    { create: () => new ForbiddenError({ code: ERROR_CODES.CSRF_REJECTED }), status: 403, code: "CSRF_REJECTED" },
    { create: () => new ConflictError({ code: ERROR_CODES.LIMIT_REACHED }), status: 409, code: "LIMIT_REACHED" },
    { create: () => new ConflictError({ code: "STALE_VERSION" }), status: 409, code: "STALE_VERSION" },
    { create: () => new UnauthorizedError({ code: ERROR_CODES.INVALID_CREDENTIALS }), status: 401, code: "INVALID_CREDENTIALS" },
    { create: () => new ValidationError(undefined, { code: ERROR_CODES.REGISTRATION_FAILED }), status: 422, code: "REGISTRATION_FAILED" },
  ])("explicit spec code $code keeps status $status", ({ create, status, code }) => {
    const error = create();

    expect(error.code).toBe(code);
    expect(error.status).toBe(status);
  });
});

describe("AppError", () => {
  it("can be constructed directly with any status", () => {
    const error = new AppError("TEAPOT", "Short and stout.", { status: 418 });

    expect(error.name).toBe("AppError");
    expect(error.status).toBe(418);
    expect(error.cause).toBeUndefined();
    expect(error.toEnvelopeError()).toEqual({ code: "TEAPOT", message: "Short and stout." });
  });

  it("keeps the cause for logs without serializing it", () => {
    const cause = new Error("db password=hunter2");
    const error = new NotFoundError({ cause });

    expect(error.cause).toBe(cause);
    const json = JSON.stringify(error);
    expect(json).not.toContain("hunter2");
    expect(json).not.toContain("stack");
    expect(json).not.toContain("cause");
  });
});

describe("toEnvelopeError / toJSON", () => {
  it("omits undefined optional keys", () => {
    const envelope = new NotFoundError().toEnvelopeError();

    expect(Object.keys(envelope)).toEqual(["code", "message"]);
  });

  it("includes fieldErrors keyed by dotted path", () => {
    const fieldErrors = { name: ["Required"], "beds.0.rows": ["Too large", "Must be an integer"] };
    const error = new ValidationError(fieldErrors);

    expect(error.fieldErrors).toBe(fieldErrors);
    expect(error.toEnvelopeError()).toEqual({
      code: "VALIDATION_FAILED",
      message: "The request is invalid.",
      fieldErrors,
    });
  });

  it("round-trips details through JSON unchanged", () => {
    const details: JsonObject = {
      currentVersion: 7,
      cells: [
        { row: 0, col: 1 },
        { row: 2, col: 3 },
      ],
      isPartial: false,
      note: null,
    };
    const error = new ConflictError({ code: "STALE_VERSION", details });

    const parsed: unknown = JSON.parse(JSON.stringify(error));

    expect(parsed).toEqual({ code: "STALE_VERSION", message: error.message, details });
    expect(error.toJSON()).toEqual(error.toEnvelopeError());
  });

  it("serializes only the envelope keys", () => {
    const error = new ValidationError({ a: ["b"] }, { details: { hint: "x" }, cause: new Error("secret") });

    expect(Object.keys(error.toJSON()).sort()).toEqual(["code", "details", "fieldErrors", "message"]);
  });
});

describe("RateLimitedError", () => {
  it.each([
    { input: 30, expected: 30 },
    { input: 0.2, expected: 1 },
    { input: 59.01, expected: 60 },
    { input: 0, expected: 0 },
    { input: -5, expected: 0 },
  ])("rounds retryAfterSec $input up to $expected and exposes it in details", ({ input, expected }) => {
    const error = new RateLimitedError(input);

    expect(error.retryAfterSec).toBe(expected);
    expect(error.toEnvelopeError().details).toEqual({ retryAfterSec: expected });
  });
});

describe("isAppError", () => {
  it.each([
    { value: new Error("plain"), expected: false },
    { value: { code: "NOT_FOUND", status: 404, message: "fake" }, expected: false },
    { value: "NOT_FOUND", expected: false },
    { value: null, expected: false },
    { value: undefined, expected: false },
    { value: new AppError("X", "y", { status: 400 }), expected: true },
  ])("returns $expected for %#", ({ value, expected }) => {
    expect(isAppError(value)).toBe(expected);
  });
});

describe("ERROR_CODES", () => {
  it("maps every code to itself in SCREAMING_SNAKE case", () => {
    for (const [key, value] of Object.entries(ERROR_CODES)) {
      expect(value).toBe(key);
      expect(value).toMatch(/^[A-Z]+(_[A-Z]+)*$/);
    }
  });

  it("lists the codes this spec uses", () => {
    expect(Object.keys(ERROR_CODES).sort()).toEqual(
      [
        "AI_UNAVAILABLE",
        "CONFLICT",
        "CSRF_REJECTED",
        "FORBIDDEN",
        "INTERNAL",
        "INVALID_CREDENTIALS",
        "LIMIT_REACHED",
        "NOT_FOUND",
        "PAYLOAD_TOO_LARGE",
        "RATE_LIMITED",
        "REGISTRATION_FAILED",
        "UNAUTHORIZED",
        "VALIDATION_FAILED",
      ].sort(),
    );
  });
});
