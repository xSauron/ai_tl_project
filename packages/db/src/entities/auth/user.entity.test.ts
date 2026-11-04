import { MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { entities, Garden, User } from "../index.ts";

// MikroORM 7 connects lazily, so discovery runs without a database.
let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({ clientUrl: "postgresql://unused@127.0.0.1:1/unused", entities });
});

afterAll(async () => {
  await orm.close();
});

describe("User entity", () => {
  it("is registered next to Garden", () => {
    expect(entities).toEqual([Garden, User]);
  });

  it("maps to the users table with a unique e-mail and a nullable confirmation time", () => {
    const meta = orm.getMetadata().get(User);

    expect(meta.tableName).toBe("users");
    expect(meta.primaryKeys).toEqual(["id"]);
    expect(meta.properties.email.length).toBe(254);
    expect(meta.properties.email.unique).toBe(true);
    expect(meta.properties.email.nullable).toBeFalsy();
    expect(meta.properties.passwordHash.length).toBe(100);
    expect(meta.properties.passwordHash.fieldNames).toEqual(["password_hash"]);
    expect(meta.properties.emailVerifiedAt.nullable).toBe(true);
    expect(meta.properties.emailVerifiedAt.fieldNames).toEqual(["email_verified_at"]);
    expect(meta.properties.createdAt.fieldNames).toEqual(["created_at"]);
  });
});
