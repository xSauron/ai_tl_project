/**
 * Typed, Zod-validated access to the database environment variables (read by
 * the ORM config). Lives here, not in `@plantai/core`'s `config/env.ts`,
 * because `db` can't import `core` and the MikroORM CLI runs without it.
 *
 * Parsed lazily on first access, never at import time, so `next build` passes
 * with no DB configured. Errors name the variable, never its value (a
 * connection string carries a password).
 */
import { z } from "zod";

export const DEFAULT_DB_POOL_MIN = 0;
export const DEFAULT_DB_POOL_MAX = 10;
const MIN_DB_POOL_MAX = 1;

export interface DbEnv {
  databaseUrl: string;
  dbPoolMin: number;
  dbPoolMax: number;
  dbDebug: boolean;
}

/** An empty variable (`FOO=` in `.env`) counts as unset, so its default applies. */
const unsetIfEmpty = (value: unknown) => (value === "" ? undefined : value);

function integerVar(minimum: number, fallback: number) {
  return z.preprocess(
    unsetIfEmpty,
    z
      .string()
      .regex(/^\d+$/, { error: `must be an integer ≥ ${minimum}` })
      .transform(Number)
      .refine((value) => value >= minimum, { error: `must be an integer ≥ ${minimum}` })
      .default(fallback),
  );
}

const dbEnvSchema = z
  .object({
    DATABASE_URL: z.preprocess(unsetIfEmpty, z.string({ error: "is required" })),
    DB_POOL_MIN: integerVar(0, DEFAULT_DB_POOL_MIN),
    DB_POOL_MAX: integerVar(MIN_DB_POOL_MAX, DEFAULT_DB_POOL_MAX),
    DB_DEBUG: z.preprocess(
      unsetIfEmpty,
      z
        .enum(["true", "false"], { error: "must be true or false" })
        .default("false")
        .transform((value) => value === "true"),
    ),
  })
  .refine((vars) => vars.DB_POOL_MIN <= vars.DB_POOL_MAX, {
    path: ["DB_POOL_MIN"],
    error: "must not exceed DB_POOL_MAX",
  });

/** Parses on every call (cheap; the ORM config reads it once), so nothing runs at import time. */
export function getDbEnv(): DbEnv {
  const result = dbEnvSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`);
    throw new Error(`Invalid environment variables: ${problems.join("; ")}`);
  }
  const { DATABASE_URL, DB_POOL_MIN, DB_POOL_MAX, DB_DEBUG } = result.data;
  return { databaseUrl: DATABASE_URL, dbPoolMin: DB_POOL_MIN, dbPoolMax: DB_POOL_MAX, dbDebug: DB_DEBUG };
}
