import { z } from "zod";

import { tooLongMessage, tooShortMessage } from "../common/bounded-text.ts";
import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../limits.ts";

export const INVALID_EMAIL_MESSAGE = "Enter a valid e-mail address";
export const REQUIRED_MESSAGE = "Required";

const email = z
  .string({ error: INVALID_EMAIL_MESSAGE })
  .trim()
  .max(MAX_EMAIL_LENGTH, { error: tooLongMessage(MAX_EMAIL_LENGTH) })
  .pipe(z.email({ error: INVALID_EMAIL_MESSAGE }));

/** Passwords are never trimmed: spaces are part of the secret. */
const newPassword = z
  .string({ error: REQUIRED_MESSAGE })
  .min(MIN_PASSWORD_LENGTH, { error: tooShortMessage(MIN_PASSWORD_LENGTH) })
  .max(MAX_PASSWORD_LENGTH, { error: tooLongMessage(MAX_PASSWORD_LENGTH) });

/** `POST /api/auth/register` and the register form. */
export const registerSchema = z.strictObject({ email, password: newPassword });
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * `POST /api/auth/login` and the login form. Only bounds, no password policy:
 * the policy could change after an account was made, and a failed policy
 * check must not read differently from a wrong password.
 */
export const loginSchema = z.strictObject({
  email: z
    .string({ error: REQUIRED_MESSAGE })
    .trim()
    .min(1, { error: REQUIRED_MESSAGE })
    .max(MAX_EMAIL_LENGTH, { error: tooLongMessage(MAX_EMAIL_LENGTH) }),
  password: z
    .string({ error: REQUIRED_MESSAGE })
    .min(1, { error: REQUIRED_MESSAGE })
    .max(MAX_PASSWORD_LENGTH, { error: tooLongMessage(MAX_PASSWORD_LENGTH) }),
});
export type LoginInput = z.infer<typeof loginSchema>;
