import { MikroORM } from "@mikro-orm/postgresql";

import { createOrmConfig } from "./config.ts";

/*
 * One ORM (and connection pool) per *module instance* — deliberately NOT cached
 * on `globalThis`. Next.js evaluates server code in separate layers (Server
 * Components, Route Handlers, Server Actions), each with its own copy of the
 * entity classes, and MikroORM matches entities by class reference. Sharing one
 * ORM across layers fails with "Metadata for entity X not found".
 * See .ai/lessons/2026-10-13-mikroorm-next-layers.md.
 */
let ormPromise: Promise<MikroORM> | undefined;

/** Returns this module instance's MikroORM (lazy, initialised once). */
export function getOrm(): Promise<MikroORM> {
  ormPromise ??= MikroORM.init(createOrmConfig()).catch((error: unknown) => {
    ormPromise = undefined;
    throw error;
  });
  return ormPromise;
}

export async function closeOrm(): Promise<void> {
  const orm = ormPromise;
  ormPromise = undefined;
  if (orm) {
    await (await orm).close();
  }
}

export type DbConnectionStatus = { ok: true } | { ok: false; reason: string };

/** Readiness probe: runs a real query, since MikroORM 7 connects lazily. */
export async function checkDbConnection(): Promise<DbConnectionStatus> {
  try {
    const orm = await getOrm();
    await orm.em.fork().getConnection().execute("select 1");
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
