import type { z } from "zod";

import { gardenCreateSchema } from "./garden-create.schema.ts";

/** `PATCH /api/gardens/[id]`: any subset of the create fields; omitted keys stay unchanged. */
export const gardenUpdateSchema = gardenCreateSchema.partial();
export type GardenUpdateInput = z.infer<typeof gardenUpdateSchema>;
