import { ERROR_CODES, ROOT_FIELD_ERROR_KEY as SERVER_ROOT_KEY } from "@plantai/core";
import { CLIENT_VALIDATION_CODE, ROOT_FIELD_ERROR_KEY as CLIENT_ROOT_KEY } from "@plantai/ui/backend/forms/CrudForm";
import { describe, expect, it } from "vitest";

// `ui` can't import `core`, so `CrudForm` keeps its own copy of the field-error conventions.
describe("Field-error contract (core apiHandler ↔ ui CrudForm)", () => {
  it("keys root issues and names validation failures the same way on both sides", () => {
    expect(CLIENT_ROOT_KEY).toBe(SERVER_ROOT_KEY);
    expect(CLIENT_VALIDATION_CODE).toBe(ERROR_CODES.VALIDATION_FAILED);
  });
});
