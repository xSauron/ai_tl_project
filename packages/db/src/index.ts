/**
 * @plantai/db — persistence: entities, migrations, ORM config.
 * The only package that imports `@mikro-orm/*`; others use the types re-exported here.
 */
export type { EntityManager, EntityName, MikroORM } from "@mikro-orm/postgresql";
export * from "./entities/index.ts";
export { isUniqueViolation } from "./errors.ts";
export { findForUpdate } from "./locking.ts";
export { findOwned, ownedBy, type OwnedEntity, type OwnerFilter } from "./ownership.ts";
export { getOrm, closeOrm, checkDbConnection, type DbConnectionStatus } from "./orm.ts";
