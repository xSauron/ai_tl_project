import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { entities } from "../entities/index.ts";
import { createOrmConfig } from "./config.ts";

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgresql://user@localhost:5432/plant_ai");
  vi.stubEnv("DB_POOL_MIN", "1");
  vi.stubEnv("DB_POOL_MAX", "7");
  vi.stubEnv("DB_DEBUG", "true");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createOrmConfig", () => {
  it("builds the PostgreSQL config from env", () => {
    const config = createOrmConfig();

    expect(config.clientUrl).toBe("postgresql://user@localhost:5432/plant_ai");
    expect(config.entities).toBe(entities);
    expect(config.pool).toEqual({ min: 1, max: 7 });
    expect(config.debug).toBe(true);
    expect(config.allowGlobalContext).toBe(false);
    expect(config.driver).toBeDefined();
  });

  it("lets overrides win over defaults", () => {
    const config = createOrmConfig({ debug: false, pool: { max: 1 } });

    expect(config.debug).toBe(false);
    expect(config.pool).toEqual({ max: 1 });
  });
});
