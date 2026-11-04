import { Garden, type EntityManager, type OwnerFilter } from "@plantai/db";
import { describe, expect, it, vi } from "vitest";

import { ERROR_CODES, NotFoundError } from "../../http/errors.ts";
import { findOwnedOrFail } from "./owned.ts";

const MINE_ID = "8f6c2c1e-4b8a-4f4e-9d61-2f0a3f1b7c55";
const FOREIGN_ID = "0b7a1f43-2d6e-4c1a-8f3b-6e9d5c4a2b10";
const MISSING_ID = "5d2e8a90-7c1b-4e3f-a6d4-9b8c7f6e5a41";
// Garden has no owner column until Phase 5; `name` stands in for the owner condition.
const OWNER_FILTER: OwnerFilter<Garden> = { name: "Mine" };

const garden = (id: string, name: string) => Object.assign(new Garden(), { id, name });

/** In-memory `findOne` that matches every key of the WHERE, like the single SQL query would. */
const fakeEm = (rows: Garden[]) => {
  const findOne = vi.fn(async (_entity: unknown, where: Record<string, unknown>) =>
    rows.find((row) => Object.entries(where).every(([key, value]) => row[key as keyof Garden] === value)) ?? null,
  );
  return { em: { findOne } as unknown as EntityManager, findOne };
};

const ROWS = [garden(MINE_ID, "Mine"), garden(FOREIGN_ID, "Someone else's")];

const captureError = async (promise: Promise<unknown>): Promise<NotFoundError> => {
  const error = await promise.then(
    () => undefined,
    (thrown: unknown) => thrown,
  );
  expect(error).toBeInstanceOf(NotFoundError);
  return error as NotFoundError;
};

describe("findOwnedOrFail", () => {
  it("returns the owned row from a single query", async () => {
    const { em, findOne } = fakeEm(ROWS);

    await expect(findOwnedOrFail(em, Garden, MINE_ID, OWNER_FILTER)).resolves.toBe(ROWS[0]);
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(findOne).toHaveBeenCalledWith(Garden, { name: "Mine", id: MINE_ID });
  });

  it.each([
    ["missing", MISSING_ID],
    ["foreign", FOREIGN_ID],
  ])("throws NotFoundError (404, NOT_FOUND) for a %s row", async (_case, id) => {
    const { em } = fakeEm(ROWS);

    const error = await captureError(findOwnedOrFail(em, Garden, id, OWNER_FILTER));

    expect(error.status).toBe(404);
    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it("raises an identical error for missing and foreign rows (no existence leak)", async () => {
    const { em } = fakeEm(ROWS);

    const missing = await captureError(findOwnedOrFail(em, Garden, MISSING_ID, OWNER_FILTER));
    const foreign = await captureError(findOwnedOrFail(em, Garden, FOREIGN_ID, OWNER_FILTER));

    expect(foreign.toJSON()).toEqual(missing.toJSON());
    expect(foreign.status).toBe(missing.status);
  });

  it("uses a custom message for both cases", async () => {
    const { em } = fakeEm(ROWS);
    const message = "Garden not found.";

    const missing = await captureError(findOwnedOrFail(em, Garden, MISSING_ID, OWNER_FILTER, { message }));
    const foreign = await captureError(findOwnedOrFail(em, Garden, FOREIGN_ID, OWNER_FILTER, { message }));

    expect(missing.message).toBe(message);
    expect(foreign.toJSON()).toEqual(missing.toJSON());
  });
});
