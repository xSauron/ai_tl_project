import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { SESSION_COOKIE, verifySessionToken, type Actor } from "@plantai/core";

import { ROUTES } from "@/lib/routes";

/**
 * Session DAL (Next 16 auth guide): the signed-in actor or `null`, memoized
 * per render pass. Call it next to the data in every page, not only in a
 * layout, because layouts don't re-run on client navigation.
 */
export const getActor = cache(async (): Promise<Actor | null> => {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
});

/** The actor, or a redirect to the login page. */
export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (actor === null) redirect(ROUTES.login);
  return actor;
}

/** For login/register: a signed-in visitor goes straight to the app. */
export async function redirectIfSignedIn(): Promise<void> {
  if ((await getActor()) !== null) redirect(ROUTES.afterSignIn);
}
