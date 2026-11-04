import { apiHandler, credentialsRateLimit, issueSessionCookie } from "@plantai/core";
import { registerSchema } from "@plantai/core/validators";

/** Creates an account and signs it in; an unconfirmed address may use the app (spec A, Q6). */
export const POST = apiHandler(
  { auth: "public", body: registerSchema, rateLimit: [credentialsRateLimit("register")], successStatus: 201 },
  async ({ body, cradle, headers }) => {
    const user = await cradle.userService.register(body);
    headers.append("set-cookie", await issueSessionCookie(user.id));
    return { user };
  },
);
