import { describe, expect, it } from "vitest";

import * as db from "./index.ts";

describe("@plantai/db public API", () => {
  it("exposes the entities and ORM accessors", () => {
    expect(Object.keys(db).sort()).toEqual(["Garden", "User", "checkDbConnection", "closeOrm", "entities", "findForUpdate", "findOwned", "getOrm", "isUniqueViolation", "ownedBy"]);
  });
});
