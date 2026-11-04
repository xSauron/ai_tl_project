import { apiHandler, AUTH_RATE_LIMIT } from "@plantai/core";
import { passwordChangeSchema } from "@plantai/core/validators";

/** Changes the signed-in user's password; guessing the current one is capped per user. */
export const POST = apiHandler(
  {
    auth: "required",
    body: passwordChangeSchema,
    rateLimit: [{ name: "password-change", ...AUTH_RATE_LIMIT, keys: ({ actor }) => [`user:${actor.userId}`] }],
  },
  async ({ actor, body, cradle }) => {
    await cradle.userService.changePassword(actor, body);
    return null;
  },
);
