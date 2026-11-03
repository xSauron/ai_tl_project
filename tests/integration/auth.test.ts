import { randomUUID } from "node:crypto";

import { describe, expect, inject, it } from "vitest";

import { useBrowser } from "./support/use-browser.ts";

const CSRF = { "x-plantai-request": "1", "content-type": "application/json" };
const PASSWORD = "integration-pass-1";
/** `AUTH_RATE_LIMIT.limit` in core: attempts per e-mail per window. */
const AUTH_ATTEMPTS_PER_WINDOW = 10;

interface Envelope {
  ok: boolean;
  data?: { user: { id: string; email: string; isEmailVerified: boolean } } | null;
  error?: { code: string };
}

const uniqueEmail = () => `it-${randomUUID()}@example.com`;

async function call(path: string, init: { method?: string; body?: unknown; cookie?: string } = {}) {
  const response = await fetch(new URL(path, inject("baseUrl")), {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: { ...CSRF, ...(init.cookie ? { cookie: init.cookie } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  return { response, json: (await response.json()) as Envelope };
}

const sessionCookie = (response: Response) => response.headers.getSetCookie()[0]?.split(";")[0] ?? "";

describe("Auth API against PostgreSQL", () => {
  it("registers, logs in, reads /me and logs out", async () => {
    const email = uniqueEmail();

    const registered = await call("/api/auth/register", { body: { email: email.toUpperCase(), password: PASSWORD } });
    expect(registered.response.status).toBe(201);
    expect(registered.json.data?.user).toMatchObject({ email, isEmailVerified: false });
    expect(registered.response.headers.getSetCookie()[0]).toMatch(/HttpOnly; SameSite=Lax/);

    const loggedIn = await call("/api/auth/login", { body: { email, password: PASSWORD } });
    expect(loggedIn.response.status).toBe(200);
    const cookie = sessionCookie(loggedIn.response);

    const me = await call("/api/auth/me", { cookie });
    expect(me.json).toEqual({ ok: true, data: { user: registered.json.data?.user } });

    const loggedOut = await call("/api/auth/logout", { method: "POST", cookie });
    expect(loggedOut.response.status).toBe(200);
    expect(loggedOut.response.headers.getSetCookie()[0]).toContain("Max-Age=0");

    expect((await call("/api/auth/me")).response.status).toBe(401);
  });

  it("answers a taken e-mail and a wrong password with generic errors", async () => {
    const email = uniqueEmail();
    await call("/api/auth/register", { body: { email, password: PASSWORD } });

    const again = await call("/api/auth/register", { body: { email, password: PASSWORD } });
    expect(again.response.status).toBe(422);
    expect(again.json.error?.code).toBe("REGISTRATION_FAILED");

    const wrong = await call("/api/auth/login", { body: { email, password: "not-the-password" } });
    const unknown = await call("/api/auth/login", { body: { email: uniqueEmail(), password: PASSWORD } });
    expect(wrong.json).toEqual(unknown.json);
    expect(wrong.response.status).toBe(401);
  });

  it("limits login attempts per e-mail with 429 and Retry-After", async () => {
    const email = uniqueEmail();
    for (let attempt = 0; attempt < AUTH_ATTEMPTS_PER_WINDOW; attempt += 1) {
      expect((await call("/api/auth/login", { body: { email, password: "wrong-password" } })).response.status).toBe(401);
    }

    const limited = await call("/api/auth/login", { body: { email, password: "wrong-password" } });
    expect(limited.response.status).toBe(429);
    expect(Number(limited.response.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("rejects a state-changing request without the CSRF header", async () => {
    const response = await fetch(new URL("/api/auth/login", inject("baseUrl")), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: uniqueEmail(), password: PASSWORD }),
    });

    expect(response.status).toBe(403);
  });
});

const browser = useBrowser("auth");

describe("Auth pages", () => {
  it("renders the login form and links to registration", async () => {
    await browser().open("/login");

    expect(await browser().title()).toBe("Log in · Plant.AI");
    expect(await browser().headingText("Log in")).toBe("Log in");
    await browser().clickRole("link", "Create one");
    await browser().waitForPath("/register");
    expect(await browser().headingText("Create account")).toBe("Create account");
  });
});
