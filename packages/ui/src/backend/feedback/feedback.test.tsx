import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "./EmptyState";
import { DEFAULT_RETRY_LABEL, ErrorMessage } from "./ErrorMessage";
import { DEFAULT_LOADING_LABEL, LoadingMessage } from "./LoadingMessage";

const ERROR = {
  code: "NOT_FOUND",
  message: "This garden doesn't exist.",
  fieldErrors: { name: ["Required"] },
  details: { internal: "owner mismatch" },
};

describe("LoadingMessage", () => {
  it("announces the default label as a polite status", () => {
    render(<LoadingMessage />);

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe(DEFAULT_LOADING_LABEL);
    expect(status).toHaveProperty("dataset.slot", "loading-message");
  });

  it("takes a custom label and class", () => {
    render(<LoadingMessage label="Loading gardens…" className="custom" />);

    const status = screen.getByRole("status", { name: "" });
    expect(status.textContent).toBe("Loading gardens…");
    expect(status.className).toContain("custom");
    expect(status.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("ErrorMessage", () => {
  it("renders nothing without an error", () => {
    const { container } = render(<ErrorMessage error={null} />);

    expect(container.innerHTML).toBe("");
  });

  it("shows only the message as an alert, never code, details or field errors", () => {
    render(<ErrorMessage error={ERROR} className="custom" />);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe(ERROR.message);
    expect(alert.className).toContain("custom");
    expect(alert.textContent).not.toContain("NOT_FOUND");
    expect(alert.textContent).not.toContain("owner mismatch");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers a retry button with the default label", () => {
    const onRetry = vi.fn();
    render(<ErrorMessage error={ERROR} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: DEFAULT_RETRY_LABEL }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("takes a custom retry label", () => {
    render(<ErrorMessage error={ERROR} onRetry={vi.fn()} retryLabel="Reload" />);

    expect(screen.getByRole("button", { name: "Reload" })).toBeTruthy();
  });
});

describe("EmptyState", () => {
  it("renders the title alone", () => {
    const { container } = render(<EmptyState title="No gardens yet" />);

    const root = container.querySelector("[data-slot=empty-state]");
    expect(root?.textContent).toBe("No gardens yet");
    expect(root?.querySelectorAll("p")).toHaveLength(1);
  });

  it("renders the description, action and class", () => {
    const { container } = render(
      <EmptyState
        title="No gardens yet"
        description="Create your first one."
        action={<button type="button">New garden</button>}
        className="custom"
      />,
    );

    expect(screen.getByText("Create your first one.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New garden" })).toBeTruthy();
    expect(container.querySelector("[data-slot=empty-state]")?.className).toContain("custom");
  });
});
