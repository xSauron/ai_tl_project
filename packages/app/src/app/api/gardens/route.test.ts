import { beforeEach, describe, expect, it, vi } from "vitest";

import { harness, jsonRequest } from "../../../../test/api-harness";

vi.mock("@plantai/core", async (importOriginal) =>
  (await import("../../../../test/api-harness")).coreWithFakeScope(importOriginal),
);

const collection = await import("./route");
const item = await import("./[id]/route");

const ACTOR = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };
const GARDEN_ID = "0b6e2f5e-3c1d-4a8b-9f7e-2d4c6b8a0e1f";
const GARDEN = { id: GARDEN_ID, name: "Back yard", description: null, createdAt: "2026-11-03T10:00:00.000Z" };
const gardenService = { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() };
const itemCtx = (id = GARDEN_ID) => ({ params: Promise.resolve({ id }) });
const request = (method: string, body?: unknown) => jsonRequest(`/api/gardens/${GARDEN_ID}`, body, method);

beforeEach(async () => {
  vi.stubEnv("LOG_LEVEL", "silent");
  for (const method of Object.values(gardenService)) method.mockReset();
  harness.actor = ACTOR;
  harness.cradle = { gardenService };
});

describe("/api/gardens", () => {
  it("GET lists the actor's gardens", async () => {
    gardenService.list.mockResolvedValue([GARDEN]);

    const response = await collection.GET(new Request("http://localhost/api/gardens"));

    await expect(response.json()).resolves.toEqual({ ok: true, data: [GARDEN] });
    expect(gardenService.list).toHaveBeenCalledWith(ACTOR, {});
  });

  it("POST creates from the parsed body only and answers 201", async () => {
    gardenService.create.mockResolvedValue(GARDEN);

    const response = await collection.POST(jsonRequest("/api/gardens", { name: " Back yard ", description: "" }));

    expect(response.status).toBe(201);
    expect(gardenService.create).toHaveBeenCalledWith(ACTOR, { name: "Back yard", description: null });
  });

  it("POST rejects an invalid or over-posted body with 422 field errors", async () => {
    const response = await collection.POST(jsonRequest("/api/gardens", { name: "", owner: "someone" }));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "VALIDATION_FAILED" } });
    expect(gardenService.create).not.toHaveBeenCalled();
  });

  it("POST passes the limit error through as 409", async () => {
    const { ConflictError } = await import("@plantai/core");
    gardenService.create.mockRejectedValue(new ConflictError({ code: "LIMIT_REACHED", message: "Too many." }));

    const response = await collection.POST(jsonRequest("/api/gardens", { name: "One more" }));

    expect(response.status).toBe(409);
  });

  it("POST without the CSRF header is 403, even signed in", async () => {
    const response = await collection.POST(new Request("http://localhost/api/gardens", { method: "POST", body: "{}" }));

    expect(response.status).toBe(403);
  });

  it("every verb is 401 without a session", async () => {
    harness.actor = null;

    const responses = await Promise.all([
      collection.GET(new Request("http://localhost/api/gardens")),
      collection.POST(jsonRequest("/api/gardens", { name: "A" })),
      item.GET(request("GET"), itemCtx()),
      item.PATCH(request("PATCH", { name: "B" }), itemCtx()),
      item.DELETE(request("DELETE"), itemCtx()),
    ]);

    expect(responses.map((response) => response.status)).toEqual([401, 401, 401, 401, 401]);
    expect(Object.values(gardenService).every((method) => method.mock.calls.length === 0)).toBe(true);
  });
});

describe("/api/gardens/[id]", () => {
  it("GET, PATCH and DELETE reach the service with the actor and id", async () => {
    gardenService.get.mockResolvedValue(GARDEN);
    gardenService.update.mockResolvedValue({ ...GARDEN, name: "Renamed" });
    gardenService.remove.mockResolvedValue(undefined);

    expect((await item.GET(request("GET"), itemCtx())).status).toBe(200);
    const patched = await item.PATCH(request("PATCH", { name: "Renamed" }), itemCtx());
    const deleted = await item.DELETE(request("DELETE"), itemCtx());

    expect(gardenService.get).toHaveBeenCalledWith(ACTOR, GARDEN_ID);
    expect(gardenService.update).toHaveBeenCalledWith(ACTOR, GARDEN_ID, { name: "Renamed" });
    await expect(patched.json()).resolves.toMatchObject({ data: { name: "Renamed" } });
    await expect(deleted.json()).resolves.toEqual({ ok: true, data: { id: GARDEN_ID } });
  });

  it("answers another user's garden with the same 404 as a missing one", async () => {
    const { NotFoundError } = await import("@plantai/core");
    gardenService.get.mockRejectedValue(new NotFoundError());

    const response = await item.GET(request("GET"), itemCtx());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "NOT_FOUND" } });
  });

  it("rejects a malformed id with 422 before the service", async () => {
    const response = await item.GET(request("GET"), itemCtx("not-a-uuid"));

    expect(response.status).toBe(422);
    expect(gardenService.get).not.toHaveBeenCalled();
  });
});
