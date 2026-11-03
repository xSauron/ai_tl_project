const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
/** Past this many tracked keys, expired windows are swept on the next `consume`. */
export const SWEEP_THRESHOLD_KEYS = 10_000;
/** Bounds what a client-controlled value (an IP header) can put into a key. */
const MAX_KEY_PART_LENGTH = 256;

export interface RateLimitWindow {
  limit: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  /** Whole seconds until the window resets; `0` when allowed. */
  retryAfterSec: number;
}

/** Port: counts attempts per key. MVP adapter: `InMemoryRateLimiter` (spec A). */
export interface RateLimiter {
  consume(key: string, window: RateLimitWindow): Promise<RateLimitDecision>;
}

/** Login and register: attempts per normalized e-mail (and per IP when trusted) in 15 minutes. */
export const AUTH_RATE_LIMIT: RateLimitWindow = { limit: 10, windowMs: 15 * SECONDS_PER_MINUTE * MS_PER_SECOND };

/**
 * Fixed-window counter in process memory. One instance lives in the root
 * container, so counters survive across requests but reset on restart and
 * are per Next.js layer (accepted for MVP, spec A Risks).
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();
  private readonly now: () => number;

  constructor({ now = Date.now }: { now?: () => number } = {}) {
    this.now = now;
  }

  async consume(key: string, { limit, windowMs }: RateLimitWindow): Promise<RateLimitDecision> {
    const now = this.now();
    if (this.windows.size >= SWEEP_THRESHOLD_KEYS) this.sweep(now);

    const current = this.windows.get(key);
    const entry = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };
    entry.count += 1;
    this.windows.set(key, entry);

    if (entry.count <= limit) return { allowed: true, retryAfterSec: 0 };
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / MS_PER_SECOND) };
  }

  /** Number of keys currently tracked (for tests and diagnostics). */
  get size(): number {
    return this.windows.size;
  }

  private sweep(now: number): void {
    for (const [key, entry] of this.windows) {
      if (entry.resetAt <= now) this.windows.delete(key);
    }
  }
}

/**
 * The client IP, read only from a header the deploy's proxy overwrites
 * (`TRUSTED_PROXY_IP_HEADER`). Without one there's no trustworthy IP: raw
 * `x-forwarded-for` is set by the client, so it would let anyone dodge a limit.
 */
export function trustedClientIp(headers: Headers, trustedHeader: string | null): string | null {
  if (trustedHeader === null) return null;
  const value = headers.get(trustedHeader)?.trim();
  return value ? value.slice(0, MAX_KEY_PART_LENGTH) : null;
}
