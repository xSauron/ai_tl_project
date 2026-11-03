import { jwtVerify, SignJWT } from "jose";

import { getEnv, getJwtSecret } from "../config/env.ts";
import { uuidSchema } from "../validators/common/uuid.schema.ts";
import { UnauthorizedError } from "./errors.ts";

/**
 * The authenticated caller. A service method that touches owned data takes it
 * as its first argument, so a missing actor fails at compile time.
 */
export type Actor = { userId: string };

export const SESSION_COOKIE = "plantai_session";
const SECONDS_PER_HOUR = 60 * 60;
/** AGENTS.md: 24 h expiry, no refresh flow in MVP. */
export const SESSION_TTL_SECONDS = 24 * SECONDS_PER_HOUR;
export const SESSION_ISSUER = "plantai";
const SESSION_ALGORITHM = "HS256";
const COOKIE_PATH = "/";

function signingKey(): Uint8Array {
  // Throws (naming JWT_SECRET) when it is missing or short: no request is ever treated as signed in.
  return new TextEncoder().encode(getJwtSecret());
}

function cookieAttributes(maxAgeSeconds: number): string {
  const attributes = [`Path=${COOKIE_PATH}`, "HttpOnly", "SameSite=Lax", `Max-Age=${maxAgeSeconds}`];
  if (getEnv().nodeEnv === "production") attributes.push("Secure");
  return attributes.join("; ");
}

export async function issueSessionToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: SESSION_ALGORITHM })
    .setSubject(userId)
    .setIssuer(SESSION_ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(signingKey());
}

/** A `Set-Cookie` value carrying a fresh 24 h session for `userId`. */
export async function issueSessionCookie(userId: string): Promise<string> {
  return `${SESSION_COOKIE}=${await issueSessionToken(userId)}; ${cookieAttributes(SESSION_TTL_SECONDS)}`;
}

/** A `Set-Cookie` value that removes the session cookie. */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; ${cookieAttributes(0)}`;
}

/**
 * The actor of a valid token (HS256, our issuer, not expired, a UUID subject),
 * otherwise `null`. A missing `JWT_SECRET` still throws, so it surfaces as a 500.
 */
export async function verifySessionToken(token: string | undefined): Promise<Actor | null> {
  if (!token) return null;
  const key = signingKey();
  try {
    const { payload } = await jwtVerify(token, key, { issuer: SESSION_ISSUER, algorithms: [SESSION_ALGORITHM] });
    const subject = uuidSchema.safeParse(payload.sub);
    return subject.success ? { userId: subject.data } : null;
  } catch {
    // Expired, tampered, wrong issuer or not a JWT: all mean "not signed in".
    return null;
  }
}

/** The session cookie's value from a request's `Cookie` header. */
export function readSessionToken(headers: Headers): string | undefined {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return undefined;
  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() === SESSION_COOKIE) return pair.slice(separator + 1).trim();
  }
  return undefined;
}

export function resolveSessionActor(req: Request): Promise<Actor | null> {
  return verifySessionToken(readSessionToken(req.headers));
}

export async function requireSession(req: Request): Promise<Actor> {
  const actor = await resolveSessionActor(req);
  if (actor === null) throw new UnauthorizedError();
  return actor;
}
