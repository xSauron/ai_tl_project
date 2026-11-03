import type { EntityManager, EntityName, FilterObject, FilterQuery } from "@mikro-orm/postgresql";

/** Every owned entity has a UUID primary key named `id`. */
export type OwnedEntity = { id: string };

/**
 * The owner condition for one entity, e.g. `{ owner: userId }` or `{ garden: { owner: userId } }`.
 * `id` is excluded: `findOwned` sets it, so a filter can never widen the lookup to another row.
 */
export type OwnerFilter<T extends OwnedEntity> = Omit<FilterObject<T>, "id">;

const isMissingOwnerCondition = (filter: object): boolean => {
  const values = Object.values(filter);
  return values.length === 0 || values.some((value) => value === undefined);
};

/**
 * Loads `Entity` by `id` only if it also matches the owner `filter`, in one query: ownership is part of
 * the WHERE clause, never a load-then-check. Returns `null` when the row is missing **or** foreign, so
 * callers can't tell the two apart.
 *
 * Fails closed: an empty filter or an `undefined` condition (e.g. a missing user id) would let MikroORM
 * drop the ownership check, so both throw instead of querying.
 */
export async function findOwned<T extends OwnedEntity>(
  em: EntityManager,
  entity: EntityName<T>,
  id: string,
  filter: OwnerFilter<T>,
): Promise<T | null> {
  if (isMissingOwnerCondition(filter)) {
    throw new TypeError("findOwned requires an owner filter with no undefined conditions.");
  }
  // `id` goes last so a filter smuggling an `id` key (through a cast) can't override it.
  const where = { ...filter, id } as FilterQuery<T>;
  return em.findOne(entity, where);
}
