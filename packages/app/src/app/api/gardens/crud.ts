import { makeCrudRoute } from "@plantai/core";
import { gardenCreateSchema, gardenUpdateSchema } from "@plantai/core/validators";

/** Both garden route files share one definition, so the schemas can't drift apart. */
export const gardenRoutes = makeCrudRoute({
  service: "gardenService",
  createSchema: gardenCreateSchema,
  updateSchema: gardenUpdateSchema,
});
