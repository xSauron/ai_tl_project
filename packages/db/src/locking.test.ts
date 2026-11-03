import { LockMode } from "@mikro-orm/postgresql";
import { describe, expect, it, vi } from "vitest";

import type { EntityManager } from "./index.ts";
import { User } from "./index.ts";
import { findForUpdate } from "./locking.ts";

describe("findForUpdate", () => {
  it("loads the row by id with a pessimistic write lock", async () => {
    const row = { id: "u1" };
    const findOne = vi.fn(async () => row);

    await expect(findForUpdate({ findOne } as unknown as EntityManager, User, "u1")).resolves.toBe(row);
    expect(findOne).toHaveBeenCalledWith(User, { id: "u1" }, { lockMode: LockMode.PESSIMISTIC_WRITE });
  });
});
