import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { connection, redirect, requireActor, withScope, getById } = vi.hoisted(() => ({
  connection: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  requireActor: vi.fn(),
  withScope: vi.fn(),
  getById: vi.fn(),
}));

vi.mock("next/server", () => ({ connection }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/server/session", () => ({ requireActor }));
vi.mock("@plantai/core", () => ({ withScope }));
vi.mock("./settings-panel", () => ({ SettingsPanel: ({ email }: { email: string }) => <p>{email}</p> }));

const { default: SettingsPage, metadata } = await import("./page");

const ACTOR = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };

beforeEach(() => {
  vi.clearAllMocks();
  requireActor.mockResolvedValue(ACTOR);
  withScope.mockImplementation(async (fn: (cradle: unknown) => unknown) => fn({ userService: { getById } }));
});

describe("SettingsPage", () => {
  it("shows the signed-in user's e-mail", async () => {
    getById.mockResolvedValue({ id: ACTOR.userId, email: "ala@example.com", isEmailVerified: false });

    const html = renderToStaticMarkup(await SettingsPage());

    expect(metadata.title).toBe("Settings");
    expect(html).toBe("<p>ala@example.com</p>");
    expect(getById).toHaveBeenCalledWith(ACTOR.userId);
    expect(connection.mock.invocationCallOrder[0]).toBeLessThan(requireActor.mock.invocationCallOrder[0] ?? 0);
  });

  it("sends a session whose account was deleted to the login page", async () => {
    getById.mockResolvedValue(null);

    await expect(SettingsPage()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("reads nothing for a guest", async () => {
    requireActor.mockRejectedValue(new Error("NEXT_REDIRECT:/login"));

    await expect(SettingsPage()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(withScope).not.toHaveBeenCalled();
  });
});
