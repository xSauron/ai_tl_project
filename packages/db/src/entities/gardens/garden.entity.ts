import { defineEntity, p } from "@mikro-orm/postgresql";

import { User } from "../auth/user.entity.ts";
import { baseProperties } from "../base.entity.ts";

/**
 * A garden is owned by one user (D15: one account per person, no sharing).
 * Beds, plantings and operations resolve their ownership through it.
 */
const GardenSchema = defineEntity({
  name: "Garden",
  tableName: "gardens",
  properties: {
    ...baseProperties,
    name: p.string().length(120),
    description: p.text().nullable(),
    owner: () => p.manyToOne(User).deleteRule("cascade").index(),
  },
});

export class Garden extends GardenSchema.class {}
GardenSchema.setClass(Garden);
