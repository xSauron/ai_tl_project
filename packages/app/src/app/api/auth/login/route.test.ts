import { beforeEach, describe, expect, it, vi } from "vitest";

import { allowAll, harness, jsonRequest } from "../../../../../test/api-harness";

vi.mock("@plantai/core", async (importOriginal) =>
  (await import("../../../../../test/api-harness")).coreWithFakeScope(importOriginal),
);

const { POST } = await import("./route");

const USER = { id: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50", email: "ala@example.com", isEmailVerified: false };
const authenticate = vi.fn();

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", "s".repeat(32));
  vi.stubEnv("LOG_LEVEL", "silent");
  authenticate.mockReset().mockResolvedValue(USER);
  harness.actor = null;
  harness.cradle = { userService: { authenticate }, rateLimiter: allowAll };
});

describe("POST /api/auth/login", () => {
  it("signs an unconfirmed account in: 200, the user and the session cookie", async () => {
    const response = await POST(jsonRequest("/api/auth/login", { email: "ala@example.com", password: "short" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, data: { user: USER } });
    expect(authenticate).toHaveBeenCalledWith({ email: "ala@example.com", password: "short" });
    expect(response.headers.getSetCookie()[0]).toMatch(/^plantai_session=/);
  });

  it("returns the generic 401 without a cookie for bad credentials", async () => {
    const { UnauthorizedError } = await import("@plantai/core");
    authenticate.mockRejectedValue(new UnauthorizedError({ code: "INVALID_CREDENTIALS", message: "The e-mail or password is incorrect." }));

    const response = await POST(jsonRequest("/api/auth/login", { email: "ala@example.com", password: "wrong" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "INVALID_CREDENTIALS" } });
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("is rate limited under the login namespace", async () => {
    const consume = vi.fn(async () => ({ allowed: false, retryAfterSec: 60 }));
    harness.cradle = { userService: { authenticate }, rateLimiter: { consume } };

    const response = await POST(jsonRequest("/api/auth/login", { email: "ala@example.com", password: "x" }));

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(consume).toHaveBeenCalledWith("login:email:ala@example.com", expect.anything());
  });
});
