import type { Metadata } from "next";
import { connection } from "next/server";

import { withScope } from "@plantai/core";

import { requireActor } from "@/server/session";

import { GardensPanel } from "./gardens-panel";

export const metadata: Metadata = { title: "Gardens" };

export default async function GardensPage() {
  // Database reads happen per request, never at build time.
  await connection();
  const actor = await requireActor();
  const gardens = await withScope(({ gardenService }) => gardenService.list(actor));

  return <GardensPanel gardens={gardens} />;
}
