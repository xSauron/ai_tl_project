import { findForUpdate, Garden, User, type EntityManager } from "@plantai/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ERROR_CODES } from "../../http/errors.ts";
import { MAX_GARDENS_PER_USER } from "../../validators/limits.ts";
import { GARDEN_LIMIT_MESSAGE, GardenService } from "./garden.service.ts";

vi.mock("@plantai/db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@plantai/db")>()),
  findForUpdate: vi.fn(),
}));

const ACTOR = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };
const GARDEN_ID = "0b6e2f5e-3c1d-4a8b-9f7e-2d4c6b8a0e1f";
const CREATED_AT = new Date("2026-10-13T08:30:00.000Z");
const OWNER_FILTER = { owner: ACTOR.userId };

function entity(data: object) {
  return { id: "g-new", createdAt: CREATED_AT, updatedAt: CREATED_AT, description: null, ...data };
}

function createEm() {
  const em = {
    find: vi.fn(),
    findOne: vi.fn(),
    count: vi.fn(),
    // Mirrors the `onCreate` hooks of `baseProperties` (id + timestamps).
    create: vi.fn((_entity: unknown, data: object) => entity(data)),
    assign: vi.fn((target: object, data: object) => Object.assign(target, data)),
    flush: vi.fn(),
    remove: vi.fn(),
    // The transaction runs on the same fake: `tx` is the em itself.
    transactional: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(em)),
  };
  em.remove.mockReturnValue(em);
  return { em, service: new GardenService({ em: em as unknown as EntityManager }) };
}

beforeEach(() => {
  vi.mocked(findForUpdate).mockReset().mockResolvedValue({ id: ACTOR.userId } as User);
});

describe("GardenService.list", () => {
  it("lists only the actor's gardens, newest first, as DTOs", async () => {
    const { em, service } = createEm();
    em.find.mockResolvedValue([
      entity({ id: "g2", name: "Backyard", description: "Tomatoes", createdAt: new Date("2026-10-14T00:00:00Z") }),
      entity({ id: "g1", name: "Herbs" }),
    ]);

    await expect(service.list(ACTOR)).resolves.toStrictEqual([
      { id: "g2", name: "Backyard", description: "Tomatoes", createdAt: "2026-10-14T00:00:00.000Z" },
      { id: "g1", name: "Herbs", description: null, createdAt: "2026-10-13T08:30:00.000Z" },
    ]);
    expect(em.find).toHaveBeenCalledWith(Garden, OWNER_FILTER, { orderBy: { createdAt: "desc" } });
  });
});

describe("GardenService.get", () => {
  it("loads by id and owner in one query", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(entity({ id: GARDEN_ID, name: "Herbs" }));

    await expect(service.get(ACTOR, GARDEN_ID)).resolves.toMatchObject({ id: GARDEN_ID, name: "Herbs" });
    expect(em.findOne).toHaveBeenCalledWith(Garden, { ...OWNER_FILTER, id: GARDEN_ID });
  });

  it("is a 404 for a missing or foreign garden alike", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(null);

    await expect(service.get(ACTOR, GARDEN_ID)).rejects.toMatchObject({ status: 404, code: ERROR_CODES.NOT_FOUND });
  });
});

describe("GardenService.create", () => {
  it("locks the user row, checks the limit and creates an owned garden", async () => {
    const { em, service } = createEm();
    em.count.mockResolvedValue(MAX_GARDENS_PER_USER - 1);

    const garden = await service.create(ACTOR, { name: "Herb spiral", description: "Thyme" });

    expect(findForUpdate).toHaveBeenCalledWith(em, User, ACTOR.userId);
    expect(em.count).toHaveBeenCalledWith(Garden, OWNER_FILTER);
    expect(vi.mocked(findForUpdate).mock.invocationCallOrder[0]).toBeLessThan(em.count.mock.invocationCallOrder[0] ?? 0);
    expect(em.create).toHaveBeenCalledWith(Garden, { owner: ACTOR.userId, name: "Herb spiral", description: "Thyme" });
    expect(garden).toStrictEqual({ id: "g-new", name: "Herb spiral", description: "Thyme", createdAt: "2026-10-13T08:30:00.000Z" });
  });

  it("stores a missing description as null", async () => {
    const { em, service } = createEm();
    em.count.mockResolvedValue(0);

    await service.create(ACTOR, { name: "Herbs" });

    expect(em.create).toHaveBeenCalledWith(Garden, { owner: ACTOR.userId, name: "Herbs", description: null });
  });

  it(`refuses the ${MAX_GARDENS_PER_USER + 1}th garden with 409 LIMIT_REACHED`, async () => {
    const { em, service } = createEm();
    em.count.mockResolvedValue(MAX_GARDENS_PER_USER);

    await expect(service.create(ACTOR, { name: "One too many" })).rejects.toMatchObject({
      status: 409,
      code: ERROR_CODES.LIMIT_REACHED,
      message: GARDEN_LIMIT_MESSAGE,
    });
    expect(em.create).not.toHaveBeenCalled();
  });

  it("fails closed with 401 when the session's user no longer exists", async () => {
    const { em, service } = createEm();
    vi.mocked(findForUpdate).mockResolvedValue(null);

    await expect(service.create(ACTOR, { name: "Herbs" })).rejects.toMatchObject({ status: 401 });
    expect(em.count).not.toHaveBeenCalled();
  });
});

describe("GardenService.update", () => {
  it("assigns only the given fields to the owned garden and flushes", async () => {
    const { em, service } = createEm();
    const stored = entity({ id: GARDEN_ID, name: "Old", description: "Keep" });
    em.findOne.mockResolvedValue(stored);

    await expect(service.update(ACTOR, GARDEN_ID, { name: "New" })).resolves.toMatchObject({ name: "New", description: "Keep" });
    expect(em.findOne).toHaveBeenCalledWith(Garden, { ...OWNER_FILTER, id: GARDEN_ID });
    expect(em.assign).toHaveBeenCalledWith(stored, { name: "New" });
    expect(em.flush).toHaveBeenCalledOnce();
  });

  it("is a 404 for a foreign garden and changes nothing", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(null);

    await expect(service.update(ACTOR, GARDEN_ID, { name: "Mine now" })).rejects.toMatchObject({ status: 404 });
    expect(em.assign).not.toHaveBeenCalled();
  });
});

describe("GardenService.remove", () => {
  it("removes the owned garden", async () => {
    const { em, service } = createEm();
    const stored = entity({ id: GARDEN_ID, name: "Herbs" });
    em.findOne.mockResolvedValue(stored);

    await expect(service.remove(ACTOR, GARDEN_ID)).resolves.toBeUndefined();
    expect(em.remove).toHaveBeenCalledWith(stored);
    expect(em.flush).toHaveBeenCalledOnce();
  });

  it("is a 404 for a foreign garden", async () => {
    const { em, service } = createEm();
    em.findOne.mockResolvedValue(null);

    await expect(service.remove(ACTOR, GARDEN_ID)).rejects.toMatchObject({ status: 404 });
    expect(em.remove).not.toHaveBeenCalled();
  });
});
