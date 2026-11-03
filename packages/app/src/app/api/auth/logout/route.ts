import { apiHandler, clearSessionCookie } from "@plantai/core";

/** Clears the cookie. A copied token stays valid until it expires (stateless JWT, spec A Risks). */
export const POST = apiHandler({ auth: "required" }, async ({ headers }) => {
  headers.append("set-cookie", clearSessionCookie());
  return null;
});
