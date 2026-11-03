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
    ["db", 'import "@plantai/ui/components/ui/button";'],
    ["db", 'import "next/server";'],
    ["core", 'import "@mikro-orm/core";'],
    ["core", 'import type { EntityManager } from "@mikro-orm/postgresql";'],
    ["core", 'import "next/server";'],
    ["core", 'import "@plantai/ui/components/ui/button";'],
    ["core", 'import "@plantai/app";'],
    ["app", 'import "@plantai/db";'],
    ["app", 'import "@mikro-orm/core";'],
    ["core", 'import "../../db/src/index.ts";'],
  ])("%s rejects %s", async (packageName, source) => {
    expect(await layerViolations(packageName, source)).toHaveLength(1);
  }, LINT_TIMEOUT_MS);

  it.each([
    ["app", 'import "@plantai/core";'],
    ["app", 'import "@plantai/ui/components/ui/button";'],
    ["app", 'import "next/server";'],
    ["core", 'import "@plantai/db";'],
    ["db", 'import "@mikro-orm/core";'],
  ])("%s allows %s", async (packageName, source) => {
    expect(await layerViolations(packageName, source)).toEqual([]);
  }, LINT_TIMEOUT_MS);

  describe("client-safe core/src/validators/**", () => {
    const VALIDATOR = "src/validators/layer-fixture.ts";
    const NESTED_VALIDATOR = "src/validators/common/layer-fixture.ts";

    it.each([
      [VALIDATOR, 'import "../services/gardens/garden.service.ts";'],
      [VALIDATOR, 'import "../container/container.ts";'],
      [VALIDATOR, 'import "../config/env.ts";'],
      [VALIDATOR, 'import "../logger.ts";'],
      [VALIDATOR, 'import { NotFoundError } from "../http/errors.ts";'],
      [NESTED_VALIDATOR, 'import "../../http/errors.ts";'],
      [NESTED_VALIDATOR, 'import "../../services/gardens/garden.service.ts";'],
      [NESTED_VALIDATOR, 'import "../../logger";'],
      [VALIDATOR, 'import "@plantai/core";'],
      [VALIDATOR, 'import "@plantai/core/http";'],
      [VALIDATOR, 'import "@plantai/db";'],
      [VALIDATOR, 'import type { Garden } from "@plantai/db";'],
      [VALIDATOR, 'import "server-only";'],
      [VALIDATOR, 'import "pino";'],
      [VALIDATOR, 'import "node:crypto";'],
      [VALIDATOR, 'import "fs";'],
      [VALIDATOR, 'import "fs/promises";'],
      [NESTED_VALIDATOR, 'export * from "../../http/errors.ts";'],
      // The core layer rules still apply inside validators.
      [VALIDATOR, 'import "@mikro-orm/core";'],
      [VALIDATOR, 'import "next/server";'],
      [VALIDATOR, 'import "@plantai/ui";'],
      [VALIDATOR, 'import "@plantai/app";'],
      [NESTED_VALIDATOR, 'import "../../../../db/src/index.ts";'],
    ])("%s rejects %s", async (file, source) => {
      expect(await layerViolations("core", source, file)).toHaveLength(1);
    }, LINT_TIMEOUT_MS);

    it.each([
      [VALIDATOR, 'import { z } from "zod";'],
      [VALIDATOR, 'import "./common/index.ts";'],
      [VALIDATOR, 'import { MAX_EMAIL_LENGTH } from "./limits.ts";'],
      [NESTED_VALIDATOR, 'import { uuidSchema } from "./uuid.schema.ts";'],
      [NESTED_VALIDATOR, 'import { MAX_EMAIL_LENGTH } from "../limits.ts";'],
      [NESTED_VALIDATOR, 'import "../gardens/garden-create.schema.ts";'],
      [VALIDATOR, 'import "@plantai/core/validators";'],
    ])("%s allows %s", async (file, source) => {
      expect(await layerViolations("core", source, file)).toEqual([]);
    }, LINT_TIMEOUT_MS);

    it("leaves the rest of core free to import server code", async () => {
      const source = 'import "../http/errors.ts"; import "pino"; import "node:crypto"; import "@plantai/db";';
      expect(await layerViolations("core", source, "src/services/layer-fixture.ts")).toEqual([]);
    }, LINT_TIMEOUT_MS);
  });

  describe("core/src/services/shared/owned.ts (owned lookup)", () => {
    const OWNED = "src/services/shared/owned.ts";

    it.each([
      'import "@mikro-orm/core";',
      'import type { FilterQuery } from "@mikro-orm/postgresql";',
    ])("rejects %s", async (source) => {
      expect(await layerViolations("core", source, OWNED)).toHaveLength(1);
    }, LINT_TIMEOUT_MS);

    it("allows @plantai/db", async () => {
      const source = 'import { findOwned, type EntityManager } from "@plantai/db";';
      expect(await layerViolations("core", source, OWNED)).toEqual([]);
    }, LINT_TIMEOUT_MS);
  });

  it("applies the layer rules outside src/ too", async () => {
    expect(await layerViolations("ui", 'import "@plantai/core";', ".storybook/fixture.tsx")).toHaveLength(1);
  }, LINT_TIMEOUT_MS);
});
