import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOrm, execute } = vi.hoisted(() => ({ getOrm: vi.fn(), execute: vi.fn() }));

vi.mock("@plant-ai/core", () => ({ getOrm }));

const { GET } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
  getOrm.mockResolvedValue({ em: { fork: () => ({ getConnection: () => ({ execute }) }) } });
});

describe("GET /api/health", () => {
  it("reports ok after a real round-trip query", async () => {
    execute.mockResolvedValue([{ "?column?": 1 }]);

    const response = await GET();

    expect(execute).toHaveBeenCalledWith("select 1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok", db: { ok: true } });
  });

  it("returns 503 with the reason when the query fails", async () => {
    execute.mockRejectedValue(new Error("connection refused"));

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: "error",
      db: { ok: false, reason: "connection refused" },
    });
  });

  it("stringifies non-Error failures", async () => {
    getOrm.mockRejectedValue("DATABASE_URL missing");

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ db: { reason: "DATABASE_URL missing" } });
  });
});
