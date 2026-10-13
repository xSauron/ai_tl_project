import { afterEach, describe, expect, it, vi } from "vitest";

import { env } from "./env.ts";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env", () => {
  it("returns DATABASE_URL when set", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/plant_ai");
    expect(env.databaseUrl).toBe("postgresql://localhost/plant_ai");
  });

  it("throws a descriptive error when DATABASE_URL is missing", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(() => env.databaseUrl).toThrow("Missing required environment variable: DATABASE_URL");
  });

  it("parses pool sizes and falls back to defaults", () => {
    vi.stubEnv("DB_POOL_MIN", "");
    vi.stubEnv("DB_POOL_MAX", "");
    expect(env.dbPoolMin).toBe(0);
    expect(env.dbPoolMax).toBe(10);

    vi.stubEnv("DB_POOL_MIN", "2");
    vi.stubEnv("DB_POOL_MAX", "25");
    expect(env.dbPoolMin).toBe(2);
    expect(env.dbPoolMax).toBe(25);
  });

  it.each([
    ["true", true],
    ["false", false],
    ["", false],
  ])("DB_DEBUG=%j → %s", (value, expected) => {
    vi.stubEnv("DB_DEBUG", value);
    expect(env.dbDebug).toBe(expected);
  });
});
