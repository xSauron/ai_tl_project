import { describe, expect, it } from "vitest";

import * as core from "./index.ts";

describe("@plantai/core public API", () => {
  it("exposes the entities, ORM accessors, container, request scope, services, HTTP layer and errors", () => {
    expect(Object.keys(core).sort()).toEqual([
      "AiUnavailableError",
      "AppError",
      "CSRF_HEADER",
      "CSRF_HEADER_VALUE",
      "ConflictError",
      "ERROR_CODES",
      "ForbiddenError",
      "Garden",
      "GardenService",
      "NotFoundError",
      "PayloadTooLargeError",
      "ROOT_FIELD_ERROR_KEY",
      "RateLimitedError",
      "SESSION_COOKIE",
      "UnauthorizedError",
      "ValidationError",
      "apiHandler",
      "checkDbConnection",
      "clearSessionCookie",
      "closeOrm",
      "createApiHandler",
      "credentialsRateLimit",
      "entities",
      "getContainer",
      "getOrm",
      "issueSessionCookie",
      "makeCrudRoute",
      "requireSession",
      "verifySessionToken",
      "withScope",
    ]);
  });
});
