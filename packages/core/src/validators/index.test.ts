import { describe, expect, it } from "vitest";

import * as validators from "./index.ts";

describe("@plantai/core/validators barrel", () => {
  it("re-exports the common schemas and the limits", () => {
    expect(Object.keys(validators)).toEqual(
      expect.arrayContaining([
        "uuidSchema",
        "registerSchema",
        "loginSchema",
        "passwordChangeSchema",
        "gardenCreateSchema",
        "gardenUpdateSchema",
        "idParamsSchema",
        "boundedText",
        "MAX_EMAIL_LENGTH",
        "MAX_GARDEN_NAME_LENGTH",
        "MAX_JSON_BODY_BYTES",
      ]),
    );
  });

  it("resolves through the package exports subpath", async () => {
    const viaPackage = await import("@plantai/core/validators");
    expect(viaPackage.uuidSchema).toBe(validators.uuidSchema);
  });
});
