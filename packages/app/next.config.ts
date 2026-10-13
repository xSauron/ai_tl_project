import { existsSync } from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";

// Single source of env config: `.env.local` / `.env` at the monorepo root
// (shared with the MikroORM CLI). Already-set env vars always win.
for (const file of [".env.local", ".env"]) {
  const envPath = path.resolve(import.meta.dirname, "../..", file);
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

const nextConfig: NextConfig = {
  // MikroORM drivers and pg must run as native Node modules, not be bundled.
  // (@plant-ai/core itself is a workspace package and is always bundled.)
  serverExternalPackages: [
    "@mikro-orm/core",
    "@mikro-orm/sql",
    "@mikro-orm/postgresql",
    "@mikro-orm/migrations",
    "pg",
  ],
};

export default nextConfig;
