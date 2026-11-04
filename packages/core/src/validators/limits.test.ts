import { describe, expect, it } from "vitest";

import * as limits from "./limits.ts";

describe("validators/limits", () => {
  it.each([
    ["MAX_EMAIL_LENGTH", 254],
    ["MIN_PASSWORD_LENGTH", 10],
    ["MAX_PASSWORD_LENGTH", 128],
    ["MAX_GARDEN_NAME_LENGTH", 120],
    ["MAX_DESCRIPTION_LENGTH", 2000],
    ["MAX_GARDENS_PER_USER", 20],
    ["MAX_JSON_BODY_BYTES", 65_536],
  ] as const)("%s is %i", (name, value) => {
    expect(limits[name]).toBe(value);
  });

  it("exports only the named limits", () => {
    expect(Object.keys(limits).sort()).toEqual([
      "MAX_DESCRIPTION_LENGTH",
      "MAX_EMAIL_LENGTH",
      "MAX_GARDENS_PER_USER",
      "MAX_GARDEN_NAME_LENGTH",
      "MAX_JSON_BODY_BYTES",
      "MAX_PASSWORD_LENGTH",
      "MIN_PASSWORD_LENGTH",
    ]);
  });

  it("keeps the password minimum below the maximum", () => {
    expect(limits.MIN_PASSWORD_LENGTH).toBeLessThan(limits.MAX_PASSWORD_LENGTH);
  });
});
