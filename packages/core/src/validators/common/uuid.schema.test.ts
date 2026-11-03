import { describe, expect, it } from "vitest";

import { INVALID_UUID_MESSAGE, uuidSchema } from "./uuid.schema.ts";

describe("uuidSchema", () => {
  it.each([
    ["v4", "3f2b8c1e-9d4a-4b7e-8a1f-2c3d4e5f6a7b"],
    ["v7", "01890a5d-ac96-774b-bcce-b302099a8057"],
    ["uppercase", "3F2B8C1E-9D4A-4B7E-8A1F-2C3D4E5F6A7B"],
    ["randomUUID()", crypto.randomUUID()],
  ])("accepts a %s UUID", (_label, value) => {
    expect(uuidSchema.parse(value)).toBe(value);
  });

  it.each([
    ["empty string", ""],
    ["not a uuid", "garden-1"],
    ["missing a group", "3f2b8c1e-9d4a-4b7e-8a1f"],
    ["one char too long", "3f2b8c1e-9d4a-4b7e-8a1f-2c3d4e5f6a7b0"],
    ["non-hex char", "3f2b8c1e-9d4a-4b7e-8a1f-2c3d4e5f6a7g"],
    ["no dashes", "3f2b8c1e9d4a4b7e8a1f2c3d4e5f6a7b"],
    ["braces", "{3f2b8c1e-9d4a-4b7e-8a1f-2c3d4e5f6a7b}"],
    ["surrounding whitespace", " 3f2b8c1e-9d4a-4b7e-8a1f-2c3d4e5f6a7b "],
    ["invalid variant", "3f2b8c1e-9d4a-4b7e-0a1f-2c3d4e5f6a7b"],
    ["SQL fragment", "' OR 1=1 --"],
  ])("rejects %s", (_label, value) => {
    const result = uuidSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(INVALID_UUID_MESSAGE);
  });

  it.each([
    ["number", 42],
    ["null", null],
    ["undefined", undefined],
    ["object", { id: "3f2b8c1e-9d4a-4b7e-8a1f-2c3d4e5f6a7b" }],
  ])("rejects a %s", (_label, value) => {
    expect(uuidSchema.safeParse(value).success).toBe(false);
  });
});
