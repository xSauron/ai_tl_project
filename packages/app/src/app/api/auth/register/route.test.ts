import { beforeEach, describe, expect, it, vi } from "vitest";

import { allowAll, harness, jsonRequest } from "../../../../../test/api-harness";

vi.mock("@plantai/core", async (importOriginal) =>
  (await import("../../../../../test/api-harness")).coreWithFakeScope(importOriginal),
);

const { POST } = await import("./route");

const USER = { id: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50", email: "ala@example.com", isEmailVerified: false };
const register = vi.fn();

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", "s".repeat(32));
  vi.stubEnv("LOG_LEVEL", "silent");
  register.mockReset().mockResolvedValue(USER);
  harness.actor = null;
  harness.cradle = { userService: { register }, rateLimiter: allowAll };
});

describe("POST /api/auth/register", () => {
  it("creates the account, returns 201 with the user and sets the session cookie", async () => {
    const response = await POST(jsonRequest("/api/auth/register", { email: " ala@example.com", password: "long enough pw" }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true, data: { user: USER } });
    expect(register).toHaveBeenCalledWith({ email: "ala@example.com", password: "long enough pw" });
    expect(response.headers.getSetCookie()[0]).toMatch(/^plantai_session=.+; Path=\/; HttpOnly; SameSite=Lax; Max-Age=86400/);
  });

  it("rejects a short password with 422 field errors before touching the service", async () => {
    const response = await POST(jsonRequest("/api/auth/register", { email: "ala@example.com", password: "short" }));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: { fieldErrors: { password: ["Must be at least 10 characters"] } } });
    expect(register).not.toHaveBeenCalled();
  });

  it("passes the service's generic failure through without a cookie", async () => {
    const { ValidationError } = await import("@plantai/core");
    register.mockRejectedValue(new ValidationError(undefined, { code: "REGISTRATION_FAILED", message: "Could not create the account." }));

    const response = await POST(jsonRequest("/api/auth/register", { email: "ala@example.com", password: "long enough pw" }));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "REGISTRATION_FAILED" } });
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("is rate limited per normalized e-mail", async () => {
    const consume = vi.fn(async () => ({ allowed: false, retryAfterSec: 30 }));
    harness.cradle = { userService: { register }, rateLimiter: { consume } };

    const response = await POST(jsonRequest("/api/auth/register", { email: "Ala@Example.com", password: "long enough pw" }));

    expect(response.status).toBe(429);
    expect(consume).toHaveBeenCalledWith("register:email:ala@example.com", expect.objectContaining({ limit: 10 }));
    expect(register).not.toHaveBeenCalled();
  });

  it("requires the CSRF header", async () => {
    const response = await POST(new Request("http://localhost/api/auth/register", { method: "POST", body: "{}" }));

    expect(response.status).toBe(403);
  });
});
