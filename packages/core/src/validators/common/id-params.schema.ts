import { z } from "zod";

import { uuidSchema } from "./uuid.schema.ts";

/** Route params of a `[id]` segment. Unknown keys are rejected. */
export const idParamsSchema = z.strictObject({ id: uuidSchema });

export type IdParams = z.infer<typeof idParamsSchema>;
