import { describe, expect, it } from "vitest";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../limits.ts";
import { REQUIRED_MESSAGE } from "./credentials.schema.ts";
import { passwordChangeSchema } from "./password-change.schema.ts";

const NEW = "n".repeat(MIN_PASSWORD_LENGTH);
const issues = (input: unknown) =>
  passwordChangeSchema.safeParse(input).error?.issues.map((issue) => [issue.path.join("."), issue.message]);

describe("passwordChangeSchema", () => {
  it("keeps both passwords exactly as typed and accepts a short current one", () => {
    expect(passwordChangeSchema.parse({ currentPassword: " old ", newPassword: ` ${NEW} ` })).toEqual({
      currentPassword: " old ",
      newPassword: ` ${NEW} `,
    });
  });

  it.each([
    [{ currentPassword: "", newPassword: NEW }, [["currentPassword", REQUIRED_MESSAGE]]],
    [{ currentPassword: "old", newPassword: "short" }, [["newPassword", `Must be at least ${MIN_PASSWORD_LENGTH} characters`]]],
    [
      { currentPassword: "x".repeat(MAX_PASSWORD_LENGTH + 1), newPassword: "n".repeat(MAX_PASSWORD_LENGTH + 1) },
      [
        ["currentPassword", `Must be at most ${MAX_PASSWORD_LENGTH} characters`],
        ["newPassword", `Must be at most ${MAX_PASSWORD_LENGTH} characters`],
      ],
    ],
    [{}, [["currentPassword", REQUIRED_MESSAGE], ["newPassword", REQUIRED_MESSAGE]]],
    [{ currentPassword: "old", newPassword: NEW, userId: "x" }, [["", 'Unrecognized key: "userId"']]],
  ])("rejects %o", (input, expected) => {
    expect(issues(input)).toEqual(expected);
  });
});
