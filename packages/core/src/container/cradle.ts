import type { EntityManager, MikroORM } from "@plantai/db";

import type { GardenService } from "../services/gardens/garden.service.ts";

/** Singletons registered once per process (per Next.js layer) in the root container. */
export interface AppCradle {
  orm: MikroORM;
}

/** Everything resolvable inside a request scope: one camelCase key per dependency. */
export interface RequestCradle extends AppCradle {
  em: EntityManager;
  gardenService: GardenService;
}
