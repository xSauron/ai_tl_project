import { describe, expect, it } from "vitest";

import * as core from "./index.ts";

describe("@plant-ai/core public API", () => {
  it("exposes the entities, ORM accessors, container and services", () => {
    expect(Object.keys(core).sort()).toEqual([
      "Garden",
      "GardenService",
      "checkDbConnection",
      "closeOrm",
      "createRequestScope",
      "entities",
      "getContainer",
      "getOrm",
    ]);
  });
});
