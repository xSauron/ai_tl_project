import { beforeEach, describe, expect, it, vi } from "vitest";

const { checkDbConnection } = vi.hoisted(() => ({ checkDbConnection: vi.fn() }));

vi.mock("@plant-ai/core", () => ({ checkDbConnection }));

const { GET } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/health", () => {
  it("reports ok after a real round-trip query", async () => {
    checkDbConnection.mockResolvedValue({ ok: true });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok", db: { ok: true } });
  });

  it("returns 503 with the reason when the query fails", async () => {
    checkDbConnection.mockResolvedValue({ ok: false, reason: "connection refused" });

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: "error",
      db: { ok: false, reason: "connection refused" },
    });
  });
});
