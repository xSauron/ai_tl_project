/**
 * MikroORM CLI entry point (auto-discovered at `./src/mikro-orm.config.ts`).
 * Used only by `npm run db:*` scripts — the app uses `getOrm()` instead.
 */
import { existsSync } from "node:fs";

import { Migrator } from "@mikro-orm/migrations";

import { createOrmConfig } from "./db/config.ts";

// Same `.env` files as the Next.js app: repo root. Existing env vars win.
for (const file of [".env.local", ".env"]) {
  const envPath = new URL(`../../../${file}`, import.meta.url);
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

export default createOrmConfig({
  extensions: [Migrator],
  migrations: {
    path: "./dist/migrations",
    pathTs: "./src/migrations",
    transactional: true,
    allOrNothing: true,
  },
});
