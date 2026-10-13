import type { EntityManager } from "@mikro-orm/postgresql";
import { describe, expect, it, vi } from "vitest";

import { Garden } from "../../entities/index.ts";
import { GardenService } from "./garden.service.ts";

function createEm() {
  const em = {
    findAll: vi.fn(),
    create: vi.fn((_entity: unknown, data: object) => ({ ...data })),
    flush: vi.fn(),
  };
  return { em, service: new GardenService({ em: em as unknown as EntityManager }) };
}

describe("GardenService", () => {
  it("lists gardens newest first", async () => {
    const { em, service } = createEm();
    const gardens = [{ name: "Backyard" }];
    em.findAll.mockResolvedValue(gardens);

    await expect(service.list()).resolves.toBe(gardens);
    expect(em.findAll).toHaveBeenCalledWith(Garden, { orderBy: { createdAt: "desc" } });
  });

  it("creates and flushes a garden with a description", async () => {
    const { em, service } = createEm();

    const garden = await service.create({ name: "Herb spiral", description: "Thyme" });

    expect(em.create).toHaveBeenCalledWith(Garden, { name: "Herb spiral", description: "Thyme" });
    expect(em.flush).toHaveBeenCalledOnce();
    expect(garden).toEqual({ name: "Herb spiral", description: "Thyme" });
  });

  it("stores a missing description as null", async () => {
    const { em, service } = createEm();

    await service.create({ name: "Raised bed" });

    expect(em.create).toHaveBeenCalledWith(Garden, { name: "Raised bed", description: null });
  });
});
