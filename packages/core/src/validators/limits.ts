/**
 * Input bounds shared by the Zod schemas, services and route handlers.
 * Client-safe: plain constants, no imports.
 */

/** RFC 5321 caps a forward path at 256 octets, which leaves 254 for the address. */
export const MAX_EMAIL_LENGTH = 254;
export const MIN_PASSWORD_LENGTH = 10;
/** Upper bound keeps bcrypt hashing cost bounded on hostile input. */
export const MAX_PASSWORD_LENGTH = 128;

export const MAX_GARDEN_NAME_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_GARDENS_PER_USER = 20;

const BYTES_PER_KIB = 1024;
/** `apiHandler` rejects a JSON body above this size before `JSON.parse` (413). */
export const MAX_JSON_BODY_BYTES = 64 * BYTES_PER_KIB;
