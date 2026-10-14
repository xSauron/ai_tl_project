/**
 * Idempotent local installer for `npm run setup` — runs the manual steps from
 * README.md's Quick start section and skips any that are already done.
 * CLI entry point: `scripts/setup-cli.mjs`.
 */
import { existsSync, statSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ENV_FILE = path.join(ROOT_DIR, ".env");
export const ENV_LOCAL_FILE = path.join(ROOT_DIR, ".env.local");
// Same files and precedence as `mikro-orm.config.ts` / `next.config.ts`: `.env.local` wins.
export const ENV_FILES_BY_PRECEDENCE = [ENV_LOCAL_FILE, ENV_FILE];
export const ENV_EXAMPLE_FILE = path.join(ROOT_DIR, ".env.example");
export const NODE_MODULES_DIR = path.join(ROOT_DIR, "node_modules");
// npm rewrites this alongside package-lock.json on every install; the
// node_modules directory's own mtime doesn't reliably change.
export const NPM_HIDDEN_LOCKFILE = path.join(NODE_MODULES_DIR, ".package-lock.json");
export const PACKAGE_LOCK_FILE = path.join(ROOT_DIR, "package-lock.json");
export const DB_COMPOSE_SERVICE = "db";
export const DB_HEALTHY_STATUS = "healthy";
export const DB_HEALTHCHECK_TIMEOUT_MS = 60_000;
export const DB_HEALTHCHECK_POLL_INTERVAL_MS = 2_000;
export const DB_CONNECT_TIMEOUT_MS = 2_000;
export const DATABASE_URL_VAR = "DATABASE_URL";

// `npm`/`docker` resolve to `.cmd` shims on Windows, which spawnSync only finds through a shell.
const USE_SHELL_ON_WINDOWS = process.platform === "win32";

/**
 * Real side effects, isolated behind one object so tests substitute a fake
 * `io` instead of mocking `node:fs` / `node:child_process` per call site.
 */
export const defaultIo = {
  fileExists: existsSync,
  fileMtimeMs: (filePath) => statSync(filePath).mtimeMs,
  copyFile: copyFileSync,
  loadEnvFile: (filePath) => process.loadEnvFile(filePath),
  getEnv: (name) => process.env[name],
  runCommand(command, args, options = {}) {
    const result = spawnSync(command, args, { cwd: ROOT_DIR, shell: USE_SHELL_ON_WINDOWS, ...options });
    return { status: result.status, stdout: result.stdout ? result.stdout.toString() : "" };
  },
  async canConnectToDatabase(databaseUrl) {
    // Imported lazily: `pg` only exists after the installer's own `npm install` step.
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: databaseUrl, connectionTimeoutMillis: DB_CONNECT_TIMEOUT_MS });
    try {
      await client.connect();
      await client.query("select 1");
      return true;
    } catch {
      return false;
    } finally {
      // A failed or already-failing connection can reject `end()` too; that
      // rejection carries no information beyond what `connect`/`query` reported.
      await client.end().catch(() => undefined);
    }
  },
  sleep(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  },
  now: () => Date.now(),
  log: (message) => console.log(message),
};

function logStep(io, message) {
  io.log(`\n▶ ${message}`);
}

function logSkip(io, message) {
  io.log(`  ✓ ${message} — already done, skipping.`);
}

function runOrThrow(io, command, args, options) {
  const result = io.runCommand(command, args, options);
  if (result.status !== 0) {
    throw new Error(`\`${command} ${args.join(" ")}\` failed (exit code ${result.status}).`);
  }
  return result;
}

export function isDependenciesInstallNeeded(io) {
  if (!io.fileExists(NPM_HIDDEN_LOCKFILE)) {
    return true;
  }
  return io.fileMtimeMs(PACKAGE_LOCK_FILE) > io.fileMtimeMs(NPM_HIDDEN_LOCKFILE);
}

export function installDependencies(io) {
  logStep(io, "Installing dependencies");
  if (!isDependenciesInstallNeeded(io)) {
    logSkip(io, "Dependencies");
    return;
  }
  runOrThrow(io, "npm", ["install"], { stdio: "inherit" });
}

export function createEnvFile(io) {
  logStep(io, "Creating .env");
  if (io.fileExists(ENV_FILE)) {
    logSkip(io, ".env");
    return;
  }
  io.copyFile(ENV_EXAMPLE_FILE, ENV_FILE);
  io.log("  Created .env from .env.example.");
}

function getDbContainerId(io) {
  const result = io.runCommand("docker", ["compose", "ps", "-q", DB_COMPOSE_SERVICE], { encoding: "utf8" });
  const containerId = result.stdout.trim();
  return containerId === "" ? null : containerId;
}

function getDbContainerHealth(io, containerId) {
  const result = io.runCommand("docker", ["inspect", "-f", "{{.State.Health.Status}}", containerId], {
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

export function isDbHealthy(io) {
  const containerId = getDbContainerId(io);
  return containerId !== null && getDbContainerHealth(io, containerId) === DB_HEALTHY_STATUS;
}

export function ensureDockerAvailable(io) {
  const result = io.runCommand("docker", ["compose", "version"], { stdio: "ignore" });
  if (result.status !== 0) {
    throw new Error(
      `Docker (with the Compose plugin) is required, or set ${DATABASE_URL_VAR} to an already-running ` +
        "PostgreSQL instance. Install Docker, or fix the connection string, then re-run `npm run setup`.",
    );
  }
}

export function waitForDbHealthy(io) {
  const deadline = io.now() + DB_HEALTHCHECK_TIMEOUT_MS;
  while (io.now() < deadline) {
    if (isDbHealthy(io)) {
      io.log("  PostgreSQL is healthy.");
      return;
    }
    io.sleep(DB_HEALTHCHECK_POLL_INTERVAL_MS);
  }
  throw new Error("PostgreSQL did not become healthy in time. Check `docker compose logs db`.");
}

function startDockerDatabase(io) {
  logStep(io, "Starting PostgreSQL (docker compose)");
  ensureDockerAvailable(io);
  if (getDbContainerId(io) !== null) {
    logSkip(io, "PostgreSQL container");
  } else {
    runOrThrow(io, "docker", ["compose", "up", "-d", DB_COMPOSE_SERVICE], { stdio: "inherit" });
  }
  waitForDbHealthy(io);
}

export function loadEnvFiles(io) {
  for (const envFile of ENV_FILES_BY_PRECEDENCE) {
    if (io.fileExists(envFile)) {
      io.loadEnvFile(envFile);
    }
  }
}

async function assertDatabaseUrlReachable(io, databaseUrl) {
  if (databaseUrl && (await io.canConnectToDatabase(databaseUrl))) {
    return;
  }
  throw new Error(
    `PostgreSQL is running in Docker, but ${DATABASE_URL_VAR} still doesn't reach it, so migrations would fail. ` +
      `Point ${DATABASE_URL_VAR} at the compose database (see .env.example), then re-run \`npm run setup\`.`,
  );
}

/**
 * A `DATABASE_URL` that already answers wins over Docker — the installer
 * never starts a container when the user already pointed it at a database.
 */
export async function ensureDatabaseAvailable(io) {
  logStep(io, "Checking for a reachable PostgreSQL database");
  loadEnvFiles(io);
  const databaseUrl = io.getEnv(DATABASE_URL_VAR);
  if (databaseUrl && (await io.canConnectToDatabase(databaseUrl))) {
    logSkip(io, `PostgreSQL (already reachable at ${DATABASE_URL_VAR})`);
    return;
  }
  io.log(`  No PostgreSQL reachable at ${DATABASE_URL_VAR} — falling back to Docker.`);
  startDockerDatabase(io);
  await assertDatabaseUrlReachable(io, databaseUrl);
}

export function applyMigrations(io) {
  logStep(io, "Applying database migrations");
  runOrThrow(io, "npm", ["run", "db:migrate"], { stdio: "inherit" });
}

export async function main(io) {
  io.log("🌱 Setting up Plant.AI...");
  installDependencies(io);
  createEnvFile(io);
  await ensureDatabaseAvailable(io);
  applyMigrations(io);
  io.log("\n✅ Setup complete. Run `npm run dev`, then open http://localhost:3000.");
}
