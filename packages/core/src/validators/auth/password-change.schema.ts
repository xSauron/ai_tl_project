import { z } from "zod";

import { tooLongMessage, tooShortMessage } from "../common/bounded-text.ts";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../limits.ts";
import { REQUIRED_MESSAGE } from "./credentials.schema.ts";

/** `POST /api/auth/password` and the settings form. Neither password is trimmed. */
export const passwordChangeSchema = z.strictObject({
  // Only bounds: the current password was set under whatever policy applied then.
  currentPassword: z
    .string({ error: REQUIRED_MESSAGE })
    .min(1, { error: REQUIRED_MESSAGE })
    .max(MAX_PASSWORD_LENGTH, { error: tooLongMessage(MAX_PASSWORD_LENGTH) }),
  newPassword: z
    .string({ error: REQUIRED_MESSAGE })
    .min(MIN_PASSWORD_LENGTH, { error: tooShortMessage(MIN_PASSWORD_LENGTH) })
    .max(MAX_PASSWORD_LENGTH, { error: tooLongMessage(MAX_PASSWORD_LENGTH) }),
});
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
