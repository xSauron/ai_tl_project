import { UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { isUniqueViolation } from "./errors.ts";

describe("isUniqueViolation", () => {
  it("recognises MikroORM's unique-constraint exception", () => {
    expect(isUniqueViolation(new UniqueConstraintViolationException(new Error("duplicate key")))).toBe(true);
  });

  it.each([new Error("other"), "duplicate", null])("rejects %o", (error) => {
    expect(isUniqueViolation(error)).toBe(false);
  });
});
