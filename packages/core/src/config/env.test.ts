import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LOG_LEVEL, DEFAULT_NODE_ENV, getEnv, getJwtSecret, LOG_LEVELS, MIN_JWT_SECRET_BYTES } from "./env.ts";

const VALID_SECRET = "a".repeat(MIN_JWT_SECRET_BYTES);

beforeEach(() => {
  vi.stubEnv("LOG_LEVEL", "");
  vi.stubEnv("JWT_SECRET", "");
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("module loading", () => {
  it("doesn't parse at import time, so the module loads with no or invalid env", async () => {
    vi.stubEnv("LOG_LEVEL", "loud");
    vi.stubEnv("NODE_ENV", "staging");
    vi.resetModules();

    await expect(import("./env.ts")).resolves.toHaveProperty("getEnv");
  });
});

describe("getEnv", () => {
  it("falls back to the defaults when the vars are unset or empty", () => {
    vi.stubEnv("NODE_ENV", "");
    expect(getEnv()).toEqual({ logLevel: DEFAULT_LOG_LEVEL, nodeEnv: DEFAULT_NODE_ENV });

    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
    expect(getEnv()).toEqual({ logLevel: "info", nodeEnv: "production" });
  });

  it("doesn't need JWT_SECRET", () => {
    expect(() => getEnv()).not.toThrow();
  });

  it.each(LOG_LEVELS)("accepts LOG_LEVEL=%s", (level) => {
    vi.stubEnv("LOG_LEVEL", level);

    expect(getEnv().logLevel).toBe(level);
  });

  it.each(["production", "development", "test"])("accepts NODE_ENV=%s", (nodeEnv) => {
    vi.stubEnv("NODE_ENV", nodeEnv);

    expect(getEnv().nodeEnv).toBe(nodeEnv);
  });

  it.each([
    { name: "LOG_LEVEL", value: "loud", message: "LOG_LEVEL must be one of fatal, error, warn, info, debug, trace, silent" },
    { name: "LOG_LEVEL", value: "INFO", message: "LOG_LEVEL must be one of" },
    { name: "NODE_ENV", value: "staging", message: "NODE_ENV must be one of production, development, test" },
  ])("rejects $name=$value, naming the variable without echoing the value", ({ name, value, message }) => {
    vi.stubEnv(name, value);

    expect(() => getEnv()).toThrow(message);
    expect(() => getEnv()).toThrow(expect.objectContaining({ message: expect.not.stringContaining(value) }));
  });

  it("reports every invalid variable at once", () => {
    vi.stubEnv("LOG_LEVEL", "loud");
    vi.stubEnv("NODE_ENV", "staging");

    expect(() => getEnv()).toThrow(/^Invalid environment variables: LOG_LEVEL must be .*; NODE_ENV must be /);
  });
});

describe("getJwtSecret", () => {
  it.each([
    { label: `exactly ${MIN_JWT_SECRET_BYTES} bytes`, secret: VALID_SECRET },
    { label: "longer than the minimum", secret: `${VALID_SECRET}-and-more` },
    // 16 two-byte characters: 16 chars but 32 bytes.
    { label: "multi-byte characters counted in bytes", secret: "ż".repeat(MIN_JWT_SECRET_BYTES / 2) },
  ])("returns a secret that is $label", ({ secret }) => {
    vi.stubEnv("JWT_SECRET", secret);

    expect(getJwtSecret()).toBe(secret);
  });

  it.each([
    { label: "unset", secret: undefined, message: "JWT_SECRET is required" },
    { label: "empty", secret: "", message: "JWT_SECRET is required" },
    {
      label: "one byte short",
      secret: "s3cret".padEnd(MIN_JWT_SECRET_BYTES - 1, "x"),
      message: `JWT_SECRET must be at least ${MIN_JWT_SECRET_BYTES} bytes`,
    },
    {
      label: "short in bytes (multi-byte characters)",
      secret: "ż".repeat(MIN_JWT_SECRET_BYTES / 2 - 1),
      message: `JWT_SECRET must be at least ${MIN_JWT_SECRET_BYTES} bytes`,
    },
  ])("fails closed when JWT_SECRET is $label, naming the variable", ({ secret, message }) => {
    if (secret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      vi.stubEnv("JWT_SECRET", secret);
    }

    expect(() => getJwtSecret()).toThrow(message);
  });

  it("never echoes the secret in the error", () => {
    const shortSecret = "s3cret-value-too-short";
    vi.stubEnv("JWT_SECRET", shortSecret);

    expect(() => getJwtSecret()).toThrow(expect.objectContaining({ message: expect.not.stringContaining(shortSecret) }));
  });

  it("reads the current value on every call", () => {
    vi.stubEnv("JWT_SECRET", VALID_SECRET);
    expect(getJwtSecret()).toBe(VALID_SECRET);

    vi.stubEnv("JWT_SECRET", "");
    expect(() => getJwtSecret()).toThrow("JWT_SECRET is required");
  });
});
