"use server";

import { revalidatePath } from "next/cache";

import { withScope } from "@plantai/core";

export async function createGardenAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) {
    return;
  }

  await withScope(({ gardenService }) =>
    gardenService.create({ name, description: description || null }),
  );
  revalidatePath("/admin/gardens");
}
