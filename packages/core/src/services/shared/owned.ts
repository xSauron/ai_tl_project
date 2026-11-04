import { findOwned, type EntityManager, type EntityName, type OwnedEntity, type OwnerFilter } from "@plantai/db";

import { NotFoundError } from "../../http/errors.ts";

export interface FindOwnedOrFailOptions {
  /** Overrides the generic not-found message; it must not reveal whether the row exists. */
  message?: string;
}

/**
 * `findOwned` that throws `NotFoundError` when the row is missing **or** belongs to someone else.
 * Both cases raise the same error, so a caller can't probe for other users' ids.
 */
export async function findOwnedOrFail<T extends OwnedEntity>(
  em: EntityManager,
  entity: EntityName<T>,
  id: string,
  filter: OwnerFilter<T>,
  { message }: FindOwnedOrFailOptions = {},
): Promise<T> {
  const found = await findOwned(em, entity, id, filter);
  if (!found) {
    throw new NotFoundError({ message });
  }
  return found;
}
