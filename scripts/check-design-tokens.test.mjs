import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { defaultIo, formatViolation, main, scan } from "./check-design-tokens.mjs";

let repoRoot;

function write(relativePath, content) {
  const full = path.join(repoRoot, relativePath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
}

beforeEach(() => {
  repoRoot = mkdtempSync(path.join(tmpdir(), "check-design-tokens-"));
});

afterEach(() => {
  rmSync(repoRoot, { recursive: true, force: true });
});

describe("scan", () => {
  it("returns no violations for a clean, token-only component", () => {
    write(
      "packages/ui/src/components/button.tsx",
      `export function Button() { return <button className="bg-primary text-primary-foreground rounded-md" /> }`,
    );
    expect(scan(repoRoot)).toEqual([]);
  });

  it("flags a hex color literal outside the tokens directory", () => {
    write("packages/ui/src/components/bad.tsx", `const x = "#ff00aa";`);
    const violations = scan(repoRoot);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      file: "packages/ui/src/components/bad.tsx",
      rule: "color-literal",
      text: "#ff00aa",
    });
    expect(violations[0].line).toBe(1);
  });

  it("flags rgb/hsl/oklch function colors", () => {
    write(
      "packages/ui/src/components/bad2.tsx",
      `const a = "rgb(1,2,3)";\nconst b = "hsl(1 2% 3%)";\nconst c = "oklch(0.5 0.1 10)";`,
    );
    const violations = scan(repoRoot).map((v) => v.text);
    expect(violations).toEqual(["rgb(", "hsl(", "oklch("]);
  });

  it("allows color literals inside packages/ui/src/styles (the tokens layer)", () => {
    write("packages/ui/src/styles/tokens/raw.css", `:root { --raw-blue-50: #e3f2fd; }`);
    expect(scan(repoRoot)).toEqual([]);
  });

  it("allows color literals inside packages/ui/.storybook/docs-blocks (doc tooling that parses color syntax)", () => {
    write("packages/ui/.storybook/docs-blocks/contrast.ts", `const re = /rgba?\\(([^)]+)\\)/;`);
    expect(scan(repoRoot)).toEqual([]);
  });

  it("flags a Tailwind default-palette class", () => {
    write("packages/ui/src/components/bad3.tsx", `<div className="text-white bg-zinc-900" />`);
    const rules = scan(repoRoot).map((v) => v.text);
    expect(rules).toEqual(expect.arrayContaining(["text-white", "bg-zinc-900"]));
  });

  it("flags a real arbitrary design value", () => {
    write("packages/ui/src/components/bad4.tsx", `<div className="p-[13px] ring-[3px]" />`);
    const texts = scan(repoRoot).map((v) => v.text);
    expect(texts).toEqual(["p-[13px]", "ring-[3px]"]);
  });

  it("does not flag Tailwind variant/selector syntax", () => {
    write(
      "packages/ui/src/components/ok.tsx",
      `<div className="data-[state=open]:bg-primary has-[>svg]:px-2 group-data-[disabled=true]:opacity-50" />`,
    );
    expect(scan(repoRoot)).toEqual([]);
  });

  it("does not flag the allow-listed CSS-mechanics arbitrary prefixes", () => {
    write(
      "packages/ui/src/components/ok2.tsx",
      `<div className="transition-[color,box-shadow] grid-cols-[1fr_auto] grid-rows-[auto_auto]" />`,
    );
    expect(scan(repoRoot)).toEqual([]);
  });

  it("skips skip-listed directories (node_modules, storybook-static, coverage, fonts)", () => {
    write("packages/ui/src/node_modules/x.tsx", `const x = "#000000";`);
    write("packages/ui/.storybook/storybook-static/x.tsx", `const x = "#000000";`);
    write("packages/ui/.storybook/fonts/x.css", `src: url("#000000");`);
    expect(scan(repoRoot)).toEqual([]);
  });

  it("only scans known extensions", () => {
    write("packages/ui/src/components/readme.md", `#ff00aa`);
    expect(scan(repoRoot)).toEqual([]);
  });

  it("scans nested directories under both scan roots", () => {
    write("packages/ui/src/components/deep/nested/bad.tsx", `const x = "#abcabc";`);
    write("packages/ui/.storybook/docs/bad.mdx", `color: #abcabc;`);
    const files = scan(repoRoot).map((v) => v.file);
    expect(files).toEqual(
      expect.arrayContaining([
        "packages/ui/src/components/deep/nested/bad.tsx",
        "packages/ui/.storybook/docs/bad.mdx",
      ]),
    );
  });

  it("tolerates a missing scan root (ENOENT)", () => {
    // Neither packages/ui/src nor packages/ui/.storybook exists in repoRoot.
    expect(scan(repoRoot)).toEqual([]);
  });

  it("re-throws a non-ENOENT error from the filesystem", () => {
    // A *file* where a scan root directory is expected makes readdirSync
    // throw ENOTDIR, not ENOENT.
    write("packages/ui/src/.keep", "");
    rmSync(path.join(repoRoot, "packages/ui/src"), { recursive: true, force: true });
    writeFileSync(path.join(repoRoot, "packages/ui/src"), "not a directory");
    expect(() => scan(repoRoot)).toThrow();
  });

  it("reports 1-indexed line and column", () => {
    write("packages/ui/src/components/multi.tsx", `line one\nline two #abcdef here`);
    const [violation] = scan(repoRoot);
    expect(violation.line).toBe(2);
    expect(violation.column).toBe(10);
  });
});

describe("formatViolation", () => {
  it("formats file, position, rule and text", () => {
    expect(
      formatViolation({ file: "a.tsx", line: 1, column: 2, rule: "color-literal", text: "#fff" }),
    ).toBe("a.tsx:1:2  [color-literal]  #fff");
  });
});

describe("main", () => {
  it("logs success and returns no violations for a clean tree", () => {
    const logs = [];
    const io = { log: (m) => logs.push(m), error: () => {}, setExitCode: () => {} };
    const result = main(io, repoRoot);
    expect(result).toEqual([]);
    expect(logs[0]).toMatch(/no values outside the token layer/);
  });

  it("reports every violation and sets a non-zero exit code", () => {
    write("packages/ui/src/components/bad.tsx", `<div className="text-white" />`);
    const errors = [];
    let exitCode;
    const io = {
      log: () => {},
      error: (m) => errors.push(m),
      setExitCode: (code) => {
        exitCode = code;
      },
    };
    const result = main(io, repoRoot);
    expect(result).toHaveLength(1);
    expect(exitCode).toBe(1);
    expect(errors.some((line) => line.includes("text-white"))).toBe(true);
  });
});

describe("defaultIo (real wiring)", () => {
  it("log and error write to the console", () => {
    expect(() => defaultIo.log("check-design-tokens test log")).not.toThrow();
    expect(() => defaultIo.error("check-design-tokens test error")).not.toThrow();
  });

  it("setExitCode sets process.exitCode", () => {
    const original = process.exitCode;
    defaultIo.setExitCode(0);
    expect(process.exitCode).toBe(0);
    process.exitCode = original;
  });
});
