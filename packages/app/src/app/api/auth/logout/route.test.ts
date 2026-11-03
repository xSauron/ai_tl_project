import { beforeEach, describe, expect, it, vi } from "vitest";

import { harness, jsonRequest } from "../../../../../test/api-harness";

vi.mock("@plantai/core", async (importOriginal) =>
  (await import("../../../../../test/api-harness")).coreWithFakeScope(importOriginal),
);

const { POST } = await import("./route");

beforeEach(() => {
  vi.stubEnv("LOG_LEVEL", "silent");
  harness.cradle = {};
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    harness.actor = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };

    const response = await POST(jsonRequest("/api/auth/logout"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, data: null });
    expect(response.headers.getSetCookie()).toEqual(["plantai_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"]);
  });

  it("is 401 without a session", async () => {
    harness.actor = null;

    expect((await POST(jsonRequest("/api/auth/logout"))).status).toBe(401);
  });
});
