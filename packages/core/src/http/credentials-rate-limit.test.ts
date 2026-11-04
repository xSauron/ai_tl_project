import { afterEach, describe, expect, it, vi } from "vitest";

import { credentialsRateLimit } from "./credentials-rate-limit.ts";
import { AUTH_RATE_LIMIT } from "./rate-limit.ts";

const request = (headers: Record<string, string> = {}) => new Request("http://localhost/api/auth/login", { headers });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("credentialsRateLimit", () => {
  it("uses the auth window under the given name", () => {
    expect(credentialsRateLimit("login")).toMatchObject({ name: "login", ...AUTH_RATE_LIMIT });
  });

  it("keys by the normalized e-mail only, ignoring spoofable headers, without a trusted proxy header", () => {
    vi.stubEnv("TRUSTED_PROXY_IP_HEADER", "");
    const { keys } = credentialsRateLimit("login");

    expect(keys({ req: request({ "x-forwarded-for": "1.2.3.4" }), body: { email: " Ala@Example.com" } })).toEqual([
      "email:ala@example.com",
      null,
    ]);
  });

  it("adds the client IP from the trusted header", () => {
    vi.stubEnv("TRUSTED_PROXY_IP_HEADER", "x-real-ip");
    const { keys } = credentialsRateLimit("register");

    expect(keys({ req: request({ "x-real-ip": "1.2.3.4" }), body: { email: "ala@example.com" } })).toEqual([
      "email:ala@example.com",
      "ip:1.2.3.4",
    ]);
  });
});
