import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import { BCRYPT_COST, hashPassword, verifyPassword } from "./password.ts";

// Cost 12 is slow by design; each test hashes at most a few times.
const SLOW_TEST_TIMEOUT_MS = 20_000;

describe("password hashing", { timeout: SLOW_TEST_TIMEOUT_MS }, () => {
  it("hashes with bcrypt at cost 12 and verifies the same password only", async () => {
    const hash = await hashPassword("correct horse battery");

    expect(BCRYPT_COST).toBeGreaterThanOrEqual(12);
    expect(bcrypt.getRounds(hash)).toBe(BCRYPT_COST);
    expect(hash).not.toContain("correct horse battery");
    await expect(verifyPassword("correct horse battery", hash)).resolves.toBe(true);
    await expect(verifyPassword("correct horse batterY", hash)).resolves.toBe(false);
  });

  it("salts every hash", async () => {
    const [first, second] = await Promise.all([hashPassword("same password"), hashPassword("same password")]);

    expect(first).not.toBe(second);
  });

  it("counts every byte past bcrypt's 72-byte limit", async () => {
    // Regression: plain bcrypt would accept the second password for the first's hash.
    const prefix = "ż".repeat(40);
    const hash = await hashPassword(`${prefix}-one`);

    await expect(verifyPassword(`${prefix}-two`, hash)).resolves.toBe(false);
    await expect(verifyPassword(`${prefix}-one`, hash)).resolves.toBe(true);
  });

  it("returns false for a missing account after a full compare", async () => {
    await expect(verifyPassword("anything at all", null)).resolves.toBe(false);
    // The dummy hash is cached; the second call reuses it.
    await expect(verifyPassword("anything else", null)).resolves.toBe(false);
  });
});
