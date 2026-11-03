/**
 * Typed, Zod-validated access to the app's environment variables.
 *
 * Parsed on access (cheap), never at import time, so `next build` passes
 * with no env at all. `JWT_SECRET` is parsed separately by `getJwtSecret()`:
 * it's required only when a request needs it, and a missing or short secret
 * fails that request closed. The DB connection vars live in `@plantai/db`'s
 * `env.ts` (see AGENTS.md). Errors name the variable, never its value.
 */
import { z } from "zod";

export const MIN_JWT_SECRET_BYTES = 32;

export const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];
export const DEFAULT_LOG_LEVEL: LogLevel = "info";

export const NODE_ENVS = ["production", "development", "test"] as const;
export type NodeEnv = (typeof NODE_ENVS)[number];
// Next.js and Vitest always set NODE_ENV; if something else doesn't, assume
// production so security flags (e.g. `secure` cookies) fail closed.
export const DEFAULT_NODE_ENV: NodeEnv = "production";

/** An HTTP header name: the only shape `TRUSTED_PROXY_IP_HEADER` may take. */
const HEADER_NAME_PATTERN = /^[a-z0-9-]+$/;

export interface Env {
  logLevel: LogLevel;
  nodeEnv: NodeEnv;
  /** Header the deploy's proxy overwrites with the client IP; `null` = don't key rate limits by IP. */
  trustedProxyIpHeader: string | null;
}

/** An empty variable (`FOO=` in `.env`) counts as unset, so its default applies. */
const unsetIfEmpty = (value: unknown) => (value === "" ? undefined : value);

const envSchema = z.object({
  LOG_LEVEL: z.preprocess(
    unsetIfEmpty,
    z.enum(LOG_LEVELS, { error: `must be one of ${LOG_LEVELS.join(", ")}` }).default(DEFAULT_LOG_LEVEL),
  ),
  NODE_ENV: z.preprocess(
    unsetIfEmpty,
    z.enum(NODE_ENVS, { error: `must be one of ${NODE_ENVS.join(", ")}` }).default(DEFAULT_NODE_ENV),
  ),
  TRUSTED_PROXY_IP_HEADER: z.preprocess(
    unsetIfEmpty,
    z
      .string()
      .transform((name) => name.toLowerCase())
      .pipe(z.string().regex(HEADER_NAME_PATTERN, { error: "must be an HTTP header name" }))
      .optional(),
  ),
});

const jwtSecretSchema = z.object({
  JWT_SECRET: z.preprocess(
    unsetIfEmpty,
    z
      .string({ error: "is required" })
      .refine((secret) => Buffer.byteLength(secret, "utf8") >= MIN_JWT_SECRET_BYTES, {
        error: `must be at least ${MIN_JWT_SECRET_BYTES} bytes`,
      }),
  ),
});

/** Throws one error listing every invalid variable by name (values are never echoed). */
function parseOrThrow<T>(schema: z.ZodType<T>): T {
  const result = schema.safeParse(process.env);
  if (result.success) {
    return result.data;
  }
  const problems = result.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`);
  throw new Error(`Invalid environment variables: ${problems.join("; ")}`);
}

export function getEnv(): Env {
  const parsed = parseOrThrow(envSchema);
  return {
    logLevel: parsed.LOG_LEVEL,
    nodeEnv: parsed.NODE_ENV,
    trustedProxyIpHeader: parsed.TRUSTED_PROXY_IP_HEADER ?? null,
  };
}

/** Throws (naming `JWT_SECRET`) when it's missing or shorter than `MIN_JWT_SECRET_BYTES`. */
export function getJwtSecret(): string {
  return parseOrThrow(jwtSecretSchema).JWT_SECRET;
}
