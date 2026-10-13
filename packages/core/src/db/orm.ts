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
