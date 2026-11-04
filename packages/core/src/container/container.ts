import { getOrm, type EntityManager } from "@plantai/db";
import {
  asClass,
  asValue,
  createContainer,
  InjectionMode,
  type AwilixContainer,
} from "awilix";

import { InMemoryRateLimiter } from "../http/rate-limit.ts";
import { UserService } from "../services/auth/user.service.ts";
import { GardenService } from "../services/gardens/garden.service.ts";
import type { AppCradle, RequestCradle } from "./cradle.ts";

export type AppContainer = AwilixContainer<AppCradle>;
export type RequestScope = AwilixContainer<RequestCradle>;

// Module-level, like the ORM — see the note in @plantai/db orm.ts.
let containerPromise: Promise<AppContainer> | undefined;

async function buildContainer(): Promise<AppContainer> {
  const container = createContainer<RequestCradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    orm: asValue(await getOrm()),
    rateLimiter: asValue(new InMemoryRateLimiter()),
    // Services are scoped: one instance per request, sharing that request's `em`.
    gardenService: asClass(GardenService).scoped(),
    userService: asClass(UserService).scoped(),
  });

  return container as unknown as AppContainer;
}

/** Root container (singletons). Built lazily, once per module instance. */
export function getContainer(): Promise<AppContainer> {
  containerPromise ??= buildContainer().catch((error: unknown) => {
    containerPromise = undefined;
    throw error;
  });
  return containerPromise;
}

/**
 * Creates a per-request scope with its own forked EntityManager (identity map).
 * Prefer `withScope`, which also disposes the scope.
 */
export async function createRequestScope(): Promise<RequestScope> {
  const root = await getContainer();
  const scope = root.createScope<RequestCradle>();
  scope.register({ em: asValue(root.cradle.orm.em.fork() as EntityManager) });
  return scope;
}
