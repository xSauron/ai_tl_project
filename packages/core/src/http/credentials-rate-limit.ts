import { getEnv } from "../config/env.ts";
import { normalizeEmail } from "../services/auth/user.service.ts";
import { AUTH_RATE_LIMIT, trustedClientIp, type RateLimitWindow } from "./rate-limit.ts";

export interface CredentialsRateLimitRule extends RateLimitWindow {
  name: string;
  keys: (ctx: { req: Request; body: { email: string } }) => readonly (string | null)[];
}

/**
 * The login/register limit (spec A): per normalized e-mail, so a brute force
 * spread over many IPs is still capped, plus per client IP when the deploy
 * names a trusted proxy header.
 */
export function credentialsRateLimit(name: string): CredentialsRateLimitRule {
  return {
    name,
    ...AUTH_RATE_LIMIT,
    keys: ({ req, body }) => {
      const ip = trustedClientIp(req.headers, getEnv().trustedProxyIpHeader);
      return [`email:${normalizeEmail(body.email)}`, ip === null ? null : `ip:${ip}`];
    },
  };
}
