// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh, apiCall } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn(), apiCall: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock("@plantai/ui/backend/api/apiCall", () => ({ apiCall }));

const { CredentialsForm } = await import("./credentials-form");
const { PASSWORD_RULE_DESCRIPTION } = await import("@/lib/password-rule");

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(new RegExp(label)), { target: { value } });

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("CredentialsForm", () => {
  it("logs in through the API and goes to the app", async () => {
    apiCall.mockResolvedValue({ ok: true, data: { user: {} } });
    render(<CredentialsForm mode="login" />);

    expect(screen.getByLabelText(/Password/).getAttribute("autocomplete")).toBe("current-password");
    expect(screen.queryByText(PASSWORD_RULE_DESCRIPTION)).toBeNull();
    fill("E-mail", " ala@example.com");
    fill("Password", "short");
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/gardens"));
    expect(apiCall).toHaveBeenCalledWith("/api/auth/login", { body: { email: "ala@example.com", password: "short" } });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("registers with the password rule shown and enforced before calling the API", async () => {
    render(<CredentialsForm mode="register" />);

    expect(screen.getByLabelText(/Password/).getAttribute("autocomplete")).toBe("new-password");
    expect(screen.getByText(PASSWORD_RULE_DESCRIPTION)).toBeTruthy();
    fill("E-mail", "ala@example.com");
    fill("Password", "short");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Must be at least 10 characters")).toBeTruthy();
    expect(apiCall).not.toHaveBeenCalled();
  });

  it("shows the server's generic error and stays on the page", async () => {
    apiCall.mockResolvedValue({
      ok: false,
      status: 401,
      error: { code: "INVALID_CREDENTIALS", message: "The e-mail or password is incorrect." },
    });
    render(<CredentialsForm mode="login" />);
    fill("E-mail", "ala@example.com");
    fill("Password", "wrong");
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect((await screen.findByRole("alert")).textContent).toContain("The e-mail or password is incorrect.");
    expect(push).not.toHaveBeenCalled();
  });

  it("registers through the register endpoint", async () => {
    apiCall.mockResolvedValue({ ok: true, data: { user: {} } });
    render(<CredentialsForm mode="register" />);
    fill("E-mail", "ala@example.com");
    fill("Password", "long enough pw");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(apiCall).toHaveBeenCalledWith("/api/auth/register", expect.anything()));
  });
});
