/**
 * @plantai/core — server-only domain package.
 * Never import this from a Client Component.
 */
export { entities, Garden, getOrm, closeOrm, checkDbConnection, type DbConnectionStatus } from "@plantai/db";
export { getContainer, type AppContainer, type RequestScope } from "./container/container.ts";
export type { AppCradle, RequestCradle } from "./container/cradle.ts";
export { withScope } from "./container/scope.ts";
export {
  apiHandler,
  createApiHandler,
  CSRF_HEADER,
  CSRF_HEADER_VALUE,
  ROOT_FIELD_ERROR_KEY,
  type ApiContext,
  type ApiHandlerOptions,
  type ApiRouteContext,
  type ResolveActor,
  type RouteHandler,
} from "./http/apiHandler.ts";
export {
  clearSessionCookie,
  issueSessionCookie,
  requireSession,
  SESSION_COOKIE,
  verifySessionToken,
  type Actor,
} from "./http/auth.ts";
export { credentialsRateLimit } from "./http/credentials-rate-limit.ts";
export {
  makeCrudRoute,
  type CrudListOptions,
  type CrudRouteOptions,
  type CrudRoutes,
  type CrudService,
  type CrudServiceKey,
} from "./http/makeCrudRoute.ts";
export {
  AiUnavailableError,
  AppError,
  ConflictError,
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
  PayloadTooLargeError,
  RateLimitedError,
  UnauthorizedError,
  ValidationError,
  type FieldErrors,
} from "./http/errors.ts";
export { GardenService, type CreateGardenInput } from "./services/gardens/garden.service.ts";
export type { UserDto } from "./services/auth/user.dto.ts";
export type { GardenDto } from "./services/gardens/garden.dto.ts";
