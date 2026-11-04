import { UniqueConstraintViolationException } from "@mikro-orm/postgresql";

/**
 * True when a flush failed on a unique constraint (e.g. two registrations
 * racing for one e-mail). `core` can't import `@mikro-orm/*`, so it asks here.
 */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof UniqueConstraintViolationException;
}
