import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieGet, redirect, verifySessionToken } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  verifySessionToken: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: async () => ({ get: cookieGet }) }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@plantai/core", () => ({ SESSION_COOKIE: "plantai_session", verifySessionToken }));

const { getActor, redirectIfSignedIn, requireActor } = await import("./session");

const ACTOR = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("session DAL", () => {
  it("verifies the session cookie's value", async () => {
    cookieGet.mockReturnValue({ value: "token" });
    verifySessionToken.mockResolvedValue(ACTOR);

    await expect(getActor()).resolves.toEqual(ACTOR);
    expect(cookieGet).toHaveBeenCalledWith("plantai_session");
    expect(verifySessionToken).toHaveBeenCalledWith("token");
  });

  it("passes undefined when there is no cookie", async () => {
    cookieGet.mockReturnValue(undefined);
    verifySessionToken.mockResolvedValue(null);

    await expect(getActor()).resolves.toBeNull();
    expect(verifySessionToken).toHaveBeenCalledWith(undefined);
  });

  it("requireActor returns the actor or redirects to /login", async () => {
    verifySessionToken.mockResolvedValueOnce(ACTOR);
    await expect(requireActor()).resolves.toEqual(ACTOR);

    verifySessionToken.mockResolvedValueOnce(null);
    await expect(requireActor()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("redirectIfSignedIn sends a signed-in visitor to the app and lets a guest stay", async () => {
    verifySessionToken.mockResolvedValueOnce(null);
    await expect(redirectIfSignedIn()).resolves.toBeUndefined();

    verifySessionToken.mockResolvedValueOnce(ACTOR);
    await expect(redirectIfSignedIn()).rejects.toThrow("NEXT_REDIRECT:/gardens");
  });
});
