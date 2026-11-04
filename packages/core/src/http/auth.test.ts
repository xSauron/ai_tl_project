import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSessionCookie,
  issueSessionCookie,
  issueSessionToken,
  readSessionToken,
  requireSession,
  resolveSessionActor,
  SESSION_COOKIE,
  SESSION_ISSUER,
  SESSION_TTL_SECONDS,
  verifySessionToken,
} from "./auth.ts";
import { ERROR_CODES } from "./errors.ts";

const SECRET = "s".repeat(32);
const USER_ID = "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50";
const NOW = new Date("2026-11-03T12:00:00Z");
const key = (secret = SECRET) => new TextEncoder().encode(secret);

function token(claims: { sub?: string; iss?: string; exp?: number; alg?: string; secret?: string } = {}) {
  const jwt = new SignJWT({}).setProtectedHeader({ alg: claims.alg ?? "HS256" }).setIssuedAt();
  if (claims.sub !== undefined) jwt.setSubject(claims.sub);
  jwt.setIssuer(claims.iss ?? SESSION_ISSUER);
  jwt.setExpirationTime(claims.exp ?? Math.floor(NOW.getTime() / 1000) + 60);
  return jwt.sign(key(claims.secret));
}

const withCookie = (cookie: string) => new Request("http://localhost/api/x", { headers: { cookie } });

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  vi.stubEnv("JWT_SECRET", SECRET);
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("session tokens", () => {
  it("round-trips a 24 h HS256 token for the user", async () => {
    const issued = await issueSessionToken(USER_ID);
    const [header, payload] = issued.split(".").slice(0, 2).map((part) => JSON.parse(Buffer.from(part, "base64url").toString()));

    expect(header).toEqual({ alg: "HS256" });
    expect(payload).toMatchObject({ sub: USER_ID, iss: SESSION_ISSUER });
    expect(payload.exp - payload.iat).toBe(SESSION_TTL_SECONDS);
    await expect(verifySessionToken(issued)).resolves.toEqual({ userId: USER_ID });
  });

  it("returns null without a token", async () => {
    await expect(verifySessionToken(undefined)).resolves.toBeNull();
    await expect(verifySessionToken("")).resolves.toBeNull();
  });

  it.each([
    ["expired", () => token({ sub: USER_ID, exp: Math.floor(NOW.getTime() / 1000) - 1 })],
    ["signed with another secret", () => token({ sub: USER_ID, secret: "x".repeat(32) })],
    ["from another issuer", () => token({ sub: USER_ID, iss: "someone-else" })],
    ["signed with HS512", () => token({ sub: USER_ID, alg: "HS512" })],
    ["missing a subject", () => token()],
    ["with a non-UUID subject", () => token({ sub: "admin" })],
    ["not a JWT", async () => "not-a-jwt"],
  ])("rejects a token %s", async (_label, make) => {
    await expect(verifySessionToken(await make())).resolves.toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const [header, , signature] = (await issueSessionToken(USER_ID)).split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "0b6e2f5e-3c1d-4a8b-9f7e-2d4c6b8a0e1f", iss: SESSION_ISSUER })).toString("base64url");

    await expect(verifySessionToken(`${header}.${forged}.${signature}`)).resolves.toBeNull();
  });

  it("fails closed with an error naming JWT_SECRET when the secret is missing", async () => {
    vi.stubEnv("JWT_SECRET", "");

    await expect(issueSessionToken(USER_ID)).rejects.toThrow("JWT_SECRET");
    await expect(verifySessionToken("anything")).rejects.toThrow("JWT_SECRET");
  });
});

describe("session cookies", () => {
  it("issues an httpOnly, lax, root-path cookie for 24 h, not secure outside production", async () => {
    const cookie = await issueSessionCookie(USER_ID);

    expect(cookie).toMatch(new RegExp(`^${SESSION_COOKIE}=[\\w-]+\\.[\\w-]+\\.[\\w-]+; `));
    expect(cookie).toContain("; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400");
    expect(cookie).not.toContain("Secure");
  });

  it("adds Secure in production, to both the session and the clearing cookie", async () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(await issueSessionCookie(USER_ID)).toMatch(/; Secure$/);
    expect(clearSessionCookie()).toBe(`${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`);
  });

  it("clears the cookie with Max-Age=0", () => {
    expect(clearSessionCookie()).toBe(`${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  });

  it.each([
    ["", undefined],
    ["theme=dark", undefined],
    [`${SESSION_COOKIE}=abc`, "abc"],
    [`theme=dark; ${SESSION_COOKIE}=abc.def ; other=1`, "abc.def"],
    [`broken; ${SESSION_COOKIE}=abc`, "abc"],
    [`x${SESSION_COOKIE}=nope`, undefined],
  ])("reads the session token from %j", (cookie, expected) => {
    const headers = new Headers(cookie ? { cookie } : {});

    expect(readSessionToken(headers)).toBe(expected);
  });
});

describe("resolveSessionActor and requireSession", () => {
  it("resolves the actor from the request cookie", async () => {
    const cookie = (await issueSessionCookie(USER_ID)).split(";")[0] ?? "";

    await expect(resolveSessionActor(withCookie(cookie))).resolves.toEqual({ userId: USER_ID });
    await expect(requireSession(withCookie(cookie))).resolves.toEqual({ userId: USER_ID });
  });

  it("requireSession throws 401 without a valid session", async () => {
    await expect(requireSession(withCookie(`${SESSION_COOKIE}=forged`))).rejects.toMatchObject({
      status: 401,
      code: ERROR_CODES.UNAUTHORIZED,
    });
  });
});
