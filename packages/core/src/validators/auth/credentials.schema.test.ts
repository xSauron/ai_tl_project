import { describe, expect, it } from "vitest";

import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../limits.ts";
import { INVALID_EMAIL_MESSAGE, loginSchema, registerSchema, REQUIRED_MESSAGE } from "./credentials.schema.ts";

const PASSWORD = "p".repeat(MIN_PASSWORD_LENGTH);
const longEmail = (length: number) => `${"a".repeat(length - "@example.com".length)}@example.com`;

function issues(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return result.error?.issues.map((issue) => [issue.path.join("."), issue.message]);
}

describe("registerSchema", () => {
  it("trims the e-mail and keeps the password as typed", () => {
    expect(registerSchema.parse({ email: "  ala@example.com ", password: ` ${PASSWORD} ` })).toEqual({
      email: "ala@example.com",
      password: ` ${PASSWORD} `,
    });
  });

  it.each([
    [{ email: "not-an-email", password: PASSWORD }, [["email", INVALID_EMAIL_MESSAGE]]],
    [{ email: 42, password: PASSWORD }, [["email", INVALID_EMAIL_MESSAGE]]],
    [{ email: longEmail(MAX_EMAIL_LENGTH + 1), password: PASSWORD }, [["email", `Must be at most ${MAX_EMAIL_LENGTH} characters`]]],
    [{ email: "ala@example.com", password: "p".repeat(MIN_PASSWORD_LENGTH - 1) }, [["password", `Must be at least ${MIN_PASSWORD_LENGTH} characters`]]],
    [{ email: "ala@example.com", password: "p".repeat(MAX_PASSWORD_LENGTH + 1) }, [["password", `Must be at most ${MAX_PASSWORD_LENGTH} characters`]]],
    [{ email: "ala@example.com" }, [["password", REQUIRED_MESSAGE]]],
  ])("rejects %o", (input, expected) => {
    expect(issues(registerSchema.safeParse(input))).toEqual(expected);
  });

  it("accepts the bounds", () => {
    expect(registerSchema.safeParse({ email: longEmail(MAX_EMAIL_LENGTH), password: "p".repeat(MAX_PASSWORD_LENGTH) }).success).toBe(true);
  });

  it("rejects unknown keys (no mass assignment)", () => {
    expect(registerSchema.safeParse({ email: "ala@example.com", password: PASSWORD, emailVerifiedAt: "now" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a short password, so policy changes never lock anyone out", () => {
    expect(loginSchema.parse({ email: " ala@example.com", password: "short" })).toEqual({ email: "ala@example.com", password: "short" });
  });

  it.each([
    [{ email: "", password: "x" }, [["email", REQUIRED_MESSAGE]]],
    [{ email: "ala@example.com", password: "" }, [["password", REQUIRED_MESSAGE]]],
    [{ email: "a".repeat(MAX_EMAIL_LENGTH + 1), password: "x" }, [["email", `Must be at most ${MAX_EMAIL_LENGTH} characters`]]],
    [{ email: "ala@example.com", password: "p".repeat(MAX_PASSWORD_LENGTH + 1) }, [["password", `Must be at most ${MAX_PASSWORD_LENGTH} characters`]]],
    [{}, [["email", REQUIRED_MESSAGE], ["password", REQUIRED_MESSAGE]]],
  ])("rejects %o", (input, expected) => {
    expect(issues(loginSchema.safeParse(input))).toEqual(expected);
  });
});
