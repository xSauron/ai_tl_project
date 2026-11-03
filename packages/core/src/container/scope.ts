import { createRequestScope } from "./container.ts";
import type { RequestCradle } from "./cradle.ts";

/**
 * Runs `fn` inside a fresh Awilix request scope (own forked EntityManager)
 * and disposes the scope afterwards. Use in Server Components, Server Actions
 * and Route Handlers:
 *
 *   const gardens = await withScope(({ gardenService }) => gardenService.list());
 */
export async function withScope<T>(fn: (cradle: RequestCradle) => Promise<T>): Promise<T> {
  const scope = await createRequestScope();
  try {
    return await fn(scope.cradle);
  } finally {
    await scope.dispose();
  }
}
