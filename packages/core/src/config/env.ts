/**
 * Typed access to environment variables used by the core package.
 * Fail fast: a missing required variable throws on first access.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function int(name: string, fallback: number): number {
  const value = process.env[name];
  return value ? Number.parseInt(value, 10) : fallback;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get dbPoolMin() {
    return int("DB_POOL_MIN", 0);
  },
  get dbPoolMax() {
    return int("DB_POOL_MAX", 10);
  },
  get dbDebug() {
    return process.env.DB_DEBUG === "true";
  },
};
