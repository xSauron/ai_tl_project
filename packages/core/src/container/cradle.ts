import type { EntityManager, MikroORM } from "@plantai/db";

import type { RateLimiter } from "../http/rate-limit.ts";
import type { UserService } from "../services/auth/user.service.ts";
import type { GardenService } from "../services/gardens/garden.service.ts";

/** Singletons registered once per process (per Next.js layer) in the root container. */
export interface AppCradle {
  orm: MikroORM;
  /** Root-level so its counters persist across requests (spec A, rate limiter). */
  rateLimiter: RateLimiter;
}

/** Everything resolvable inside a request scope: one camelCase key per dependency. */
export interface RequestCradle extends AppCradle {
  em: EntityManager;
  gardenService: GardenService;
  userService: UserService;
}
