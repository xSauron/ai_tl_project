/**
 * @plantai/db — persistence: entities, migrations, ORM config.
 * The only package that imports `@mikro-orm/*`; others use the types re-exported here.
 */
export type { EntityManager, MikroORM } from "@mikro-orm/postgresql";
export * from "./entities/index.ts";
export { getOrm, closeOrm, checkDbConnection, type DbConnectionStatus } from "./orm.ts";
