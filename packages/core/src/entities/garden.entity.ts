import { defineEntity, p } from "@mikro-orm/postgresql";

import { baseProperties } from "./base.entity.ts";

const GardenSchema = defineEntity({
  name: "Garden",
  tableName: "gardens",
  properties: {
    ...baseProperties,
    name: p.string().length(120),
    description: p.text().nullable(),
  },
});

export class Garden extends GardenSchema.class {}
GardenSchema.setClass(Garden);
