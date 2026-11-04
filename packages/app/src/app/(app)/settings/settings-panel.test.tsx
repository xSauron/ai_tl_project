// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { apiCall } = vi.hoisted(() => ({ apiCall: vi.fn() }));

vi.mock("@plantai/ui/backend/api/apiCall", () => ({ apiCall }));

const { PASSWORD_CHANGED_MESSAGE, SettingsPanel } = await import("./settings-panel");

const field = (label: RegExp) => screen.getByLabelText(label) as HTMLInputElement;
const fillAndSubmit = (current: string, next: string) => {
  fireEvent.change(field(/Current password/), { target: { value: current } });
  fireEvent.change(field(/New password/), { target: { value: next } });
  fireEvent.click(screen.getByRole("button", { name: "Change password" }));
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("SettingsPanel", () => {
  it("shows the e-mail read-only and password fields for a password manager", () => {
    render(<SettingsPanel email="ala@example.com" />);

    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeTruthy();
    expect(screen.getByText("ala@example.com").tagName).toBe("DD");
    expect(screen.queryByRole("textbox", { name: /E-mail/ })).toBeNull();
    expect(field(/Current password/).getAttribute("autocomplete")).toBe("current-password");
    expect(field(/New password/).getAttribute("autocomplete")).toBe("new-password");
  });

  it("changes the password, confirms it and clears the form", async () => {
    apiCall.mockResolvedValue({ ok: true, data: null });
    render(<SettingsPanel email="ala@example.com" />);

    fillAndSubmit("old-pass", "brand-new-pass");

    expect((await screen.findByRole("status")).textContent).toBe(PASSWORD_CHANGED_MESSAGE);
    expect(apiCall).toHaveBeenCalledWith("/api/auth/password", {
      body: { currentPassword: "old-pass", newPassword: "brand-new-pass" },
    });
    await waitFor(() => expect(field(/Current password/).value).toBe(""));
  });

  it("shows a wrong current password next to its field", async () => {
    apiCall.mockResolvedValue({
      ok: false,
      status: 422,
      error: {
        code: "VALIDATION_FAILED",
        message: "Check the highlighted fields.",
        fieldErrors: { currentPassword: ["The current password is incorrect."] },
      },
    });
    render(<SettingsPanel email="ala@example.com" />);

    fillAndSubmit("wrong", "brand-new-pass");

    expect(await screen.findByText("The current password is incorrect.")).toBeTruthy();
    expect(screen.queryByText(PASSWORD_CHANGED_MESSAGE)).toBeNull();
  });

  it("hides the earlier confirmation when a new change starts", async () => {
    apiCall.mockResolvedValueOnce({ ok: true, data: null }).mockReturnValueOnce(new Promise(() => undefined));
    render(<SettingsPanel email="ala@example.com" />);
    fillAndSubmit("old-pass", "brand-new-pass");
    await screen.findByRole("status");

    fillAndSubmit("brand-new-pass", "another-new-pass");

    await waitFor(() => expect(screen.queryByText(PASSWORD_CHANGED_MESSAGE)).toBeNull());
  });

  it("enforces the new-password rule before calling the API", async () => {
    render(<SettingsPanel email="ala@example.com" />);

    fillAndSubmit("old-pass", "short");

    expect(await screen.findByText("Must be at least 10 characters")).toBeTruthy();
    expect(apiCall).not.toHaveBeenCalled();
  });
});
