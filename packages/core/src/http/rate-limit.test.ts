import { describe, expect, it } from "vitest";

import { AUTH_RATE_LIMIT, InMemoryRateLimiter, SWEEP_THRESHOLD_KEYS, trustedClientIp } from "./rate-limit.ts";

const WINDOW = { limit: 2, windowMs: 10_000 };

function limiterAt(start = 0) {
  let now = start;
  const limiter = new InMemoryRateLimiter({ now: () => now });
  return { limiter, advance: (ms: number) => (now += ms) };
}

describe("InMemoryRateLimiter", () => {
  it("allows up to the limit within a window, then reports the seconds left", async () => {
    const { limiter, advance } = limiterAt();

    await expect(limiter.consume("k", WINDOW)).resolves.toEqual({ allowed: true, retryAfterSec: 0 });
    await expect(limiter.consume("k", WINDOW)).resolves.toEqual({ allowed: true, retryAfterSec: 0 });
    advance(2_500);
    await expect(limiter.consume("k", WINDOW)).resolves.toEqual({ allowed: false, retryAfterSec: 8 });
  });

  it("starts a new window once the old one ends", async () => {
    const { limiter, advance } = limiterAt();
    for (let i = 0; i < 3; i += 1) await limiter.consume("k", WINDOW);

    advance(10_000);

    await expect(limiter.consume("k", WINDOW)).resolves.toEqual({ allowed: true, retryAfterSec: 0 });
  });

  it("counts keys separately", async () => {
    const { limiter } = limiterAt();
    for (let i = 0; i < 3; i += 1) await limiter.consume("a", WINDOW);

    await expect(limiter.consume("b", WINDOW)).resolves.toMatchObject({ allowed: true });
  });

  it("sweeps expired windows once it tracks many keys", async () => {
    const { limiter, advance } = limiterAt();
    for (let i = 0; i < SWEEP_THRESHOLD_KEYS; i += 1) await limiter.consume(`old-${i}`, WINDOW);
    advance(5_000);
    await limiter.consume("live", WINDOW);
    expect(limiter.size).toBe(SWEEP_THRESHOLD_KEYS + 1);

    advance(5_000);
    await limiter.consume("fresh", WINDOW);

    expect(limiter.size).toBe(2);
  });

  it("uses the real clock by default", async () => {
    await expect(new InMemoryRateLimiter().consume("k", AUTH_RATE_LIMIT)).resolves.toMatchObject({ allowed: true });
  });
});

describe("trustedClientIp", () => {
  it("ignores every header when no trusted header is configured", () => {
    expect(trustedClientIp(new Headers({ "x-forwarded-for": "1.2.3.4" }), null)).toBeNull();
  });

  it.each([
    [{ "x-real-ip": " 1.2.3.4 " }, "1.2.3.4"],
    [{ "x-real-ip": "" }, null],
    [{}, null],
    [{ "x-real-ip": "9".repeat(300) }, "9".repeat(256)],
  ])("reads %o from the configured header", (headers, expected) => {
    expect(trustedClientIp(new Headers(headers), "x-real-ip")).toBe(expected);
  });
});
