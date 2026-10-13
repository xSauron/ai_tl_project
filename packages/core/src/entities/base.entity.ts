import { p } from "@mikro-orm/postgresql";

/**
 * Columns shared by every entity: UUID primary key + audit timestamps.
 * Spread into `properties` of `defineEntity`.
 */
export const baseProperties = {
  id: p.uuid().primary().onCreate(() => crypto.randomUUID()),
  createdAt: p.datetime().onCreate(() => new Date()),
  updatedAt: p
    .datetime()
    .onCreate(() => new Date())
    .onUpdate(() => new Date()),
};
