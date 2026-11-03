import { Writable } from "node:stream";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { RequestCradle } from "../container/cradle.ts";
import { createLogger, REQUEST_ID_HEADER } from "../logger.ts";
import { idParamsSchema } from "../validators/common/id-params.schema.ts";
import { MAX_JSON_BODY_BYTES } from "../validators/limits.ts";
import {
  apiHandler,
  createApiHandler,
  CSRF_HEADER,
  CSRF_HEADER_VALUE,
  INTERNAL_ERROR_MESSAGE,
  INVALID_JSON_MESSAGE,
  ROOT_FIELD_ERROR_KEY,
  type ApiRouteContext,
  type ResolveActor,
  type WithScope,
} from "./apiHandler.ts";
import { issueSessionCookie, SESSION_COOKIE, type Actor } from "./auth.ts";
import { InMemoryRateLimiter } from "./rate-limit.ts";
import {
  AiUnavailableError,
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  PayloadTooLargeError,
  RateLimitedError,
  UnauthorizedError,
  ValidationError,
} from "./errors.ts";

vi.mock("../container/scope.ts", () => ({
  withScope: vi.fn(async () => {
    throw new Error("the real withScope must not run in unit tests");
  }),
}));

// The default `apiHandler` logs through the process logger; keep test output clean.
beforeAll(() => {
  vi.stubEnv("LOG_LEVEL", "silent");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

const ACTOR: Actor = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };
const VALID_ID = "0b6e2f5e-3c1d-4a8b-9f7e-2d4c6b8a0e1f";
const URL_BASE = "http://localhost/api/things";
const CSRF = { [CSRF_HEADER]: CSRF_HEADER_VALUE };

// Fresh limiter per test file run; rate-limit tests use their own keys or their own setup().
const cradle = { gardenService: {}, rateLimiter: new InMemoryRateLimiter() } as unknown as RequestCradle;

function setup({ actor = ACTOR as Actor | null } = {}) {
  const chunks: string[] = [];
  const destination = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  const parent = createLogger({ level: "info", destination });
  const scopeCalls = vi.fn();
  const withScope: WithScope = async (fn) => {
    scopeCalls();
    return fn(cradle);
  };
  const resolveActor = vi.fn<ResolveActor>(async () => actor);
  const handle = createApiHandler({ resolveActor, withScope, getLogger: () => parent });
  const logs = () =>
    chunks
      .join("")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
  return { handle, withScope: scopeCalls, resolveActor, logs };
}

function routeCtx(params: Record<string, string | string[]>): ApiRouteContext {
  return { params: Promise.resolve(params) };
}

async function json(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

function post(body: RequestInit["body"], headers: Record<string, string> = {}, url = URL_BASE): Request {
  return new Request(url, { method: "POST", body, headers: { ...CSRF, ...headers } });
}

/** A body stream with no `content-length`, like a chunked upload. */
function streamOf(...parts: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  });
}

function streamedPost(stream: ReadableStream<Uint8Array>): Request {
  return new Request(URL_BASE, { method: "POST", body: stream, headers: CSRF, duplex: "half" } as RequestInit);
}

describe("apiHandler error mapping", () => {
  it.each([
    [new NotFoundError(), 404, "NOT_FOUND"],
    [new UnauthorizedError(), 401, "UNAUTHORIZED"],
    [new ForbiddenError(), 403, "FORBIDDEN"],
    [new ValidationError({ name: ["Required"] }), 422, "VALIDATION_FAILED"],
    [new ConflictError({ code: "STALE_VERSION" }), 409, "STALE_VERSION"],
    [new RateLimitedError(30), 429, "RATE_LIMITED"],
    [new AiUnavailableError(), 503, "AI_UNAVAILABLE"],
    [new PayloadTooLargeError(), 413, "PAYLOAD_TOO_LARGE"],
    [new AppError("CUSTOM", "Custom failure", { status: 418 }), 418, "CUSTOM"],
  ])("%s → %i %s with the error envelope", async (error, status, code) => {
    const { handle } = setup();
    const route = handle({ auth: "required" }, async () => {
      throw error;
    });

    const response = await route(new Request(URL_BASE));

    expect(response.status).toBe(status);
    expect(response.headers.get("content-type")).toBe("application/json");
    const payload = await json(response);
    expect(payload).toEqual({ ok: false, error: error.toEnvelopeError() });
    expect((payload.error as { code: string }).code).toBe(code);
  });

  it("sends Retry-After for a RateLimitedError and no Retry-After otherwise", async () => {
    const { handle } = setup();
    const limited = await handle({ auth: "public" }, async () => {
      throw new RateLimitedError(12.2);
    })(new Request(URL_BASE));
    const notFound = await handle({ auth: "public" }, async () => {
      throw new NotFoundError();
    })(new Request(URL_BASE));

    expect(limited.headers.get("retry-after")).toBe("13");
    expect(notFound.headers.get("retry-after")).toBeNull();
  });

  it("maps an unknown error to 500 INTERNAL without leaking its message or stack, and logs it with the requestId", async () => {
    const { handle, logs } = setup();
    const route = handle({ auth: "required" }, async () => {
      throw new Error("db password is hunter2");
    });

    const response = await route(new Request(URL_BASE, { headers: { [REQUEST_ID_HEADER]: "req-500" } }));

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ ok: false, error: { code: "INTERNAL", message: INTERNAL_ERROR_MESSAGE } });
    expect(text).not.toContain("hunter2");
    expect(text).not.toContain("stack");

    const errorLine = logs().find((line) => line.level === 50);
    expect(errorLine).toMatchObject({ requestId: "req-500", err: { message: "db password is hunter2" } });
    expect((errorLine?.err as { stack: string }).stack).toContain("apiHandler.test.ts");
  });
});

describe("apiHandler CSRF", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE", "OPTIONS"])(
    "rejects %s without the CSRF header with 403 CSRF_REJECTED, even with an actor",
    async (method) => {
      const { handle, resolveActor, withScope } = setup();
      const handler = vi.fn(async () => "never");

      const response = await handle({ auth: "required" }, handler)(new Request(URL_BASE, { method }));

      expect(response.status).toBe(403);
      expect(await json(response)).toMatchObject({ ok: false, error: { code: "CSRF_REJECTED" } });
      expect(resolveActor).not.toHaveBeenCalled();
      expect(withScope).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    },
  );

  it("rejects a CSRF header with the wrong value", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "public" }, async () => "x")(
      new Request(URL_BASE, { method: "DELETE", headers: { [CSRF_HEADER]: "yes" } }),
    );

    expect(response.status).toBe(403);
  });

  it.each(["GET", "HEAD"])("lets %s through without the CSRF header", async (method) => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async () => "fine")(new Request(URL_BASE, { method }));

    expect(response.status).toBe(200);
  });

  it("lets a state-changing request with the CSRF header through", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async () => "deleted")(
      new Request(URL_BASE, { method: "DELETE", headers: CSRF }),
    );

    expect(await json(response)).toEqual({ ok: true, data: "deleted" });
  });
});

describe("apiHandler auth", () => {
  it("returns 401 UNAUTHORIZED on a required route when there is no actor", async () => {
    const { handle, withScope } = setup({ actor: null });
    const response = await handle({ auth: "required" }, async () => "secret")(new Request(URL_BASE));

    expect(response.status).toBe(401);
    expect(await json(response)).toMatchObject({ ok: false, error: { code: "UNAUTHORIZED" } });
    expect(withScope).not.toHaveBeenCalled();
  });

  it("passes the resolved actor to a required route", async () => {
    const { handle, resolveActor } = setup();
    const request = new Request(URL_BASE);
    const response = await handle({ auth: "required" }, async ({ actor }) => actor.userId)(request);

    expect(resolveActor).toHaveBeenCalledWith(request);
    expect(await json(response)).toEqual({ ok: true, data: ACTOR.userId });
  });

  it.each([
    ["no actor", null],
    ["an actor", ACTOR],
  ])("runs a public route with %s", async (_label, actor) => {
    const { handle } = setup({ actor });
    const response = await handle({ auth: "public" }, async (ctx) => ({ actor: ctx.actor }))(new Request(URL_BASE));

    expect(await json(response)).toEqual({ ok: true, data: { actor } });
  });

  it("the default apiHandler fails closed: a required route without a session cookie is 401", async () => {
    const handler = vi.fn(async () => "secret");
    const response = await apiHandler({ auth: "required" }, handler)(new Request(URL_BASE));

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("the default apiHandler resolves the actor from a valid session cookie", async () => {
    vi.stubEnv("JWT_SECRET", "s".repeat(32));
    const cookie = (await issueSessionCookie(ACTOR.userId)).split(";")[0] ?? "";
    const request = new Request(URL_BASE, { headers: { cookie } });

    const response = await apiHandler({ auth: "required" }, async () => "ok")(request);

    // Past the 401: it reached the (mocked, throwing) real withScope.
    expect(cookie.startsWith(`${SESSION_COOKIE}=`)).toBe(true);
    expect(response.status).toBe(500);
    vi.stubEnv("JWT_SECRET", "");
  });

  it("the default apiHandler runs through the real withScope", async () => {
    const response = await apiHandler({ auth: "public" }, async () => "ok")(new Request(URL_BASE));

    // The mocked real withScope throws a plain Error, which proves it was the one called.
    expect(response.status).toBe(500);
  });
});

describe("apiHandler params", () => {
  it("awaits the params Promise and passes the parsed value", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required", params: idParamsSchema }, async ({ params }) => params.id)(
      new Request(URL_BASE),
      routeCtx({ id: VALID_ID }),
    );

    expect(await json(response)).toEqual({ ok: true, data: VALID_ID });
  });

  it("returns 422 with fieldErrors on a malformed id", async () => {
    const { handle, withScope } = setup();
    const response = await handle({ auth: "required", params: idParamsSchema }, async () => "never")(
      new Request(URL_BASE),
      routeCtx({ id: "not-a-uuid" }),
    );

    expect(response.status).toBe(422);
    expect(await json(response)).toEqual({
      ok: false,
      error: { code: "VALIDATION_FAILED", message: "The request is invalid.", fieldErrors: { id: ["Must be a valid UUID"] } },
    });
    expect(withScope).not.toHaveBeenCalled();
  });

  it("parses an empty object when the route passes no context", async () => {
    const { handle } = setup();
    const response = await handle(
      { auth: "public", params: z.object({ id: z.string().optional() }) },
      async ({ params }) => params,
    )(new Request(URL_BASE));

    expect(await json(response)).toEqual({ ok: true, data: {} });
  });

  it("leaves params, query and body undefined when no schema is given", async () => {
    const { handle } = setup();
    const handler = vi.fn(async () => null);
    await handle({ auth: "public" }, handler)(post('{"x":1}', {}, `${URL_BASE}?a=1`), routeCtx({ id: VALID_ID }));

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ params: undefined, query: undefined, body: undefined }),
    );
  });
});

describe("apiHandler query", () => {
  const querySchema = z.object({
    q: z.string(),
    tag: z.array(z.string()).optional(),
    limit: z.coerce.number().int().max(50).optional(),
  });

  it.each([
    ["single values become strings", "?q=tomato&limit=5", { q: "tomato", limit: 5 }],
    ["a repeated key becomes an array", "?q=x&tag=a&tag=b", { q: "x", tag: ["a", "b"] }],
    ["a key repeated three times keeps every value", "?q=x&tag=a&tag=b&tag=c", { q: "x", tag: ["a", "b", "c"] }],
  ])("%s", async (_label, search, expected) => {
    const { handle } = setup();
    const response = await handle({ auth: "public", query: querySchema }, async ({ query }) => query)(
      new Request(`${URL_BASE}${search}`),
    );

    expect(await json(response)).toEqual({ ok: true, data: expected });
  });

  it("returns 422 with fieldErrors for an invalid query", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "public", query: querySchema }, async () => "never")(
      new Request(`${URL_BASE}?limit=500`),
    );

    expect(response.status).toBe(422);
    const { error } = (await json(response)) as { error: { fieldErrors: Record<string, string[]> } };
    expect(Object.keys(error.fieldErrors).sort()).toEqual(["limit", "q"]);
  });
});

describe("apiHandler body", () => {
  const bodySchema = z.object({
    name: z.string().min(1),
    beds: z.array(z.object({ rows: z.number().int().positive() })).optional(),
  });

  it("parses a valid JSON body", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required", body: bodySchema }, async ({ body }) => body)(
      post(JSON.stringify({ name: "Plot", beds: [{ rows: 4 }] })),
    );

    expect(await json(response)).toEqual({ ok: true, data: { name: "Plot", beds: [{ rows: 4 }] } });
  });

  it("parses a valid body streamed in several chunks", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required", body: bodySchema }, async ({ body }) => body.name)(
      streamedPost(streamOf('{"na', 'me":"Pl', 'ot"}')),
    );

    expect(await json(response)).toEqual({ ok: true, data: "Plot" });
  });

  it.each([
    ["malformed JSON", "{name:"],
    ["an empty body", ""],
    ["invalid UTF-8", new Uint8Array([0x7b, 0xff, 0x7d])],
  ])("returns 422 VALIDATION_FAILED for %s", async (_label, body) => {
    const { handle, withScope } = setup();
    const response = await handle({ auth: "required", body: bodySchema }, async () => "never")(post(body));

    expect(response.status).toBe(422);
    expect(await json(response)).toEqual({
      ok: false,
      error: { code: "VALIDATION_FAILED", message: INVALID_JSON_MESSAGE },
    });
    expect(withScope).not.toHaveBeenCalled();
  });

  it("returns 422 for a request with no body at all", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required", body: bodySchema }, async () => "never")(post(null));

    expect(response.status).toBe(422);
    expect(await json(response)).toMatchObject({ error: { message: INVALID_JSON_MESSAGE } });
  });

  it("returns 413 when content-length exceeds the limit, without reading the body", async () => {
    const { handle } = setup();
    const request = post('{"name":"x"}', { "content-length": String(MAX_JSON_BODY_BYTES + 1) });

    const response = await handle({ auth: "required", body: bodySchema }, async () => "never")(request);

    expect(response.status).toBe(413);
    expect(await json(response)).toMatchObject({ ok: false, error: { code: "PAYLOAD_TOO_LARGE" } });
    expect(request.bodyUsed).toBe(false);
  });

  it("returns 413 for an oversized streamed body with no content-length", async () => {
    const { handle } = setup();
    const half = "x".repeat(MAX_JSON_BODY_BYTES / 2);
    const request = streamedPost(streamOf('{"name":"', half, half, '"}'));
    expect(request.headers.get("content-length")).toBeNull();

    const response = await handle({ auth: "required", body: bodySchema }, async () => "never")(request);

    expect(response.status).toBe(413);
  });

  it("accepts a body of exactly the limit", async () => {
    const { handle } = setup();
    const padding = "x".repeat(MAX_JSON_BODY_BYTES - '{"name":""}'.length);
    const response = await handle({ auth: "required", body: bodySchema }, async ({ body }) => body.name.length)(
      post(JSON.stringify({ name: padding })),
    );

    expect(await json(response)).toEqual({ ok: true, data: padding.length });
  });

  it("keys Zod issues by dotted path, including array indices", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required", body: bodySchema }, async () => "never")(
      post(JSON.stringify({ name: "", beds: [{ rows: -1 }] })),
    );

    expect(response.status).toBe(422);
    const { error } = (await json(response)) as { error: { fieldErrors: Record<string, string[]> } };
    expect(Object.keys(error.fieldErrors).sort()).toEqual(["beds.0.rows", "name"]);
  });

  it("collects several issues on one path under the same key", async () => {
    const { handle } = setup();
    const schema = z.object({ code: z.string().min(5).regex(/^\d+$/) });
    const response = await handle({ auth: "required", body: schema }, async () => "never")(
      post(JSON.stringify({ code: "ab" })),
    );

    const { error } = (await json(response)) as { error: { fieldErrors: Record<string, string[]> } };
    expect(error.fieldErrors.code).toHaveLength(2);
  });

  it(`keys a whole-body issue under "${ROOT_FIELD_ERROR_KEY}"`, async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required", body: bodySchema }, async () => "never")(post("[1,2]"));

    const { error } = (await json(response)) as { error: { fieldErrors: Record<string, string[]> } };
    expect(Object.keys(error.fieldErrors)).toEqual([ROOT_FIELD_ERROR_KEY]);
  });

  it("supports async refinements in schemas", async () => {
    const { handle } = setup();
    const schema = z.object({ name: z.string() }).refine(async (value) => value.name !== "taken", {
      path: ["name"],
      message: "Taken",
    });
    const response = await handle({ auth: "required", body: schema }, async () => "never")(
      post(JSON.stringify({ name: "taken" })),
    );

    expect(await json(response)).toMatchObject({ error: { fieldErrors: { name: ["Taken"] } } });
  });
});

describe("apiHandler success envelope", () => {
  it("uses successStatus when given", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required", successStatus: 201 }, async () => ({ id: VALID_ID }))(
      new Request(URL_BASE),
    );

    expect(response.status).toBe(201);
    expect(await json(response)).toEqual({ ok: true, data: { id: VALID_ID } });
  });

  it("defaults to 200 and application/json", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async () => [1, 2])(new Request(URL_BASE));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
  });

  it("turns undefined data into null", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async () => undefined)(new Request(URL_BASE));

    expect(await json(response)).toEqual({ ok: true, data: null });
  });

  it("runs the handler inside withScope and hands it the scope's cradle", async () => {
    const { handle, withScope } = setup();
    const handler = vi.fn(async ({ cradle: received }: { cradle: RequestCradle }) => received === cradle);

    const response = await handle({ auth: "required" }, handler)(new Request(URL_BASE));

    expect(withScope).toHaveBeenCalledOnce();
    expect(await json(response)).toEqual({ ok: true, data: true });
  });

  it("passes the original request and a logger tagged with the requestId", async () => {
    const { handle, logs } = setup();
    const request = new Request(URL_BASE, { headers: { [REQUEST_ID_HEADER]: "req-ctx" } });

    await handle({ auth: "required" }, async ({ req, log }) => {
      expect(req).toBe(request);
      log.warn("from handler");
    })(request);

    expect(logs().find((line) => line.msg === "from handler")).toMatchObject({ requestId: "req-ctx" });
  });
});

describe("apiHandler request id and logging", () => {
  it("echoes a valid incoming x-request-id on success and error responses", async () => {
    const { handle } = setup();
    const ok = await handle({ auth: "required" }, async () => 1)(
      new Request(URL_BASE, { headers: { [REQUEST_ID_HEADER]: "abc-123" } }),
    );
    const failed = await handle({ auth: "required" }, async () => {
      throw new NotFoundError();
    })(new Request(URL_BASE, { headers: { [REQUEST_ID_HEADER]: "abc-456" } }));

    expect(ok.headers.get(REQUEST_ID_HEADER)).toBe("abc-123");
    expect(failed.headers.get(REQUEST_ID_HEADER)).toBe("abc-456");
  });

  it("generates a fresh id when the incoming one is unsafe", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async () => 1)(
      new Request(URL_BASE, { headers: { [REQUEST_ID_HEADER]: "bad id\twith tab" } }),
    );

    expect(response.headers.get(REQUEST_ID_HEADER)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("sets x-request-id on a CSRF rejection too", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async () => 1)(
      new Request(URL_BASE, { method: "POST", headers: { [REQUEST_ID_HEADER]: "csrf-1" } }),
    );

    expect(response.headers.get(REQUEST_ID_HEADER)).toBe("csrf-1");
  });

  it("logs one info line per request with method, path, status and duration, and no body or headers", async () => {
    const { handle, logs } = setup();
    const secretBody = JSON.stringify({ name: "Plot", password: "hunter2" });

    await handle({ auth: "required", body: z.object({ name: z.string() }) }, async () => "ok")(
      post(secretBody, { [REQUEST_ID_HEADER]: "log-1", cookie: "session=abc" }, `${URL_BASE}?q=secret-query`),
    );

    const infoLines = logs().filter((line) => line.level === 30);
    expect(infoLines).toHaveLength(1);
    const line = infoLines[0];
    expect(line).toMatchObject({ requestId: "log-1", method: "POST", path: "/api/things", status: 200 });
    expect(typeof line?.durationMs).toBe("number");
    const raw = JSON.stringify(line);
    expect(raw).not.toContain("hunter2");
    expect(raw).not.toContain("session=abc");
    expect(raw).not.toContain("secret-query");
  });

  it("logs the error status on a failed request", async () => {
    const { handle, logs } = setup({ actor: null });
    await handle({ auth: "required" }, async () => "never")(new Request(URL_BASE));

    expect(logs().find((line) => line.level === 30)).toMatchObject({ status: 401 });
  });
});

describe("apiHandler rate limits", () => {
  const LOGIN_BODY = z.object({ email: z.string() });
  const post = (email: string, extra: Record<string, string> = {}) =>
    new Request(URL_BASE, { method: "POST", headers: { ...CSRF, ...extra }, body: JSON.stringify({ email }) });

  it("allows requests up to the limit per key, then answers 429 with Retry-After", async () => {
    const { handle } = setup({ actor: null });
    const handler = vi.fn(async () => "ok");
    const route = handle(
      {
        auth: "public",
        body: LOGIN_BODY,
        rateLimit: [{ name: "login-a", limit: 2, windowMs: 60_000, keys: ({ body }) => [body.email] }],
      },
      handler,
    );

    expect((await route(post("ala@example.com"))).status).toBe(200);
    expect((await route(post("ala@example.com"))).status).toBe(200);
    const limited = await route(post("ala@example.com"));
    expect((await route(post("ola@example.com"))).status).toBe(200);

    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("60");
    expect(await json(limited)).toMatchObject({ ok: false, error: { code: "RATE_LIMITED" } });
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it("checks every rule and key, skipping null keys", async () => {
    const { handle } = setup({ actor: null });
    const route = handle(
      {
        auth: "public",
        body: LOGIN_BODY,
        rateLimit: [
          { name: "login-b-email", limit: 5, windowMs: 60_000, keys: ({ body }) => [body.email] },
          { name: "login-b-ip", limit: 1, windowMs: 60_000, keys: ({ req }) => [req.headers.get("x-ip"), null] },
        ],
      },
      async () => "ok",
    );

    expect((await route(post("a@example.com", { "x-ip": "1.2.3.4" }))).status).toBe(200);
    expect((await route(post("b@example.com", { "x-ip": "1.2.3.4" }))).status).toBe(429);
    expect((await route(post("c@example.com"))).status).toBe(200);
    expect((await route(post("d@example.com"))).status).toBe(200);
  });

  it("runs after parsing, so an invalid body is 422 and isn't counted", async () => {
    const { handle } = setup({ actor: null });
    const keys = vi.fn(() => ["k"]);
    const route = handle(
      { auth: "public", body: LOGIN_BODY, rateLimit: [{ name: "login-c", limit: 1, windowMs: 60_000, keys }] },
      async () => "ok",
    );

    const invalid = await route(new Request(URL_BASE, { method: "POST", headers: CSRF, body: "{}" }));

    expect(invalid.status).toBe(422);
    expect(keys).not.toHaveBeenCalled();
  });
});

describe("apiHandler response headers", () => {
  it("merges handler-set headers into a successful response", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async ({ headers }) => {
      headers.append("set-cookie", "a=1; Path=/");
      headers.append("set-cookie", "b=2; Path=/");
      return "ok";
    })(new Request(URL_BASE));

    expect(response.headers.getSetCookie()).toEqual(["a=1; Path=/", "b=2; Path=/"]);
    expect(response.headers.get("content-type")).toBe("application/json");
  });

  it("drops them when the handler fails", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async ({ headers }) => {
      headers.append("set-cookie", "a=1; Path=/");
      throw new NotFoundError();
    })(new Request(URL_BASE));

    expect(response.status).toBe(404);
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("never lets a handler override the content type or request id", async () => {
    const { handle } = setup();
    const response = await handle({ auth: "required" }, async ({ headers }) => {
      headers.set("content-type", "text/html");
      headers.set(REQUEST_ID_HEADER, "forged");
      return "ok";
    })(new Request(URL_BASE, { headers: { [REQUEST_ID_HEADER]: "real-1" } }));

    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.headers.get(REQUEST_ID_HEADER)).toBe("real-1");
  });
});
