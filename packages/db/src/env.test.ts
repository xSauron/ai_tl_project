import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_DB_POOL_MAX, DEFAULT_DB_POOL_MIN, getDbEnv } from "./env.ts";

const DATABASE_URL = "postgresql://plant_ai:s3cret-password@localhost:5432/plant_ai";

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", DATABASE_URL);
  vi.stubEnv("DB_POOL_MIN", "");
  vi.stubEnv("DB_POOL_MAX", "");
  vi.stubEnv("DB_DEBUG", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getDbEnv", () => {
  it("doesn't parse at import time, so the module loads with no env", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("DB_POOL_MAX", "not-a-number");
    vi.resetModules();

    await expect(import("./env.ts")).resolves.toHaveProperty("getDbEnv");
  });

  it("falls back to the defaults when the optional vars are unset or empty", () => {
    expect(getDbEnv()).toEqual({
      databaseUrl: DATABASE_URL,
      dbPoolMin: DEFAULT_DB_POOL_MIN,
      dbPoolMax: DEFAULT_DB_POOL_MAX,
      dbDebug: false,
    });

    delete process.env.DB_POOL_MIN;
    delete process.env.DB_POOL_MAX;
    delete process.env.DB_DEBUG;
    expect(getDbEnv()).toMatchObject({ dbPoolMin: 0, dbPoolMax: 10, dbDebug: false });
  });

  it("parses valid values", () => {
    vi.stubEnv("DB_POOL_MIN", "2");
    vi.stubEnv("DB_POOL_MAX", "25");
    vi.stubEnv("DB_DEBUG", "true");

    expect(getDbEnv()).toEqual({ databaseUrl: DATABASE_URL, dbPoolMin: 2, dbPoolMax: 25, dbDebug: true });
  });

  it("accepts DB_POOL_MIN equal to DB_POOL_MAX", () => {
    vi.stubEnv("DB_POOL_MIN", "5");
    vi.stubEnv("DB_POOL_MAX", "5");

    expect(getDbEnv()).toMatchObject({ dbPoolMin: 5, dbPoolMax: 5 });
  });

  it.each([
    ["true", true],
    ["false", false],
    ["", false],
  ])("DB_DEBUG=%j → %s", (value, expected) => {
    vi.stubEnv("DB_DEBUG", value);

    expect(getDbEnv().dbDebug).toBe(expected);
  });

  it.each([
    { name: "DATABASE_URL", value: "", message: "DATABASE_URL is required" },
    { name: "DB_POOL_MIN", value: "abc", message: "DB_POOL_MIN must be an integer ≥ 0" },
    { name: "DB_POOL_MIN", value: "-1", message: "DB_POOL_MIN must be an integer ≥ 0" },
    { name: "DB_POOL_MIN", value: "1.5", message: "DB_POOL_MIN must be an integer ≥ 0" },
    { name: "DB_POOL_MAX", value: "10abc", message: "DB_POOL_MAX must be an integer ≥ 1" },
    { name: "DB_POOL_MAX", value: "0", message: "DB_POOL_MAX must be an integer ≥ 1" },
    { name: "DB_POOL_MIN", value: "11", message: "DB_POOL_MIN must not exceed DB_POOL_MAX" },
    { name: "DB_DEBUG", value: "yes", message: "DB_DEBUG must be true or false" },
  ])("rejects $name=$value, naming the variable", ({ name, value, message }) => {
    vi.stubEnv(name, value);

    expect(() => getDbEnv()).toThrow(message);
  });

  it("reports every invalid variable at once", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("DB_DEBUG", "yes");

    expect(() => getDbEnv()).toThrow("Invalid environment variables: DATABASE_URL is required; DB_DEBUG must be");
  });

  it("never echoes a variable's value in the error", () => {
    vi.stubEnv("DB_POOL_MAX", "s3cret-password");

    expect(() => getDbEnv()).toThrow(expect.objectContaining({ message: expect.not.stringContaining("s3cret") }));
  });
});
