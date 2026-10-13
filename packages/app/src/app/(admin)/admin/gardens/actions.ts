"use server";

import { revalidatePath } from "next/cache";

import { withRequestScope } from "@/server/request-scope";

export async function createGardenAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) {
    return;
  }

  await withRequestScope(({ gardenService }) =>
    gardenService.create({ name, description: description || null }),
  );
  revalidatePath("/admin/gardens");
}
