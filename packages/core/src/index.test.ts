import { describe, expect, it } from "vitest";

import * as core from "./index.ts";

describe("@plantai/core public API", () => {
  it("exposes the entities, ORM accessors, container, request scope and services", () => {
    expect(Object.keys(core).sort()).toEqual([
      "Garden",
      "GardenService",
      "checkDbConnection",
      "closeOrm",
      "entities",
      "getContainer",
      "getOrm",
      "withScope",
    ]);
  });
});
