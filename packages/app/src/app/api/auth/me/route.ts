import { apiHandler, UnauthorizedError } from "@plantai/core";

export const GET = apiHandler({ auth: "required" }, async ({ actor, cradle }) => {
  const user = await cradle.userService.getById(actor.userId);
  // A valid token for a deleted account is no session at all.
  if (user === null) throw new UnauthorizedError();
  return { user };
});
