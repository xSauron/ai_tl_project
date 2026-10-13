import { MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { entities, Garden } from "./index.ts";

// MikroORM 7 connects lazily, so discovery runs without a database.
let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({ clientUrl: "postgresql://unused@127.0.0.1:1/unused", entities });
});

afterAll(async () => {
  await orm.close();
});

describe("Garden entity", () => {
  it("is the only registered entity", () => {
    expect(entities).toEqual([Garden]);
  });

  it("maps to the gardens table with snake_case columns", () => {
    const meta = orm.getMetadata().get(Garden);

    expect(meta.tableName).toBe("gardens");
    expect(meta.primaryKeys).toEqual(["id"]);
    expect(meta.properties.name.length).toBe(120);
    expect(meta.properties.name.nullable).toBeFalsy();
    expect(meta.properties.description.nullable).toBe(true);
    expect(meta.properties.createdAt.fieldNames).toEqual(["created_at"]);
    expect(meta.properties.updatedAt.fieldNames).toEqual(["updated_at"]);
  });

  it("generates a UUID primary key and audit timestamps on create", () => {
    const { properties } = orm.getMetadata().get(Garden);
    const garden = new Garden();
    const em = orm.em.fork();

    const id = properties.id.onCreate?.(garden, em);
    const createdAt = properties.createdAt.onCreate?.(garden, em);
    const updatedAt = properties.updatedAt.onCreate?.(garden, em);

    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(createdAt).toBeInstanceOf(Date);
    expect(updatedAt).toBeInstanceOf(Date);
  });

  it("refreshes updatedAt on update", () => {
    const { properties } = orm.getMetadata().get(Garden);

    expect(properties.updatedAt.onUpdate?.(new Garden(), orm.em.fork())).toBeInstanceOf(Date);
  });
});
