/**
 * @plantai/core — server-only domain package.
 * Never import this from a Client Component.
 */
export { entities, Garden, getOrm, closeOrm, checkDbConnection, type DbConnectionStatus } from "@plantai/db";
export { getContainer, type AppContainer, type RequestScope } from "./container/container.ts";
export type { AppCradle, RequestCradle } from "./container/cradle.ts";
export { withScope } from "./container/scope.ts";
export { GardenService, type CreateGardenInput } from "./services/gardens/garden.service.ts";
