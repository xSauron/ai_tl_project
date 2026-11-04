import type { User } from "@plantai/db";
import { describe, expect, it } from "vitest";

import { toUserDto } from "./user.dto.ts";

function user(emailVerifiedAt: Date | null): User {
  return { id: "u1", email: "ala@example.com", passwordHash: "$2b$12$secret", emailVerifiedAt } as unknown as User;
}

describe("toUserDto", () => {
  it("exposes id, e-mail and confirmation state, never the password hash", () => {
    const dto = toUserDto(user(null));

    expect(dto).toStrictEqual({ id: "u1", email: "ala@example.com", isEmailVerified: false });
    expect(JSON.stringify(dto)).not.toContain("secret");
  });

  it("marks a confirmed address", () => {
    expect(toUserDto(user(new Date("2026-11-03T10:00:00Z"))).isEmailVerified).toBe(true);
  });
});
