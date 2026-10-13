import { fileURLToPath } from "node:url";

import { Migrator } from "@mikro-orm/migrations";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

const { existsSync } = vi.hoisted(() => ({ existsSync: vi.fn() }));

vi.mock("node:fs", () => ({ existsSync }));

let loadEnvFile: MockInstance<typeof process.loadEnvFile>;

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://localhost/plant_ai");
  loadEnvFile = vi.spyOn(process, "loadEnvFile").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const loadedFiles = () =>
  loadEnvFile.mock.calls.map(([file]) => fileURLToPath(file as URL).replace(/^.*\//, ""));

describe("MikroORM CLI config", () => {
  it("loads root .env.local and .env when present", async () => {
    existsSync.mockReturnValue(true);

    await import("./mikro-orm.config.ts");

    expect(loadedFiles()).toEqual([".env.local", ".env"]);
    const [firstUrl] = loadEnvFile.mock.calls[0] as [URL];
    expect(fileURLToPath(firstUrl)).not.toContain("/packages/");
  });

  it("skips env files that do not exist", async () => {
    existsSync.mockReturnValue(false);

    await import("./mikro-orm.config.ts");

    expect(loadEnvFile).not.toHaveBeenCalled();
  });

  it("registers the Migrator with source and compiled migration paths", async () => {
    existsSync.mockReturnValue(false);

    const { default: config } = await import("./mikro-orm.config.ts");

    expect(config.extensions).toEqual([Migrator]);
    expect(config.migrations).toMatchObject({
      path: "./dist/migrations",
      pathTs: "./src/migrations",
      transactional: true,
      allOrNothing: true,
    });
  });
});
