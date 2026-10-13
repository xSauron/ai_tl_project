import type { EntityManager, MikroORM } from "@mikro-orm/postgresql";
import {
  asClass,
  asValue,
  createContainer,
  InjectionMode,
  type AwilixContainer,
} from "awilix";

import { getOrm } from "../db/orm.ts";
import { GardenService } from "../modules/gardens/garden.service.ts";

/** Singletons registered once per process. */
export interface AppCradle {
  orm: MikroORM;
}

/** Everything resolvable inside a request scope. */
export interface RequestCradle extends AppCradle {
  em: EntityManager;
  gardenService: GardenService;
}

export type AppContainer = AwilixContainer<AppCradle>;
export type RequestScope = AwilixContainer<RequestCradle>;

// Module-level, like the ORM — see the note in db/orm.ts.
let containerPromise: Promise<AppContainer> | undefined;

async function buildContainer(): Promise<AppContainer> {
  const container = createContainer<RequestCradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    orm: asValue(await getOrm()),
    // Services are scoped: one instance per request, sharing that request's `em`.
    gardenService: asClass(GardenService).scoped(),
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
 * Call once per request / server action and resolve services from it.
 */
export async function createRequestScope(): Promise<RequestScope> {
  const root = await getContainer();
  const scope = root.createScope<RequestCradle>();
  scope.register({ em: asValue(root.cradle.orm.em.fork() as EntityManager) });
  return scope;
}
