import { CSRF_HEADER as SERVER_HEADER, CSRF_HEADER_VALUE as SERVER_VALUE } from "@plantai/core";
import { CSRF_HEADER as CLIENT_HEADER, CSRF_HEADER_VALUE as CLIENT_VALUE } from "@plantai/ui/backend/api/apiCall";
import { describe, expect, it } from "vitest";

// `ui` can't import `core`, so `apiCall` keeps its own copy of the CSRF header.
describe("CSRF header contract (core apiHandler ↔ ui apiCall)", () => {
  it("uses the same header name and value on both sides", () => {
    expect(CLIENT_HEADER).toBe(SERVER_HEADER);
    expect(CLIENT_VALUE).toBe(SERVER_VALUE);
  });
});
