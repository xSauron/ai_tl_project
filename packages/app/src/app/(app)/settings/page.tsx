import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { withScope } from "@plantai/core";

import { ROUTES } from "@/lib/routes";
import { requireActor } from "@/server/session";

import { SettingsPanel } from "./settings-panel";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  // Database reads happen per request, never at build time.
  await connection();
  const actor = await requireActor();
  const user = await withScope(({ userService }) => userService.getById(actor.userId));
  // A valid token for a deleted account is no session at all.
  if (user === null) redirect(ROUTES.login);

  return <SettingsPanel email={user.email} />;
}
