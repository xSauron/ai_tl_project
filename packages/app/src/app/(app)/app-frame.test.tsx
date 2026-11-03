// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh, apiCall, pathname } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  apiCall: vi.fn(),
  pathname: { current: "/gardens" },
}));

vi.mock("next/navigation", () => ({ usePathname: () => pathname.current, useRouter: () => ({ push, refresh }) }));
vi.mock("@plantai/ui/backend/api/apiCall", () => ({ apiCall }));

const { AppFrame } = await import("./app-frame");

beforeEach(() => {
  vi.clearAllMocks();
  pathname.current = "/gardens";
});

afterEach(() => {
  cleanup();
});

describe("AppFrame", () => {
  it("marks the current section active and renders the page", () => {
    render(<AppFrame>page body</AppFrame>);

    const gardens = within(screen.getByRole("navigation")).getByRole("link", { name: "Gardens" });
    expect(gardens.getAttribute("href")).toBe("/gardens");
    expect(gardens.getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("main").textContent).toContain("page body");
  });

  it("leaves the section inactive elsewhere", () => {
    pathname.current = "/settings";
    render(<AppFrame>x</AppFrame>);

    expect(within(screen.getByRole("navigation")).getByRole("link", { name: "Gardens" }).hasAttribute("aria-current")).toBe(false);
  });

  it("logs out through the API and returns to the login page", async () => {
    apiCall.mockResolvedValue({ ok: true, data: null });
    render(<AppFrame>x</AppFrame>);

    fireEvent.click(within(screen.getByRole("main")).getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
    expect(apiCall).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(refresh).toHaveBeenCalledOnce();
  });
});
