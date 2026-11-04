import { User, type EntityManager } from "@plantai/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ERROR_CODES } from "../../http/errors.ts";
import { hashPassword, verifyPassword } from "./password.ts";
import {
  INVALID_CREDENTIALS_MESSAGE,
  normalizeEmail,
  REGISTRATION_FAILED_MESSAGE,
  UserService,
  WRONG_CURRENT_PASSWORD_MESSAGE,
} from "./user.service.ts";

/** Stands in for MikroORM's exception, which `core` may not import (layer rule). */
class DuplicateKeyError extends Error {}

vi.mock("@plantai/db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@plantai/db")>()),
  isUniqueViolation: (error: unknown) => error instanceof DuplicateKeyError,
}));

vi.mock("./password.ts", () => ({
  hashPassword: vi.fn(async (password: string) => `hashed:${password}`),
  verifyPassword: vi.fn(),
}));

const STORED = { id: "u1", email: "ala@example.com", passwordHash: "hashed:secret-pass", emailVerifiedAt: null };

function createEm() {
  const em = {
    findOne: vi.fn(),
    create: vi.fn((_entity: unknown, data: object) => ({ id: "u-new", ...data })),
    flush: vi.fn(),
  };
  return { em, service: new UserService({ em: em as unknown as EntityManager }) };
}

beforeEach(() => {
  vi.mocked(hashPassword).mockClear();
  vi.mocked(verifyPassword).mockReset();
});

describe("normalizeEmail", () => {
  it.each([
    ["  Ala@Example.COM ", "ala@example.com"],
    ["ala@example.com", "ala@example.com"],
  ])("normalizes %j", (input, expected) => {
    expect(normalizeEmail(input)).toBe(expected);
  });
});

describe("UserService.register", () => {
  it("stores the normalized e-mail and the hash, unconfirmed, and returns the DTO", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(null);

    const user = await service.register({ email: " Ala@Example.com", password: "secret-pass" });

    expect(em.findOne).toHaveBeenCalledWith(User, { email: "ala@example.com" });
    expect(em.create).toHaveBeenCalledWith(User, {
      email: "ala@example.com",
      passwordHash: "hashed:secret-pass",
      emailVerifiedAt: null,
    });
    expect(em.flush).toHaveBeenCalledOnce();
    expect(user).toStrictEqual({ id: "u-new", email: "ala@example.com", isEmailVerified: false });
  });

  it("fails generically for a taken e-mail, after hashing like a new one", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(STORED);

    const error = await service.register({ email: "ala@example.com", password: "secret-pass" }).catch((e: unknown) => e);

    expect(error).toMatchObject({ code: ERROR_CODES.REGISTRATION_FAILED, status: 422, message: REGISTRATION_FAILED_MESSAGE });
    expect(hashPassword).toHaveBeenCalledOnce();
    expect(em.create).not.toHaveBeenCalled();
  });

  it("maps a lost race on the unique index to the same generic error", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(null);
    em.flush.mockRejectedValue(new DuplicateKeyError("duplicate key"));

    await expect(service.register({ email: "ala@example.com", password: "secret-pass" })).rejects.toMatchObject({
      code: ERROR_CODES.REGISTRATION_FAILED,
      message: REGISTRATION_FAILED_MESSAGE,
    });
  });

  it("rethrows any other flush failure", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(null);
    em.flush.mockRejectedValue(new Error("db down"));

    await expect(service.register({ email: "ala@example.com", password: "secret-pass" })).rejects.toThrow("db down");
  });
});

describe("UserService.authenticate", () => {
  it("returns the DTO for the right password, looking up the normalized e-mail", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(STORED);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    await expect(service.authenticate({ email: "ALA@example.com ", password: "secret-pass" })).resolves.toStrictEqual({
      id: "u1",
      email: "ala@example.com",
      isEmailVerified: false,
    });
    expect(em.findOne).toHaveBeenCalledWith(User, { email: "ala@example.com" });
    expect(verifyPassword).toHaveBeenCalledWith("secret-pass", STORED.passwordHash);
  });

  it.each([
    { case: "wrong password", stored: STORED, isValid: false, hash: STORED.passwordHash },
    { case: "unknown e-mail", stored: null, isValid: false, hash: null },
  ])("rejects a $case with the same generic 401", async ({ stored, isValid, hash }) => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(stored);
    vi.mocked(verifyPassword).mockResolvedValue(isValid);

    await expect(service.authenticate({ email: "ala@example.com", password: "nope-nope-nope" })).rejects.toMatchObject({
      code: ERROR_CODES.INVALID_CREDENTIALS,
      status: 401,
      message: INVALID_CREDENTIALS_MESSAGE,
    });
    // An unknown e-mail still pays for a compare (dummy hash inside verifyPassword).
    expect(verifyPassword).toHaveBeenCalledWith("nope-nope-nope", hash);
  });
});

describe("UserService.getById", () => {
  it("returns the DTO of an existing user", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(STORED);

    await expect(service.getById("u1")).resolves.toStrictEqual({ id: "u1", email: "ala@example.com", isEmailVerified: false });
    expect(em.findOne).toHaveBeenCalledWith(User, { id: "u1" });
  });

  it("returns null for a deleted account", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(null);

    await expect(service.getById("u1")).resolves.toBeNull();
  });
});

describe("UserService.changePassword", () => {
  const ACTOR = { userId: "u1" };
  const INPUT = { currentPassword: "secret-pass", newPassword: "brand-new-pass" };

  it("checks the current password, stores the new hash and flushes", async () => {
    const { em, service } = createEm();
    const stored = { ...STORED };
    em.findOne.mockResolvedValue(stored);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    await expect(service.changePassword(ACTOR, INPUT)).resolves.toBeUndefined();
    expect(em.findOne).toHaveBeenCalledWith(User, { id: "u1" });
    expect(verifyPassword).toHaveBeenCalledWith("secret-pass", STORED.passwordHash);
    expect(stored.passwordHash).toBe("hashed:brand-new-pass");
    expect(em.flush).toHaveBeenCalledOnce();
  });

  it("answers a wrong current password with a field error and changes nothing", async () => {
    const { em, service } = createEm();
    const stored = { ...STORED };
    em.findOne.mockResolvedValue(stored);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(service.changePassword(ACTOR, INPUT)).rejects.toMatchObject({
      status: 422,
      code: ERROR_CODES.VALIDATION_FAILED,
      fieldErrors: { currentPassword: [WRONG_CURRENT_PASSWORD_MESSAGE] },
    });
    expect(stored.passwordHash).toBe(STORED.passwordHash);
    expect(em.flush).not.toHaveBeenCalled();
  });

  it("fails closed with 401 when the account no longer exists", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(null);

    await expect(service.changePassword(ACTOR, INPUT)).rejects.toMatchObject({ status: 401 });
    expect(verifyPassword).not.toHaveBeenCalled();
  });
});
