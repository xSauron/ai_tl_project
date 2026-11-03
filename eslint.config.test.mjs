import path from "node:path";

import { ESLint } from "eslint";
import { beforeAll, describe, expect, it } from "vitest";

const LAYER_RULE = "no-restricted-imports";
const LINT_TIMEOUT_MS = 30_000;

const fixturePath = (packageName, file = "src/layer-fixture.ts") =>
  path.join(import.meta.dirname, "packages", packageName, file);

describe("eslint.config.mjs layer rules", () => {
  let eslint;

  beforeAll(() => {
    eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: path.join(import.meta.dirname, "eslint.config.mjs"),
    });
  });

  const layerViolations = async (packageName, source, file) => {
    const [result] = await eslint.lintText(source, { filePath: fixturePath(packageName, file) });
    return result.messages.filter((message) => message.ruleId === LAYER_RULE);
  };

  it.each([
    ["ui", 'import "@plantai/core";'],
    ["ui", 'import "@plantai/db";'],
    ["ui", 'import "next/link";'],
    ["db", 'import "@plantai/core";'],
    ["db", 'import "@plantai/ui/components/button";'],
    ["db", 'import "next/server";'],
    ["core", 'import "@mikro-orm/core";'],
    ["core", 'import type { EntityManager } from "@mikro-orm/postgresql";'],
    ["core", 'import "next/server";'],
    ["core", 'import "@plantai/ui/components/button";'],
    ["core", 'import "@plantai/app";'],
    ["app", 'import "@plantai/db";'],
    ["app", 'import "@mikro-orm/core";'],
    ["core", 'import "../../db/src/index.ts";'],
  ])("%s rejects %s", async (packageName, source) => {
    expect(await layerViolations(packageName, source)).toHaveLength(1);
  }, LINT_TIMEOUT_MS);

  it.each([
    ["app", 'import "@plantai/core";'],
    ["app", 'import "@plantai/ui/components/button";'],
    ["app", 'import "next/server";'],
    ["core", 'import "@plantai/db";'],
    ["db", 'import "@mikro-orm/core";'],
  ])("%s allows %s", async (packageName, source) => {
    expect(await layerViolations(packageName, source)).toEqual([]);
  }, LINT_TIMEOUT_MS);

  it("applies the layer rules outside src/ too", async () => {
    expect(await layerViolations("ui", 'import "@plantai/core";', ".storybook/fixture.tsx")).toHaveLength(1);
  }, LINT_TIMEOUT_MS);
});
