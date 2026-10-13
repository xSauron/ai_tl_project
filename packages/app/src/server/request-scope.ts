import "server-only";

import { createRequestScope, type RequestCradle } from "@plant-ai/core";

/**
 * Runs `fn` inside a fresh Awilix request scope (own forked EntityManager)
 * and disposes the scope afterwards. Use in Server Components, Server Actions
 * and Route Handlers:
 *
 *   const gardens = await withRequestScope(({ gardenService }) => gardenService.list());
 */
export async function withRequestScope<T>(fn: (cradle: RequestCradle) => Promise<T>): Promise<T> {
  const scope = await createRequestScope();
  try {
    return await fn(scope.cradle);
  } finally {
    await scope.dispose();
  }
}
