import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const SRC_DIR = path.resolve(import.meta.dirname, "..");
/** Storybook-only folders: their classes never reach an app. */
const STORYBOOK_ONLY_DIRS = new Set(["examples", "foundations"]);

function hasShippedComponent(dir: string): boolean {
  return readdirSync(dir, { recursive: true, encoding: "utf8" }).some(
    (file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx") && !file.endsWith(".stories.tsx"),
  );
}

describe("globals.css", () => {
  it("tells Tailwind to scan every folder that ships components", () => {
    // Regression: `backend/` was missing, so CrudForm and friends lost their token classes in the app.
    const css = readFileSync(path.join(import.meta.dirname, "globals.css"), "utf8");
    const componentDirs = readdirSync(SRC_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !STORYBOOK_ONLY_DIRS.has(entry.name))
      .map((entry) => entry.name)
      .filter((name) => hasShippedComponent(path.join(SRC_DIR, name)));

    expect(componentDirs).toEqual(expect.arrayContaining(["backend", "components"]));
    for (const dir of componentDirs) {
      expect(css).toContain(`@source "../${dir}";`);
    }
  });
});
