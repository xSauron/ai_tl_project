import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

const { existsSync } = vi.hoisted(() => ({ existsSync: vi.fn() }));

vi.mock("node:fs", () => ({ existsSync }));

const repoRoot = path.resolve(import.meta.dirname, "../..");
let loadEnvFile: MockInstance<typeof process.loadEnvFile>;

beforeEach(() => {
  vi.resetModules();
  loadEnvFile = vi.spyOn(process, "loadEnvFile").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("next.config", () => {
  it("loads .env.local and .env from the repo root when present", async () => {
    existsSync.mockReturnValue(true);

    await import("./next.config");

    expect(loadEnvFile.mock.calls).toEqual([[path.join(repoRoot, ".env.local")], [path.join(repoRoot, ".env")]]);
  });

  it("skips missing env files", async () => {
    existsSync.mockReturnValue(false);

    await import("./next.config");

    expect(loadEnvFile).not.toHaveBeenCalled();
  });

  it("keeps MikroORM and pg out of the server bundle", async () => {
    existsSync.mockReturnValue(false);

    const { default: config } = await import("./next.config");

    expect(config.serverExternalPackages).toEqual(
      expect.arrayContaining(["@mikro-orm/core", "@mikro-orm/postgresql", "pg"]),
    );
  });
});
