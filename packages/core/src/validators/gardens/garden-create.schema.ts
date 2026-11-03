import { z } from "zod";

import { boundedText } from "../common/bounded-text.ts";
import { MAX_DESCRIPTION_LENGTH, MAX_GARDEN_NAME_LENGTH } from "../limits.ts";

/** An empty or whitespace-only description means "no description" and is stored as `null`. */
const description = boundedText(MAX_DESCRIPTION_LENGTH, { min: 0 })
  .transform((text) => (text === "" ? null : text))
  .nullable()
  .optional();

/** `POST /api/gardens` and the new-garden form. */
export const gardenCreateSchema = z.strictObject({
  name: boundedText(MAX_GARDEN_NAME_LENGTH),
  description,
});
export type GardenCreateInput = z.infer<typeof gardenCreateSchema>;
