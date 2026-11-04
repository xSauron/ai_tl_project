import { LockMode, type EntityManager, type EntityName, type FilterQuery } from "@mikro-orm/postgresql";

import type { OwnedEntity } from "./ownership.ts";

/**
 * Loads a row with `SELECT … FOR UPDATE`, so concurrent transactions that lock
 * the same row run one after another (e.g. two creates racing a per-user
 * limit). Must run inside `em.transactional`; MikroORM throws otherwise.
 */
export function findForUpdate<T extends OwnedEntity>(
  em: EntityManager,
  entity: EntityName<T>,
  id: string,
): Promise<T | null> {
  return em.findOne(entity, { id } as FilterQuery<T>, { lockMode: LockMode.PESSIMISTIC_WRITE });
}
