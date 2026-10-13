import { afterAll, afterEach, beforeAll, inject, type TestContext } from "vitest";

import { Browser } from "./browser.ts";

/** One agent-browser session per test file; full-page screenshot of every failing test. */
export function useBrowser(sessionName: string): () => Browser {
  let browser: Browser | undefined;

  beforeAll(() => {
    browser = new Browser(inject("baseUrl"), sessionName);
  });

  afterEach(async (context: TestContext) => {
    if (browser && context.task.result?.state === "fail") {
      await browser.screenshot(`${sessionName}-${context.task.name}`).catch(() => undefined);
    }
  });

  afterAll(async () => {
    await browser?.close();
  });

  return () => {
    if (!browser) {
      throw new Error("useBrowser(): browser is only available inside tests");
    }
    return browser;
  };
}
