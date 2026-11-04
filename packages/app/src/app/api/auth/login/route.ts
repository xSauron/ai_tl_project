import { apiHandler, credentialsRateLimit, issueSessionCookie } from "@plantai/core";
import { loginSchema } from "@plantai/core/validators";

export const POST = apiHandler(
  { auth: "public", body: loginSchema, rateLimit: [credentialsRateLimit("login")] },
  async ({ body, cradle, headers }) => {
    const user = await cradle.userService.authenticate(body);
    headers.append("set-cookie", await issueSessionCookie(user.id));
    return { user };
  },
);
