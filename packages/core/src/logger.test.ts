import { Writable } from "node:stream";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LogLevel } from "./config/env.ts";
import {
  createLogger,
  createRequestLogger,
  MAX_REQUEST_ID_LENGTH,
  REDACTED,
  REQUEST_ID_HEADER,
  resolveRequestId,
  type Logger,
} from "./logger.ts";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** A logger writing into memory; `lines()` returns the parsed JSON records. */
function captureLogger(level: LogLevel = "info") {
  const chunks: string[] = [];
  const destination = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  const logger = createLogger({ level, destination });
  const lines = () =>
    chunks
      .join("")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
  return { logger, lines };
}

beforeEach(() => {
  vi.stubEnv("LOG_LEVEL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createLogger redaction", () => {
  it("redacts secrets at the top level, one level down and in request headers", () => {
    const { logger, lines } = captureLogger();

    logger.info(
      {
        password: "hunter2",
        passwordHash: "$2b$12$hash",
        token: "tok-123",
        authorization: "Bearer top",
        cookie: "session=top",
        jwt: "eyJhbGciOi.payload.sig",
        apiKey: "sk-top",
        user: { email: "a@example.com", apiKey: "sk-nested", password: "nested-pass", token: "nested-tok" },
        headers: { authorization: "Bearer nested", cookie: "session=nested", "set-cookie": "session=set", accept: "*/*" },
        req: { headers: { authorization: "Bearer req", cookie: "session=req", host: "localhost" } },
        res: { headers: { "set-cookie": "session=res" } },
        session: { jwt: "eyJ.nested.jwt", passwordHash: "$2b$12$nested" },
      },
      "login attempt",
    );

    const [record] = lines();
    expect(record).toMatchObject({
      msg: "login attempt",
      password: REDACTED,
      passwordHash: REDACTED,
      token: REDACTED,
      authorization: REDACTED,
      cookie: REDACTED,
      jwt: REDACTED,
      apiKey: REDACTED,
      user: { email: "a@example.com", apiKey: REDACTED, password: REDACTED, token: REDACTED },
      headers: { authorization: REDACTED, cookie: REDACTED, "set-cookie": REDACTED, accept: "*/*" },
      req: { headers: { authorization: REDACTED, cookie: REDACTED, host: "localhost" } },
      res: { headers: { "set-cookie": REDACTED } },
      session: { jwt: REDACTED, passwordHash: REDACTED },
    });
    const raw = JSON.stringify(record);
    for (const secret of ["hunter2", "tok-123", "Bearer", "session=", "eyJ", "sk-", "$2b$"]) {
      expect(raw).not.toContain(secret);
    }
  });

  it("redacts child-logger bindings too", () => {
    const { logger, lines } = captureLogger();

    logger.child({ token: "child-tok" }).info("bound");

    expect(lines()[0]).toMatchObject({ token: REDACTED });
  });
});

describe("createLogger level", () => {
  it("drops records below the configured level", () => {
    const { logger, lines } = captureLogger("warn");

    logger.info("hidden");
    logger.warn("shown");
    logger.error("also shown");

    expect(lines().map((line) => line.msg)).toEqual(["shown", "also shown"]);
    expect(logger.level).toBe("warn");
  });

  it("takes the level from LOG_LEVEL when none is passed", () => {
    vi.stubEnv("LOG_LEVEL", "debug");

    expect(createLogger().level).toBe("debug");
  });

  it("writes to stdout by default", () => {
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    createLogger({ level: "info" }).info("to stdout");

    expect(write.mock.calls.some(([chunk]) => String(chunk).includes('"msg":"to stdout"'))).toBe(true);
    write.mockRestore();
  });
});

describe("getLogger", () => {
  it("doesn't read the env at import time", async () => {
    vi.stubEnv("LOG_LEVEL", "loud");
    vi.resetModules();

    await expect(import("./logger.ts")).resolves.toHaveProperty("getLogger");
  });

  it("creates one root logger lazily with LOG_LEVEL and reuses it", async () => {
    vi.resetModules();
    const { getLogger } = await import("./logger.ts");
    vi.stubEnv("LOG_LEVEL", "error");

    const first = getLogger();
    vi.stubEnv("LOG_LEVEL", "trace");

    expect(first.level).toBe("error");
    expect(getLogger()).toBe(first);
  });

  it("fails loudly on an invalid LOG_LEVEL", async () => {
    vi.resetModules();
    const { getLogger } = await import("./logger.ts");
    vi.stubEnv("LOG_LEVEL", "loud");

    expect(() => getLogger()).toThrow("LOG_LEVEL must be one of");
  });
});

describe("resolveRequestId", () => {
  it.each([
    { label: "a UUID", id: "3f1c2b9a-6d7e-4f80-9a1b-2c3d4e5f6a7b" },
    { label: "a tracing id with dots and colons", id: "trace:abc.123_x-Y" },
    { label: "exactly the maximum length", id: "a".repeat(MAX_REQUEST_ID_LENGTH) },
  ])("keeps $label", ({ id }) => {
    expect(resolveRequestId(id)).toBe(id);
  });

  it.each([
    { label: "missing (undefined)", id: undefined },
    { label: "missing (null)", id: null },
    { label: "empty", id: "" },
    { label: "one character too long", id: "a".repeat(MAX_REQUEST_ID_LENGTH + 1) },
    { label: "containing a space", id: "abc def" },
    { label: "containing a newline (log injection)", id: "abc\n{\"level\":60}" },
    { label: "containing quotes", id: 'abc"def' },
    { label: "containing non-ASCII", id: "żółw" },
  ])("replaces an id that is $label with a fresh UUID", ({ id }) => {
    const resolved = resolveRequestId(id);

    expect(resolved).toMatch(UUID_PATTERN);
    expect(resolved).not.toBe(id);
  });

  it("generates a different id each time", () => {
    expect(resolveRequestId(undefined)).not.toBe(resolveRequestId(undefined));
  });
});

describe("createRequestLogger", () => {
  function captureParent(): { parent: Logger; lines: () => Record<string, unknown>[] } {
    const { logger, lines } = captureLogger();
    return { parent: logger, lines };
  }

  it("uses a valid x-request-id header and tags every record with it", () => {
    const { parent, lines } = captureParent();
    const headers = new Headers({ [REQUEST_ID_HEADER]: "req-42" });

    const { logger, requestId } = createRequestLogger(headers, parent);
    logger.info({ token: "t" }, "handled");

    expect(requestId).toBe("req-42");
    expect(lines()[0]).toMatchObject({ requestId: "req-42", msg: "handled", token: REDACTED });
  });

  it("generates a UUID when the header is missing", () => {
    const { parent, lines } = captureParent();

    const { logger, requestId } = createRequestLogger(new Headers(), parent);
    logger.info("handled");

    expect(requestId).toMatch(UUID_PATTERN);
    expect(lines()[0]).toMatchObject({ requestId });
  });

  it("replaces an invalid header value", () => {
    const { parent } = captureParent();
    const headers = new Headers({ [REQUEST_ID_HEADER]: "x".repeat(MAX_REQUEST_ID_LENGTH + 1) });

    expect(createRequestLogger(headers, parent).requestId).toMatch(UUID_PATTERN);
  });

  it("works without headers and defaults to the root logger", async () => {
    vi.resetModules();
    const fresh = await import("./logger.ts");
    vi.stubEnv("LOG_LEVEL", "warn");

    const { logger, requestId } = fresh.createRequestLogger();

    expect(requestId).toMatch(UUID_PATTERN);
    expect(logger.bindings()).toEqual({ requestId });
    expect(logger.level).toBe(fresh.getLogger().level);
    expect(logger.level).toBe("warn");
  });
});
