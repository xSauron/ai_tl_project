import { describe, expect, it } from "vitest";

import { idParamsSchema } from "./id-params.schema.ts";
import { INVALID_UUID_MESSAGE } from "./uuid.schema.ts";

const ID = "3f2b8c1e-9d4a-4b7e-8a1f-2c3d4e5f6a7b";

describe("idParamsSchema", () => {
  it("accepts { id } with a UUID", () => {
    expect(idParamsSchema.parse({ id: ID })).toEqual({ id: ID });
  });

  it.each([
    ["missing id", {}, ["id"]],
    ["non-uuid id", { id: "123" }, ["id"]],
    ["numeric id", { id: 123 }, ["id"]],
    ["extra key", { id: ID, gardenId: ID }, []],
  ])("rejects %s", (_label, value, path) => {
    const result = idParamsSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(path);
  });

  it("reports the extra key as unrecognized", () => {
    const result = idParamsSchema.safeParse({ id: ID, extra: "x" });
    expect(result.error?.issues[0]).toMatchObject({ code: "unrecognized_keys", keys: ["extra"] });
  });

  it("uses the UUID message for a bad id", () => {
    expect(idParamsSchema.safeParse({ id: "nope" }).error?.issues[0]?.message).toBe(INVALID_UUID_MESSAGE);
  });

  it.each([
    ["null", null],
    ["string", ID],
    ["array", [ID]],
  ])("rejects a %s instead of an object", (_label, value) => {
    expect(idParamsSchema.safeParse(value).success).toBe(false);
  });
});
