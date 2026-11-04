import { describe, expect, it } from "vitest";

import { MAX_DESCRIPTION_LENGTH, MAX_GARDEN_NAME_LENGTH } from "../limits.ts";
import { gardenCreateSchema } from "./garden-create.schema.ts";
import { gardenUpdateSchema } from "./garden-update.schema.ts";

const messages = (result: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  result.error?.issues.map((issue) => [issue.path.join("."), issue.message]);

describe("gardenCreateSchema", () => {
  it.each([
    [{ name: "  Back yard " }, { name: "Back yard" }],
    [{ name: "Back yard", description: " Tomatoes " }, { name: "Back yard", description: "Tomatoes" }],
    [{ name: "Back yard", description: "   " }, { name: "Back yard", description: null }],
    [{ name: "Back yard", description: null }, { name: "Back yard", description: null }],
    [{ name: "n".repeat(MAX_GARDEN_NAME_LENGTH), description: "d".repeat(MAX_DESCRIPTION_LENGTH) }, { name: "n".repeat(MAX_GARDEN_NAME_LENGTH), description: "d".repeat(MAX_DESCRIPTION_LENGTH) }],
  ])("parses %o", (input, expected) => {
    expect(gardenCreateSchema.parse(input)).toEqual(expected);
  });

  it.each([
    [{}, [["name", "Must be text"]]],
    [{ name: "   " }, [["name", "Must not be empty"]]],
    [{ name: "n".repeat(MAX_GARDEN_NAME_LENGTH + 1) }, [["name", `Must be at most ${MAX_GARDEN_NAME_LENGTH} characters`]]],
    [{ name: "A", description: "d".repeat(MAX_DESCRIPTION_LENGTH + 1) }, [["description", `Must be at most ${MAX_DESCRIPTION_LENGTH} characters`]]],
    [{ name: "A", owner: "someone-else" }, [["", 'Unrecognized key: "owner"']]],
  ])("rejects %o", (input, expected) => {
    expect(messages(gardenCreateSchema.safeParse(input))).toEqual(expected);
  });
});

describe("gardenUpdateSchema", () => {
  it("accepts any subset and leaves omitted keys out", () => {
    expect(gardenUpdateSchema.parse({ name: "Renamed" })).toEqual({ name: "Renamed" });
    expect(gardenUpdateSchema.parse({ description: "" })).toEqual({ description: null });
    expect(gardenUpdateSchema.parse({})).toEqual({});
  });

  it("keeps the create bounds and rejects unknown keys", () => {
    expect(gardenUpdateSchema.safeParse({ name: "" }).success).toBe(false);
    expect(gardenUpdateSchema.safeParse({ id: "x" }).success).toBe(false);
  });
});
