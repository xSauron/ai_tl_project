import { defineConfig, type Options } from "@mikro-orm/postgresql";

import { env } from "../config/env.ts";
import { entities } from "../entities/index.ts";

/**
 * Runtime ORM configuration shared by the Next.js app and the CLI.
 * Entities are listed explicitly (no folder discovery) so the config works
 * identically when bundled by Next.js and when run through the MikroORM CLI.
 */
export function createOrmConfig(overrides: Options = {}): Options {
  return defineConfig({
    clientUrl: env.databaseUrl,
    entities,
    pool: { min: env.dbPoolMin, max: env.dbPoolMax },
    debug: env.dbDebug,
    // Forces request-scoped forks; using the global EM throws.
    allowGlobalContext: false,
    ...overrides,
  });
}
