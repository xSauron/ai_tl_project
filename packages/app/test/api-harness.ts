import type * as Core from "@plantai/core";

type Actor = Core.Actor;

/**
 * Route tests run the real `apiHandler` lifecycle (CSRF, parsing, rate-limit
 * rules, envelope) with a fake session and a fake request scope, so no route
 * test needs a database. Tests set `harness.actor` and `harness.cradle`.
 */
export const harness: { actor: Actor | null; cradle: Record<string, unknown> } = { actor: null, cradle: {} };

/** An always-allowing limiter; the limiter itself is tested in core. */
export const allowAll = { consume: async () => ({ allowed: true, retryAfterSec: 0 }) };

export async function coreWithFakeScope(importOriginal: () => Promise<typeof Core>): Promise<typeof Core> {
  const real = await importOriginal();
  return {
    ...real,
    apiHandler: real.createApiHandler({
      resolveActor: async () => harness.actor,
      withScope: async (fn) => fn(harness.cradle as never),
    }),
  };
}

export const CSRF_HEADERS = { "x-plantai-request": "1", "content-type": "application/json" };

export function jsonRequest(path: string, body?: unknown, method = "POST"): Request {
  return new Request(`http://localhost${path}`, {
    method,
    headers: CSRF_HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
