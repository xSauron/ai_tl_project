import { beforeEach, describe, expect, it, vi } from "vitest";

import { allowAll, harness, jsonRequest } from "../../../../../test/api-harness";

vi.mock("@plantai/core", async (importOriginal) =>
  (await import("../../../../../test/api-harness")).coreWithFakeScope(importOriginal),
);

const { POST } = await import("./route");

const ACTOR = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };
const BODY = { currentPassword: "old-pass", newPassword: "brand-new-pass" };
const changePassword = vi.fn();

beforeEach(() => {
  vi.stubEnv("LOG_LEVEL", "silent");
  changePassword.mockReset().mockResolvedValue(undefined);
  harness.actor = ACTOR;
  harness.cradle = { userService: { changePassword }, rateLimiter: allowAll };
});

describe("POST /api/auth/password", () => {
  it("changes the actor's password from the parsed body", async () => {
    const response = await POST(jsonRequest("/api/auth/password", BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, data: null });
    expect(changePassword).toHaveBeenCalledWith(ACTOR, BODY);
  });

  it("passes a wrong current password through as a field error", async () => {
    const { ValidationError } = await import("@plantai/core");
    changePassword.mockRejectedValue(new ValidationError({ currentPassword: ["The current password is incorrect."] }));

    const response = await POST(jsonRequest("/api/auth/password", BODY));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { fieldErrors: { currentPassword: ["The current password is incorrect."] } },
    });
  });

  it("rejects a too-short new password before the service", async () => {
    const response = await POST(jsonRequest("/api/auth/password", { currentPassword: "old", newPassword: "short" }));

    expect(response.status).toBe(422);
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("is rate limited per user", async () => {
    const consume = vi.fn(async () => ({ allowed: false, retryAfterSec: 900 }));
    harness.cradle = { userService: { changePassword }, rateLimiter: { consume } };

    const response = await POST(jsonRequest("/api/auth/password", BODY));

    expect(response.status).toBe(429);
    expect(consume).toHaveBeenCalledWith(`password-change:user:${ACTOR.userId}`, expect.objectContaining({ limit: 10 }));
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("is 401 without a session", async () => {
    harness.actor = null;

    expect((await POST(jsonRequest("/api/auth/password", BODY))).status).toBe(401);
  });
});
