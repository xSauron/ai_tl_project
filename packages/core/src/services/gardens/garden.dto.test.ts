import type { Garden } from "@plantai/db";
import { describe, expect, it } from "vitest";

import { toGardenDto } from "./garden.dto.ts";

function garden(overrides: Partial<Garden> = {}): Garden {
  return {
    id: "6f1c2a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b",
    name: "Backyard",
    description: "Tomatoes",
    createdAt: new Date("2026-10-13T08:30:00.000Z"),
    updatedAt: new Date("2026-10-14T09:00:00.000Z"),
    ...overrides,
  } as Garden;
}

describe("toGardenDto", () => {
  it("maps the public fields with an ISO createdAt", () => {
    expect(toGardenDto(garden())).toStrictEqual({
      id: "6f1c2a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b",
      name: "Backyard",
      description: "Tomatoes",
      createdAt: "2026-10-13T08:30:00.000Z",
    });
  });

  it.each([null, undefined])("maps a %s description to null", (description) => {
    expect(toGardenDto(garden({ description } as Partial<Garden>)).description).toBeNull();
  });

  it("never copies extra entity keys", () => {
    const entity = Object.assign(garden(), { ownerId: "u1", passwordHash: "secret" });

    expect(Object.keys(toGardenDto(entity)).sort()).toEqual(["createdAt", "description", "id", "name"]);
  });

  it("returns a JSON-safe value", () => {
    const dto = toGardenDto(garden());

    expect(JSON.parse(JSON.stringify(dto))).toStrictEqual(dto);
  });
});
