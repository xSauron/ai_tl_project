import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const APP_DIR = path.join(REPO_ROOT, "packages/app");
const NEXT_BIN = path.join(REPO_ROOT, "node_modules/.bin/next");
const NPM_BIN = process.platform === "win32" ? "npm.cmd" : "npm";
const HEALTH_TIMEOUT_MS = 60_000;
const HEALTH_POLL_MS = 250;

export interface AppServer {
  baseUrl: string;
  stop(): Promise<void>;
}

/** Environment for child processes: the test DB, and no inherited NODE_ENV (Next sets its own). */
function childEnv(databaseUrl: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, DATABASE_URL: databaseUrl };
  delete env.NODE_ENV;
  return env;
}

/** Applies all migrations through the real MikroORM CLI (`npm run db:migrate`). */
export async function migrate(databaseUrl: string): Promise<void> {
  const child = spawn(NPM_BIN, ["run", "db:migrate"], { cwd: REPO_ROOT, env: childEnv(databaseUrl), stdio: "pipe" });
  const output = collectOutput(child);
  const code = await new Promise<number | null>((resolve) => child.on("close", resolve));
  if (code !== 0) {
    throw new Error(`db:migrate failed (exit ${code}):\n${output.join("")}`);
  }
}

/** Starts the production build (`next start`) on a free port and waits until /api/health is ok. */
export async function startAppServer(databaseUrl: string): Promise<AppServer> {
  if (!existsSync(path.join(APP_DIR, ".next/BUILD_ID"))) {
    throw new Error("No production build found. Run `npm run build` before `npm run test:integration`.");
  }

  const port = await findFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(NEXT_BIN, ["start", "--port", String(port), "--hostname", "127.0.0.1"], {
    cwd: APP_DIR,
    env: childEnv(databaseUrl),
    stdio: "pipe",
  });
  const output = collectOutput(child);

  try {
    await waitForHealthy(baseUrl, child);
  } catch (error) {
    child.kill("SIGTERM");
    throw new Error(`${(error as Error).message}\n--- next start output ---\n${output.join("")}`);
  }

  return {
    baseUrl,
    stop: () => stopProcess(child),
  };
}

function collectOutput(child: ChildProcess): string[] {
  const output: string[] = [];
  child.stdout?.on("data", (chunk: Buffer) => output.push(chunk.toString()));
  child.stderr?.on("data", (chunk: Buffer) => output.push(chunk.toString()));
  return output;
}

async function waitForHealthy(baseUrl: string, child: ChildProcess): Promise<void> {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  let lastProblem = "no response yet";

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`next start exited early with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
      lastProblem = `HTTP ${response.status}: ${await response.text()}`;
    } catch (error) {
      lastProblem = (error as Error).message;
    }
    await new Promise((resolve) => setTimeout(resolve, HEALTH_POLL_MS));
  }

  throw new Error(`App did not become healthy within ${HEALTH_TIMEOUT_MS} ms (${lastProblem})`);
}

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function stopProcess(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    child.once("close", () => resolve());
    child.kill("SIGTERM");
  });
}
