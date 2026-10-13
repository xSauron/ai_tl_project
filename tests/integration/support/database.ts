import { randomUUID } from "node:crypto";

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import pg from "pg";

export interface TestDatabase {
  url: string;
  stop(): Promise<void>;
}

const POSTGRES_IMAGE = "postgres:17-alpine";

/**
 * Ephemeral PostgreSQL for one integration run.
 *
 * Default: a throwaway Testcontainers instance (requires Docker — always the case in CI).
 * Fallback for machines without Docker: set INTEGRATION_DATABASE_ADMIN_URL to an existing
 * server; a uniquely named database is created on it and dropped afterwards.
 */
export async function startDatabase(): Promise<TestDatabase> {
  const adminUrl = process.env.INTEGRATION_DATABASE_ADMIN_URL;
  return adminUrl ? createThrowawayDatabase(adminUrl) : startContainer();
}

async function startContainer(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE)
    .withDatabase("plant_ai")
    .withUsername("plant_ai")
    .withPassword("plant_ai")
    .start();

  return {
    url: container.getConnectionUri(),
    stop: async () => {
      await container.stop();
    },
  };
}

async function createThrowawayDatabase(adminUrl: string): Promise<TestDatabase> {
  const name = `plant_ai_it_${randomUUID().replaceAll("-", "")}`;
  await withAdminClient(adminUrl, (client) => client.query(`create database "${name}"`));

  const url = new URL(adminUrl);
  url.pathname = `/${name}`;

  return {
    url: url.toString(),
    stop: async () => {
      await withAdminClient(adminUrl, (client) => client.query(`drop database if exists "${name}" with (force)`));
    },
  };
}

async function withAdminClient<T>(adminUrl: string, fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
