import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, withRequestScope, create } = vi.hoisted(() => {
  const create = vi.fn();
  return {
    create,
    revalidatePath: vi.fn(),
    withRequestScope: vi.fn((fn: (cradle: unknown) => unknown) => fn({ gardenService: { create } })),
  };
});

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/request-scope", () => ({ withRequestScope }));

const { createGardenAction } = await import("./actions");

function form(fields: { name?: string; description?: string }) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createGardenAction", () => {
  it("creates a trimmed garden and revalidates the list", async () => {
    await createGardenAction(form({ name: "  Backyard ", description: " Tomatoes " }));

    expect(create).toHaveBeenCalledWith({ name: "Backyard", description: "Tomatoes" });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/gardens");
  });

  it("stores an empty or missing description as null", async () => {
    await createGardenAction(form({ name: "Herbs", description: "   " }));
    await createGardenAction(form({ name: "Beds" }));

    expect(create).toHaveBeenNthCalledWith(1, { name: "Herbs", description: null });
    expect(create).toHaveBeenNthCalledWith(2, { name: "Beds", description: null });
  });

  it.each([{}, { name: "   " }])("ignores submissions without a name (%j)", async (fields) => {
    await createGardenAction(form(fields));

    expect(withRequestScope).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
