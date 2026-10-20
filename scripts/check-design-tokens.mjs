#!/usr/bin/env node
/**
 * CI gate for the Plant.AI design system (packages/ui): every value a
 * component uses must come from a token.
 *
 * Fails (non-zero exit) when it finds, anywhere under `packages/ui/src` or
 * `packages/ui/.storybook` except the tokens files themselves:
 *   1. a color literal (hex, rgb(), hsl(), oklch()) — those belong only in
 *      `packages/ui/src/styles/**` (the raw/semantic token layer) or
 *      `packages/ui/.storybook/docs-blocks/**` (doc tooling that parses
 *      color syntax rather than hardcoding a design color);
 *   2. a Tailwind default-palette color class (e.g. `bg-zinc-900`,
 *      `text-white`) — components use semantic classes (`bg-primary`,
 *      `text-phase-sow-foreground`), never the raw palette;
 *   3. an arbitrary Tailwind value (`p-[13px]`, `top-[3px]`, including
 *      `[var(--x)]` — a component token still needs a named `@theme` entry,
 *      not an inline arbitrary reference).
 *
 * Run directly (`node scripts/check-design-tokens.mjs`) or wire into CI.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..");

export const SCAN_ROOTS = ["packages/ui/src", "packages/ui/.storybook"];

// Paths allowed to hold raw color literals: the token layer itself, plus
// Storybook-only doc tooling (rule 5 exception) that legitimately
// pattern-matches color syntax (e.g. parsing "rgb(...)" strings) rather
// than hardcoding a design color.
export const COLOR_LITERAL_ALLOWED_PREFIXES = [
  "packages/ui/src/styles",
  "packages/ui/.storybook/docs-blocks",
];

export const SCANNED_EXTENSIONS = [".ts", ".tsx", ".mdx", ".css"];

const SKIP_DIR_NAMES = new Set(["node_modules", "storybook-static", "coverage", "fonts"]);

// Tailwind v4's default named color families (components.json baseColor is
// "neutral" for the shadcn base, but once a component is on tokens it must
// never reach for any of these directly).
const TAILWIND_PALETTE_FAMILIES = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
  "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
  "white", "black",
];

const TAILWIND_UTILITY_PREFIXES = [
  "bg", "text", "border", "ring", "ring-offset", "fill", "stroke", "outline",
  "decoration", "accent", "caret", "divide", "shadow", "from", "via", "to",
];

const COLOR_LITERAL_RE = /(#[0-9a-fA-F]{3,8}\b)|(\b(?:rgb|rgba|hsl|hsla|oklch)\s*\()/g;

const paletteFamilyGroup = TAILWIND_PALETTE_FAMILIES.join("|");
const prefixGroup = TAILWIND_UTILITY_PREFIXES.join("|");
const PALETTE_CLASS_RE = new RegExp(
  `\\b(?:${prefixGroup})-(?:${paletteFamilyGroup})(?:-\\d{2,3})?\\b`,
  "g",
);

// Matches Tailwind's arbitrary-value syntax, e.g. `p-[13px]`, `top-[3px]`,
// `w-[220px]`, `rounded-[var(--x)]` — a hardcoded or inline-referenced value
// instead of a themed utility. This intentionally also matches variant
// *selector* syntax like `data-[state=open]` or `has-[>svg]`; those are
// filtered out below because they describe a condition, not a design value.
const ARBITRARY_VALUE_RE = /\b([a-z][a-z-]*)-\[([^\]]+)\]/g;

// Utility families whose arbitrary-value form expresses CSS mechanics
// (which properties transition, track sizing with `auto`/`fr`) rather than a
// design value from the token scale. Allow-listed by name, not silently.
const ARBITRARY_VALUE_SAFE_PREFIXES = new Set([
  "transition",
  "grid-rows",
  "grid-cols",
  "grid-template-columns",
  "grid-template-rows",
  "will-change",
]);

function isDesignValueArbitrary(prefix, content) {
  if (ARBITRARY_VALUE_SAFE_PREFIXES.has(prefix)) return false;
  // Variant/selector syntax, not a value: data-[state=x], has-[>svg],
  // group-data-[disabled=true], aria-[current=page], etc.
  if (content.includes("=")) return false;
  if (/^[>~+&]/.test(content)) return false;
  return true;
}

function isScannable(filePath) {
  return SCANNED_EXTENSIONS.includes(path.extname(filePath));
}

function colorLiteralsAllowed(relativePath) {
  return COLOR_LITERAL_ALLOWED_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

function walk(dir, repoRoot, out) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIR_NAMES.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, repoRoot, out);
    } else if (isScannable(full)) {
      out.push(full);
    }
  }
}

function lineAndColumnAt(content, index) {
  const upToIndex = content.slice(0, index);
  const line = upToIndex.split("\n").length;
  const column = index - upToIndex.lastIndexOf("\n");
  return { line, column };
}

function findMatches(content, regex) {
  const matches = [];
  for (const match of content.matchAll(regex)) {
    matches.push({ text: match[0], index: match.index });
  }
  return matches;
}

export function scan(repoRoot = REPO_ROOT) {
  const files = [];
  for (const root of SCAN_ROOTS) {
    const abs = path.join(repoRoot, root);
    try {
      walk(abs, repoRoot, files);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
  }

  const violations = [];
  for (const file of files) {
    const relativePath = path.relative(repoRoot, file).split(path.sep).join("/");
    const content = readFileSync(file, "utf8");
    const allowColorLiterals = colorLiteralsAllowed(relativePath);

    if (!allowColorLiterals) {
      for (const { text, index } of findMatches(content, COLOR_LITERAL_RE)) {
        const { line, column } = lineAndColumnAt(content, index);
        violations.push({
          file: relativePath,
          line,
          column,
          rule: "color-literal",
          text,
        });
      }
    }

    for (const { text, index } of findMatches(content, PALETTE_CLASS_RE)) {
      const { line, column } = lineAndColumnAt(content, index);
      violations.push({ file: relativePath, line, column, rule: "tailwind-palette-class", text });
    }

    for (const match of content.matchAll(ARBITRARY_VALUE_RE)) {
      const [text, prefix, value] = match;
      if (!isDesignValueArbitrary(prefix, value)) continue;
      const { line, column } = lineAndColumnAt(content, match.index);
      violations.push({ file: relativePath, line, column, rule: "tailwind-arbitrary-value", text });
    }
  }

  return violations;
}

export function formatViolation(v) {
  return `${v.file}:${v.line}:${v.column}  [${v.rule}]  ${v.text}`;
}

export const defaultIo = {
  log: (msg) => console.log(msg),
  error: (msg) => console.error(msg),
  setExitCode: (code) => {
    process.exitCode = code;
  },
};

/** Testable entry point. `io` is injected so the CLI wrapper (excluded from coverage) stays a one-liner. */
export function main(io = defaultIo, repoRoot = REPO_ROOT) {
  const violations = scan(repoRoot);
  if (violations.length === 0) {
    io.log("check-design-tokens: no values outside the token layer found.");
    return violations;
  }
  io.error(`check-design-tokens: ${violations.length} value(s) outside the token layer:\n`);
  for (const v of violations) {
    io.error("  " + formatViolation(v));
  }
  io.error("\nUse a semantic or component token from packages/ui/src/styles/tokens instead.");
  io.setExitCode(1);
  return violations;
}
