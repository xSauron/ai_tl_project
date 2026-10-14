import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { MockClient, mockClientInstances, clientBehavior } = vi.hoisted(() => {
  const mockClientInstances = [];
  // Read synchronously by the constructor, so a test can configure the
  // outcome before calling `canConnectToDatabase` (the instance doesn't
  // exist yet to be reconfigured afterwards).
  const clientBehavior = { connectError: null, queryError: null, endError: null };
  class MockClient {
    constructor(options) {
      this.options = options;
      this.connect = vi.fn(() => (clientBehavior.connectError ? Promise.reject(clientBehavior.connectError) : Promise.resolve()));
      this.query = vi.fn(() => (clientBehavior.queryError ? Promise.reject(clientBehavior.queryError) : Promise.resolve()));
      this.end = vi.fn(() => (clientBehavior.endError ? Promise.reject(clientBehavior.endError) : Promise.resolve()));
      mockClientInstances.push(this);
    }
  }
  return { MockClient, mockClientInstances, clientBehavior };
});

vi.mock("pg", () => ({ default: { Client: MockClient } }));

import {
  DB_COMPOSE_SERVICE,
  DB_HEALTHCHECK_TIMEOUT_MS,
  ENV_FILE,
  ENV_LOCAL_FILE,
  NPM_HIDDEN_LOCKFILE,
  PACKAGE_LOCK_FILE,
  defaultIo,
  applyMigrations,
  createEnvFile,
  ensureDatabaseAvailable,
  ensureDockerAvailable,
  installDependencies,
  isDbHealthy,
  isDependenciesInstallNeeded,
  loadEnvFiles,
  main,
  waitForDbHealthy,
} from "./setup.mjs";

/** A fake `io` with every method stubbed; tests override only what they exercise. */
function createFakeIo(overrides = {}) {
  return {
    fileExists: vi.fn().mockReturnValue(false),
    fileMtimeMs: vi.fn().mockReturnValue(0),
    copyFile: vi.fn(),
    loadEnvFile: vi.fn(),
    getEnv: vi.fn().mockReturnValue(undefined),
    canConnectToDatabase: vi.fn().mockResolvedValue(false),
    runCommand: vi.fn().mockReturnValue({ status: 0, stdout: "" }),
    sleep: vi.fn(),
    now: vi.fn().mockReturnValue(0),
    log: vi.fn(),
    ...overrides,
  };
}

describe("isDependenciesInstallNeeded", () => {
  it("is needed when npm's hidden lockfile in node_modules does not exist", () => {
    const io = createFakeIo({ fileExists: vi.fn().mockReturnValue(false) });

    expect(isDependenciesInstallNeeded(io)).toBe(true);
    expect(io.fileMtimeMs).not.toHaveBeenCalled();
  });

  it("is needed when package-lock.json is newer than npm's hidden lockfile", () => {
    const io = createFakeIo({
      fileExists: vi.fn((filePath) => filePath === NPM_HIDDEN_LOCKFILE),
      fileMtimeMs: vi.fn((filePath) => (filePath === PACKAGE_LOCK_FILE ? 200 : 100)),
    });

    expect(isDependenciesInstallNeeded(io)).toBe(true);
  });

  it("is not needed when npm's hidden lockfile is at least as new as package-lock.json", () => {
    // Regression: npm writes both lockfiles together, while the node_modules
    // directory's mtime can lag far behind and forced a reinstall every run.
    const io = createFakeIo({
      fileExists: vi.fn((filePath) => filePath === NPM_HIDDEN_LOCKFILE),
      fileMtimeMs: vi.fn().mockReturnValue(200),
    });

    expect(isDependenciesInstallNeeded(io)).toBe(false);
    expect(io.fileMtimeMs).toHaveBeenCalledWith(NPM_HIDDEN_LOCKFILE);
  });
});

describe("installDependencies", () => {
  it("skips npm install when dependencies are already up to date", () => {
    const io = createFakeIo({ fileExists: vi.fn().mockReturnValue(true), fileMtimeMs: vi.fn().mockReturnValue(1) });

    installDependencies(io);

    expect(io.runCommand).not.toHaveBeenCalled();
  });

  it("runs npm install when dependencies are missing", () => {
    const io = createFakeIo({ fileExists: vi.fn().mockReturnValue(false) });

    installDependencies(io);

    expect(io.runCommand).toHaveBeenCalledWith("npm", ["install"], { stdio: "inherit" });
  });

  it("throws when npm install fails", () => {
    const io = createFakeIo({
      fileExists: vi.fn().mockReturnValue(false),
      runCommand: vi.fn().mockReturnValue({ status: 1, stdout: "" }),
    });

    expect(() => installDependencies(io)).toThrow(/npm install.*failed/);
  });
});

describe("createEnvFile", () => {
  it("skips when .env already exists", () => {
    const io = createFakeIo({ fileExists: vi.fn().mockReturnValue(true) });

    createEnvFile(io);

    expect(io.copyFile).not.toHaveBeenCalled();
  });

  it("copies .env.example to .env when .env is missing", () => {
    const io = createFakeIo({ fileExists: vi.fn().mockReturnValue(false) });

    createEnvFile(io);

    expect(io.copyFile).toHaveBeenCalledWith(
      expect.stringContaining(".env.example"),
      expect.stringContaining(".env"),
    );
  });
});

describe("isDbHealthy", () => {
  it("is false when no container is running", () => {
    const io = createFakeIo({ runCommand: vi.fn().mockReturnValue({ status: 0, stdout: "\n" }) });

    expect(isDbHealthy(io)).toBe(false);
  });

  it("is false when the container is running but not yet healthy", () => {
    const io = createFakeIo({
      runCommand: vi
        .fn()
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" })
        .mockReturnValueOnce({ status: 0, stdout: "starting\n" }),
    });

    expect(isDbHealthy(io)).toBe(false);
  });

  it("is false when docker inspect fails", () => {
    const io = createFakeIo({
      runCommand: vi
        .fn()
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" })
        .mockReturnValueOnce({ status: 1, stdout: "" }),
    });

    expect(isDbHealthy(io)).toBe(false);
  });

  it("is true when the container reports healthy", () => {
    const io = createFakeIo({
      runCommand: vi
        .fn()
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" })
        .mockReturnValueOnce({ status: 0, stdout: "healthy\n" }),
    });

    expect(isDbHealthy(io)).toBe(true);
  });
});

describe("ensureDockerAvailable", () => {
  it("does nothing when docker compose is available", () => {
    const io = createFakeIo({ runCommand: vi.fn().mockReturnValue({ status: 0, stdout: "" }) });

    expect(() => ensureDockerAvailable(io)).not.toThrow();
  });

  it("throws a clear error when docker is unavailable", () => {
    const io = createFakeIo({ runCommand: vi.fn().mockReturnValue({ status: 1, stdout: "" }) });

    expect(() => ensureDockerAvailable(io)).toThrow(/Docker/);
  });
});

describe("waitForDbHealthy", () => {
  it("returns as soon as the database reports healthy", () => {
    const io = createFakeIo({
      now: vi.fn().mockReturnValue(0),
      runCommand: vi
        .fn()
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" })
        .mockReturnValueOnce({ status: 0, stdout: "healthy\n" }),
    });

    waitForDbHealthy(io);

    expect(io.sleep).not.toHaveBeenCalled();
  });

  it("throws once the timeout elapses without becoming healthy", () => {
    let elapsed = 0;
    const io = createFakeIo({
      now: vi.fn(() => elapsed),
      runCommand: vi.fn().mockReturnValue({ status: 0, stdout: "\n" }),
      sleep: vi.fn(() => {
        elapsed += DB_HEALTHCHECK_TIMEOUT_MS;
      }),
    });

    expect(() => waitForDbHealthy(io)).toThrow(/did not become healthy/);
    expect(io.sleep).toHaveBeenCalledTimes(1);
  });
});

describe("ensureDatabaseAvailable", () => {
  it("skips Docker entirely when DATABASE_URL is already reachable", async () => {
    const io = createFakeIo({
      fileExists: vi.fn().mockReturnValue(true),
      getEnv: vi.fn().mockReturnValue("postgresql://plant_ai:plant_ai@localhost:5432/plant_ai"),
      canConnectToDatabase: vi.fn().mockResolvedValue(true),
    });

    await ensureDatabaseAvailable(io);

    expect(io.loadEnvFile).toHaveBeenCalled();
    expect(io.canConnectToDatabase).toHaveBeenCalledWith("postgresql://plant_ai:plant_ai@localhost:5432/plant_ai");
    expect(io.runCommand).not.toHaveBeenCalled();
  });

  it("falls back to Docker when no DATABASE_URL is set, then fails clearly because migrations need it", async () => {
    const io = createFakeIo({
      getEnv: vi.fn().mockReturnValue(undefined),
      runCommand: vi
        .fn()
        .mockReturnValueOnce({ status: 0, stdout: "" }) // ensureDockerAvailable
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" }) // getDbContainerId (skip check)
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" }) // getDbContainerId (isDbHealthy)
        .mockReturnValueOnce({ status: 0, stdout: "healthy\n" }), // getDbContainerHealth
    });

    await expect(ensureDatabaseAvailable(io)).rejects.toThrow(/DATABASE_URL still doesn't reach it/);

    expect(io.canConnectToDatabase).not.toHaveBeenCalled();
    expect(io.runCommand).toHaveBeenCalledWith("docker", ["compose", "version"], { stdio: "ignore" });
  });

  it("falls back to Docker when DATABASE_URL is set but unreachable, then re-checks it", async () => {
    const io = createFakeIo({
      getEnv: vi.fn().mockReturnValue("postgresql://plant_ai:plant_ai@localhost:5432/plant_ai"),
      canConnectToDatabase: vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true),
      runCommand: vi
        .fn()
        .mockReturnValueOnce({ status: 0, stdout: "" }) // ensureDockerAvailable
        .mockReturnValueOnce({ status: 0, stdout: "\n" }) // getDbContainerId (skip check) -> not running
        .mockReturnValueOnce({ status: 0, stdout: "" }) // docker compose up
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" }) // getDbContainerId (isDbHealthy)
        .mockReturnValueOnce({ status: 0, stdout: "healthy\n" }), // getDbContainerHealth
    });

    await ensureDatabaseAvailable(io);

    expect(io.runCommand).toHaveBeenCalledWith("docker", ["compose", "up", "-d", DB_COMPOSE_SERVICE], {
      stdio: "inherit",
    });
    expect(io.canConnectToDatabase).toHaveBeenCalledTimes(2);
  });

  it("fails clearly when the Docker database is healthy but DATABASE_URL points elsewhere", async () => {
    const io = createFakeIo({
      getEnv: vi.fn().mockReturnValue("postgresql://db.example.invalid:5432/plant_ai"),
      canConnectToDatabase: vi.fn().mockResolvedValue(false),
      runCommand: vi
        .fn()
        .mockReturnValueOnce({ status: 0, stdout: "" }) // ensureDockerAvailable
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" }) // getDbContainerId (skip check) -> running
        .mockReturnValueOnce({ status: 0, stdout: "abc123\n" }) // getDbContainerId (isDbHealthy)
        .mockReturnValueOnce({ status: 0, stdout: "healthy\n" }), // getDbContainerHealth
    });

    await expect(ensureDatabaseAvailable(io)).rejects.toThrow(/DATABASE_URL still doesn't reach it/);
    expect(io.canConnectToDatabase).toHaveBeenCalledTimes(2);
  });

  it("surfaces the combined error when DATABASE_URL is unreachable and Docker is unavailable", async () => {
    const io = createFakeIo({
      getEnv: vi.fn().mockReturnValue("postgresql://nowhere:5432/plant_ai"),
      canConnectToDatabase: vi.fn().mockResolvedValue(false),
      runCommand: vi.fn().mockReturnValue({ status: 1, stdout: "" }),
    });

    await expect(ensureDatabaseAvailable(io)).rejects.toThrow(/Docker.*DATABASE_URL/);
  });
});

describe("loadEnvFiles", () => {
  it("loads .env.local before .env, matching the app and MikroORM precedence", () => {
    const io = createFakeIo({ fileExists: vi.fn().mockReturnValue(true) });

    loadEnvFiles(io);

    expect(io.loadEnvFile.mock.calls).toEqual([[ENV_LOCAL_FILE], [ENV_FILE]]);
  });

  it("skips env files that don't exist", () => {
    const io = createFakeIo({ fileExists: vi.fn((filePath) => filePath === ENV_FILE) });

    loadEnvFiles(io);

    expect(io.loadEnvFile.mock.calls).toEqual([[ENV_FILE]]);
  });
});

describe("applyMigrations", () => {
  it("runs the migration command", () => {
    const io = createFakeIo();

    applyMigrations(io);

    expect(io.runCommand).toHaveBeenCalledWith("npm", ["run", "db:migrate"], { stdio: "inherit" });
  });

  it("throws when migrations fail", () => {
    const io = createFakeIo({ runCommand: vi.fn().mockReturnValue({ status: 1, stdout: "" }) });

    expect(() => applyMigrations(io)).toThrow(/db:migrate.*failed/);
  });
});

describe("main", () => {
  it("runs every step in order and reports success", async () => {
    const io = createFakeIo({
      fileExists: vi.fn().mockReturnValue(true), // dependencies + .env both already present
      getEnv: vi.fn().mockReturnValue("postgresql://plant_ai:plant_ai@localhost:5432/plant_ai"),
      canConnectToDatabase: vi.fn().mockResolvedValue(true),
    });

    await main(io);

    expect(io.log).toHaveBeenCalledWith(expect.stringContaining("Setup complete"));
  });
});

describe("defaultIo.canConnectToDatabase", () => {
  beforeEach(() => {
    mockClientInstances.length = 0;
    clientBehavior.connectError = null;
    clientBehavior.queryError = null;
    clientBehavior.endError = null;
  });

  it("returns true when connect and query both succeed, then closes the connection", async () => {
    const reachable = await defaultIo.canConnectToDatabase("postgresql://plant_ai:plant_ai@localhost:5432/plant_ai");

    expect(reachable).toBe(true);
    const [client] = mockClientInstances;
    expect(client.options).toMatchObject({
      connectionString: "postgresql://plant_ai:plant_ai@localhost:5432/plant_ai",
    });
    expect(client.query).toHaveBeenCalledWith("select 1");
    expect(client.end).toHaveBeenCalled();
  });

  it("returns false when connecting fails", async () => {
    clientBehavior.connectError = new Error("ECONNREFUSED");

    const reachable = await defaultIo.canConnectToDatabase("postgresql://nowhere:5432/plant_ai");

    expect(reachable).toBe(false);
  });

  it("returns false when the query fails after connecting", async () => {
    clientBehavior.queryError = new Error("permission denied");

    const reachable = await defaultIo.canConnectToDatabase("postgresql://plant_ai:plant_ai@localhost:5432/plant_ai");

    expect(reachable).toBe(false);
  });

  it("does not let a failing end() mask the connect/query result", async () => {
    clientBehavior.connectError = new Error("ECONNREFUSED");
    clientBehavior.endError = new Error("not connected");

    await expect(defaultIo.canConnectToDatabase("postgresql://nowhere:5432/plant_ai")).resolves.toBe(false);
  });
});

describe("fresh clone (no node_modules)", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "plantai-setup-fresh-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("imports setup.mjs without any installed packages, so `npm run setup` can run `npm install` first", () => {
    // Regression: a top-level `import pg from "pg"` crashed before the install step.
    const scriptsDir = path.join(tmpDir, "scripts");
    mkdirSync(scriptsDir);
    copyFileSync(new URL("./setup.mjs", import.meta.url), path.join(scriptsDir, "setup.mjs"));

    const result = spawnSync(process.execPath, ["--input-type=module", "-e", 'await import("./scripts/setup.mjs");'], {
      cwd: tmpDir,
      encoding: "utf8",
    });

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });
});

describe("defaultIo (real wiring)", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), "plantai-setup-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("fileMtimeMs reads a real file's mtime", () => {
    const filePath = path.join(tmpDir, "file.txt");
    writeFileSync(filePath, "hi");

    expect(defaultIo.fileMtimeMs(filePath)).toBeGreaterThan(0);
  });

  it("copyFile copies real file contents", () => {
    const source = path.join(tmpDir, "source.txt");
    const dest = path.join(tmpDir, "dest.txt");
    writeFileSync(source, "plant.ai");

    defaultIo.copyFile(source, dest);

    expect(defaultIo.fileExists(dest)).toBe(true);
  });

  it("loadEnvFile and getEnv read a real .env file into process.env", () => {
    const envPath = path.join(tmpDir, ".env.test");
    writeFileSync(envPath, "PLANTAI_SETUP_TEST_VAR=hello\n");

    try {
      defaultIo.loadEnvFile(envPath);
      expect(defaultIo.getEnv("PLANTAI_SETUP_TEST_VAR")).toBe("hello");
    } finally {
      delete process.env.PLANTAI_SETUP_TEST_VAR;
    }
  });

  it("runCommand runs a real process and captures stdout, with and without extra options", () => {
    const withoutOptions = defaultIo.runCommand(process.execPath, ["--version"]);
    expect(withoutOptions.status).toBe(0);

    const withOptions = defaultIo.runCommand(process.execPath, ["--version"], { encoding: "utf8" });
    expect(withOptions.stdout).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it("runCommand returns an empty stdout string when output isn't captured", () => {
    const result = defaultIo.runCommand(process.execPath, ["--version"], { stdio: "ignore" });

    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
  });

  it("sleep blocks synchronously without throwing", () => {
    expect(() => defaultIo.sleep(1)).not.toThrow();
  });

  it("now returns the current time", () => {
    const before = Date.now();
    const result = defaultIo.now();
    expect(result).toBeGreaterThanOrEqual(before);
  });

  it("log writes to the console", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    defaultIo.log("hello from setup");

    expect(spy).toHaveBeenCalledWith("hello from setup");
    spy.mockRestore();
  });
});
