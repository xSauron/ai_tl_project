import { beforeEach, describe, expect, it, vi } from "vitest";

import { harness } from "../../../../../test/api-harness";

vi.mock("@plantai/core", async (importOriginal) =>
  (await import("../../../../../test/api-harness")).coreWithFakeScope(importOriginal),
);

const { GET } = await import("./route");

const USER_ID = "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50";
const getById = vi.fn();
const request = () => new Request("http://localhost/api/auth/me");

beforeEach(() => {
  vi.stubEnv("LOG_LEVEL", "silent");
  getById.mockReset();
  harness.actor = { userId: USER_ID };
  harness.cradle = { userService: { getById } };
});

describe("GET /api/auth/me", () => {
  it("returns the signed-in user", async () => {
    const user = { id: USER_ID, email: "ala@example.com", isEmailVerified: false };
    getById.mockResolvedValue(user);

    const response = await GET(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, data: { user } });
    expect(getById).toHaveBeenCalledWith(USER_ID);
  });

  it("is 401 for a session whose account was deleted", async () => {
    getById.mockResolvedValue(null);

    expect((await GET(request())).status).toBe(401);
  });

  it("is 401 without a session", async () => {
    harness.actor = null;

    expect((await GET(request())).status).toBe(401);
    expect(getById).not.toHaveBeenCalled();
  });
});
