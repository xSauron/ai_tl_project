import { createHash } from "node:crypto";

import bcrypt from "bcryptjs";

/** AGENTS.md minimum; raise it, never lower it (upgrade path: argon2id). */
export const BCRYPT_COST = 12;

const PREHASH_ALGORITHM = "sha256";
/** Hashed only to have a real bcrypt hash to compare against when the account doesn't exist. */
const DUMMY_PASSWORD = "dummy-password-for-timing";

let dummyHashPromise: Promise<string> | undefined;

/**
 * bcrypt reads only the first 72 bytes, and `MAX_PASSWORD_LENGTH` allows 128
 * characters (up to 512 UTF-8 bytes). Hashing first with SHA-256 (base64, 44
 * ASCII bytes, no NUL) makes every byte of the password count.
 */
function prehash(password: string): string {
  return createHash(PREHASH_ALGORITHM).update(password, "utf8").digest("base64");
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(prehash(password), BCRYPT_COST);
}

/**
 * Checks a password against a stored hash. With no hash (unknown e-mail) it
 * still runs one full bcrypt compare, so response time doesn't reveal whether
 * the account exists, and then returns false.
 */
export async function verifyPassword(password: string, passwordHash: string | null): Promise<boolean> {
  if (passwordHash === null) {
    dummyHashPromise ??= hashPassword(DUMMY_PASSWORD);
    await bcrypt.compare(prehash(password), await dummyHashPromise);
    return false;
  }
  return bcrypt.compare(prehash(password), passwordHash);
}
