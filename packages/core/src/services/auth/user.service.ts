import { isUniqueViolation, User, type EntityManager } from "@plantai/db";

import type { RequestCradle } from "../../container/cradle.ts";
import { ERROR_CODES, UnauthorizedError, ValidationError } from "../../http/errors.ts";
import { hashPassword, verifyPassword } from "./password.ts";
import { toUserDto, type UserDto } from "./user.dto.ts";

export interface CredentialsInput {
  email: string;
  password: string;
}

/** Shown for every registration failure, including an e-mail that is taken (AGENTS.md: never reveal it). */
export const REGISTRATION_FAILED_MESSAGE = "Could not create the account. If you already have one, log in.";
export const INVALID_CREDENTIALS_MESSAGE = "The e-mail or password is incorrect.";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function registrationFailed(cause?: unknown): ValidationError {
  return new ValidationError(undefined, {
    code: ERROR_CODES.REGISTRATION_FAILED,
    message: REGISTRATION_FAILED_MESSAGE,
    cause,
  });
}

/** Account use cases. Receives a request-scoped `em`; returns DTOs, never entities. */
export class UserService {
  private readonly em: EntityManager;

  constructor({ em }: Pick<RequestCradle, "em">) {
    this.em = em;
  }

  async register(input: CredentialsInput): Promise<UserDto> {
    const email = normalizeEmail(input.email);
    // Hash before the lookup, so a taken e-mail costs the same time as a new one.
    const passwordHash = await hashPassword(input.password);
    if (await this.em.findOne(User, { email })) throw registrationFailed();

    const user = this.em.create(User, { email, passwordHash, emailVerifiedAt: null });
    try {
      await this.em.flush();
    } catch (error) {
      // A concurrent registration won the unique index between our lookup and insert.
      if (isUniqueViolation(error)) throw registrationFailed(error);
      throw error;
    }
    return toUserDto(user);
  }

  /** The session's user, or `null` when the account no longer exists. */
  async getById(userId: string): Promise<UserDto | null> {
    const user = await this.em.findOne(User, { id: userId });
    return user ? toUserDto(user) : null;
  }

  async authenticate(input: CredentialsInput): Promise<UserDto> {
    const user = await this.em.findOne(User, { email: normalizeEmail(input.email) });
    const isValid = await verifyPassword(input.password, user?.passwordHash ?? null);
    if (!user || !isValid) {
      throw new UnauthorizedError({ code: ERROR_CODES.INVALID_CREDENTIALS, message: INVALID_CREDENTIALS_MESSAGE });
    }
    return toUserDto(user);
  }
}
