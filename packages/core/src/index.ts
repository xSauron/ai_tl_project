/**
 * @plantai/core — server-only domain package.
 * Never import this from a Client Component.
 */
export { entities, Garden, getOrm, closeOrm, checkDbConnection, type DbConnectionStatus } from "@plantai/db";
export {
  getContainer,
  createRequestScope,
  type AppContainer,
  type AppCradle,
  type RequestCradle,
  type RequestScope,
} from "./di/container.ts";
export { GardenService, type CreateGardenInput } from "./modules/gardens/garden.service.ts";
