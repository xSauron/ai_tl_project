import { describe, expect, it, vi } from "vitest";

import { Garden } from "./entities/index.ts";
import { findOwned, ownedBy, type OwnerFilter } from "./ownership.ts";

import type { EntityManager } from "@mikro-orm/postgresql";

const ID = "8f6c2c1e-4b8a-4f4e-9d61-2f0a3f1b7c55";
const OTHER_ID = "0b7a1f43-2d6e-4c1a-8f3b-6e9d5c4a2b10";
const OWNER_FILTER: OwnerFilter<Garden> = { name: "Mine" };

const fakeEm = (result: Garden | null) => {
  const findOne = vi.fn().mockResolvedValue(result);
  return { em: { findOne } as unknown as EntityManager, findOne };
};

describe("findOwned", () => {
  it("runs one query with the owner filter and the id in the same WHERE", async () => {
    const garden = new Garden();
    const { em, findOne } = fakeEm(garden);

    await expect(findOwned(em, Garden, ID, OWNER_FILTER)).resolves.toBe(garden);

    expect(findOne).toHaveBeenCalledTimes(1);
    expect(findOne).toHaveBeenCalledWith(Garden, { name: "Mine", id: ID });
  });

  it("returns null when no row matches id + filter (missing or foreign alike)", async () => {
    const { em, findOne } = fakeEm(null);

    await expect(findOwned(em, Garden, ID, OWNER_FILTER)).resolves.toBeNull();
    expect(findOne).toHaveBeenCalledTimes(1);
  });

  it("never lets the filter override the id", async () => {
    const { em, findOne } = fakeEm(null);
    const smuggled = { ...OWNER_FILTER, id: OTHER_ID } as OwnerFilter<Garden>;

    await findOwned(em, Garden, ID, smuggled);

    expect(findOne).toHaveBeenCalledWith(Garden, { name: "Mine", id: ID });
  });

  it("does not mutate the caller's filter", async () => {
    const { em } = fakeEm(null);
    const filter: OwnerFilter<Garden> = { name: "Mine" };

    await findOwned(em, Garden, ID, filter);

    expect(filter).toEqual({ name: "Mine" });
  });

  it.each([
    ["an empty filter", {}],
    ["an undefined condition", { name: undefined }],
  ])("fails closed on %s without querying", async (_case, filter) => {
    const { em, findOne } = fakeEm(new Garden());

    await expect(findOwned(em, Garden, ID, filter as OwnerFilter<Garden>)).rejects.toThrow(TypeError);
    expect(findOne).not.toHaveBeenCalled();
  });
});

describe("ownedBy", () => {
  it("scopes a garden to its owner", () => {
    expect(ownedBy.garden(ID)).toEqual({ owner: ID });
  });

  it("fails closed through findOwned when the user id is missing", async () => {
    const { em, findOne } = fakeEm(null);
    const missingUserId = undefined as unknown as string;

    await expect(findOwned(em, Garden, ID, ownedBy.garden(missingUserId))).rejects.toThrow(TypeError);
    expect(findOne).not.toHaveBeenCalled();
  });
});
