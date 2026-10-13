import { describe, expect, inject, it } from "vitest";

describe("GET /api/health", () => {
  it("reports the database as reachable", async () => {
    const response = await fetch(new URL("/api/health", inject("baseUrl")));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", db: { ok: true } });
  });
});
