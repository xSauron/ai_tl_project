import { Garden, type EntityManager } from "@plantai/db";
import { describe, expect, it, vi } from "vitest";

import { GardenService } from "./garden.service.ts";

const CREATED_AT = new Date("2026-10-13T08:30:00.000Z");

function entity(data: object) {
  return { id: "g-new", createdAt: CREATED_AT, updatedAt: CREATED_AT, ...data };
}

function createEm() {
  const em = {
    findAll: vi.fn(),
    // Mirrors the `onCreate` hooks of `baseProperties` (id + timestamps).
    create: vi.fn((_entity: unknown, data: object) => entity(data)),
    flush: vi.fn(),
  };
  return { em, service: new GardenService({ em: em as unknown as EntityManager }) };
}

describe("GardenService", () => {
  it("lists gardens newest first as DTOs", async () => {
    const { em, service } = createEm();
    em.findAll.mockResolvedValue([
      entity({ id: "g2", name: "Backyard", description: "Tomatoes", createdAt: new Date("2026-10-14T00:00:00Z") }),
      entity({ id: "g1", name: "Herbs", description: null }),
    ]);

    await expect(service.list()).resolves.toStrictEqual([
      { id: "g2", name: "Backyard", description: "Tomatoes", createdAt: "2026-10-14T00:00:00.000Z" },
      { id: "g1", name: "Herbs", description: null, createdAt: "2026-10-13T08:30:00.000Z" },
    ]);
    expect(em.findAll).toHaveBeenCalledWith(Garden, { orderBy: { createdAt: "desc" } });
  });

  it("returns an empty list when there are no gardens", async () => {
    const { em, service } = createEm();
    em.findAll.mockResolvedValue([]);

    await expect(service.list()).resolves.toStrictEqual([]);
  });

  it("creates and flushes a garden with a description, returning its DTO", async () => {
    const { em, service } = createEm();

    const garden = await service.create({ name: "Herb spiral", description: "Thyme" });

    expect(em.create).toHaveBeenCalledWith(Garden, { name: "Herb spiral", description: "Thyme" });
    expect(em.flush).toHaveBeenCalledOnce();
    expect(garden).toStrictEqual({
      id: "g-new",
      name: "Herb spiral",
      description: "Thyme",
      createdAt: "2026-10-13T08:30:00.000Z",
    });
  });

  it("stores a missing description as null", async () => {
    const { em, service } = createEm();

    const garden = await service.create({ name: "Raised bed" });

    expect(em.create).toHaveBeenCalledWith(Garden, { name: "Raised bed", description: null });
    expect(garden.description).toBeNull();
  });
});
