import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const AGENT_BROWSER_BIN = path.join(REPO_ROOT, "node_modules/.bin/agent-browser");
const SCREENSHOT_DIR = path.join(REPO_ROOT, "test-results/integration");
const COMMAND_TIMEOUT_MS = 30_000;

interface AgentBrowserResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

/**
 * Thin, typed wrapper around the agent-browser CLI.
 * Arguments are passed via execFile (no shell), each test file gets its own session.
 */
export class Browser {
  readonly session: string;
  private readonly baseUrl: string;

  constructor(baseUrl: string, sessionName: string) {
    this.baseUrl = baseUrl;
    this.session = `it-${sessionName}-${process.pid}`;
  }

  async open(pathname: string): Promise<void> {
    await this.run(["open", new URL(pathname, this.baseUrl).toString()]);
    await this.run(["wait", "--load", "load"]);
  }

  async reload(): Promise<void> {
    await this.run(["reload"]);
    await this.run(["wait", "--load", "load"]);
  }

  async title(): Promise<string> {
    return (await this.run<{ title: string }>(["get", "title"])).title;
  }

  async pathname(): Promise<string> {
    return new URL((await this.run<{ url: string }>(["get", "url"])).url).pathname;
  }

  async text(selector: string): Promise<string> {
    return (await this.run<{ text: string }>(["get", "text", selector])).text;
  }

  async headingText(name: string): Promise<string> {
    return (await this.run<{ text: string }>(["find", "role", "heading", "text", "--name", name])).text;
  }

  async clickRole(role: "link" | "button", name: string): Promise<void> {
    await this.run(["find", "role", role, "click", "--name", name]);
  }

  async fillLabel(label: string, value: string): Promise<void> {
    await this.run(["find", "label", label, "fill", value]);
  }

  async waitForText(text: string): Promise<void> {
    await this.run(["wait", "--text", text]);
  }

  async waitForPath(pathname: string): Promise<void> {
    await this.run(["wait", "--url", `**${pathname}`]);
  }

  async screenshot(name: string): Promise<string> {
    await mkdir(SCREENSHOT_DIR, { recursive: true });
    const file = path.join(SCREENSHOT_DIR, `${name.replace(/[^a-z0-9-]+/gi, "-")}.png`);
    await this.run(["screenshot", "--full", file]);
    return file;
  }

  async close(): Promise<void> {
    await this.run(["close"]).catch(() => undefined);
  }

  private async run<T = unknown>(args: string[]): Promise<T> {
    const { stdout } = await execFileAsync(AGENT_BROWSER_BIN, ["--session", this.session, ...args, "--json"], {
      timeout: COMMAND_TIMEOUT_MS,
    }).catch((error: { stdout?: string; stderr?: string; message: string }) => {
      throw new Error(`agent-browser ${args.join(" ")} failed: ${error.stderr || error.stdout || error.message}`);
    });
    const response = JSON.parse(stdout) as AgentBrowserResponse<T>;
    if (!response.success) {
      throw new Error(`agent-browser ${args.join(" ")} failed: ${response.error}`);
    }
    return response.data;
  }
}
