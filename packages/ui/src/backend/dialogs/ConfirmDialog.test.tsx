import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ConfirmDialog,
  type ConfirmDialogProps,
  DEFAULT_CANCEL_LABEL,
  DEFAULT_CONFIRM_LABEL,
  DEFAULT_PENDING_LABEL,
} from "./ConfirmDialog";

const TITLE = "Delete this garden?";
const DESCRIPTION = "Beds and plantings are removed too.";

/** A promise the test settles by hand, to observe the pending state. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function renderUncontrolled(props: Partial<ConfirmDialogProps> = {}) {
  return render(
    <ConfirmDialog
      trigger={<button type="button">Delete</button>}
      title={TITLE}
      description={DESCRIPTION}
      onConfirm={vi.fn()}
      {...props}
    />,
  );
}

function open() {
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  return screen.getByRole("alertdialog", { name: TITLE });
}

const confirmButton = (name = DEFAULT_CONFIRM_LABEL) => screen.getByRole("button", { name });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ConfirmDialog", () => {
  it("opens from the trigger with title, description and default labels", () => {
    renderUncontrolled();
    expect(screen.queryByRole("alertdialog")).toBeNull();

    const dialog = open();

    expect(dialog.getAttribute("data-tone")).toBe("default");
    expect(screen.getByText(DESCRIPTION)).toBeTruthy();
    expect(screen.getByRole("button", { name: DEFAULT_CANCEL_LABEL })).toBeTruthy();
    expect(confirmButton()).toHaveProperty("dataset.variant", "default");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("uses the destructive variant and custom labels", () => {
    renderUncontrolled({ tone: "destructive", confirmLabel: "Delete garden", cancelLabel: "Keep" });
    const dialog = open();

    expect(dialog.getAttribute("data-tone")).toBe("destructive");
    expect(confirmButton("Delete garden")).toHaveProperty("dataset.variant", "destructive");
    expect(screen.getByRole("button", { name: "Keep" })).toBeTruthy();
  });

  it("closes after a synchronous onConfirm", async () => {
    const onConfirm = vi.fn();
    renderUncontrolled({ onConfirm });
    open();

    fireEvent.click(confirmButton());

    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("stays open and disabled while pending, then closes on success", async () => {
    const pending = deferred<{ ok: true; data: null }>();
    renderUncontrolled({ onConfirm: () => pending.promise, pendingLabel: "Deleting…" });
    open();

    fireEvent.click(confirmButton());

    const busy = await screen.findByRole("button", { name: "Deleting…" });
    expect(busy).toHaveProperty("disabled", true);
    expect(busy.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("button", { name: DEFAULT_CANCEL_LABEL })).toHaveProperty("disabled", true);

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    await act(async () => pending.resolve({ ok: true, data: null }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("shows the default pending label", async () => {
    const pending = deferred<void>();
    renderUncontrolled({ onConfirm: () => pending.promise });
    open();

    fireEvent.click(confirmButton());

    expect(await screen.findByRole("button", { name: DEFAULT_PENDING_LABEL })).toBeTruthy();
    await act(async () => pending.resolve());
  });

  it("stays open on a failed ApiResult and shows the caller's error", async () => {
    const error = { code: "NOT_FOUND", message: "This garden doesn't exist." };
    const { rerender } = renderUncontrolled({ onConfirm: async () => ({ ok: false }) });
    open();

    fireEvent.click(confirmButton());
    await waitFor(() => expect(confirmButton()).toHaveProperty("disabled", false));
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    rerender(
      <ConfirmDialog
        trigger={<button type="button">Delete</button>}
        title={TITLE}
        description={DESCRIPTION}
        onConfirm={vi.fn()}
        error={error}
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe(error.message);
  });

  it("stays open when onConfirm rejects", async () => {
    renderUncontrolled({ onConfirm: () => Promise.reject(new Error("network")) });
    open();

    fireEvent.click(confirmButton());

    await waitFor(() => expect(confirmButton()).toHaveProperty("disabled", false));
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it("closes from Cancel when nothing is pending", () => {
    renderUncontrolled();
    open();

    fireEvent.click(screen.getByRole("button", { name: DEFAULT_CANCEL_LABEL }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("is controllable through open and onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ConfirmDialog open title={TITLE} description={DESCRIPTION} onConfirm={vi.fn()} onOpenChange={onOpenChange} />,
    );
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    fireEvent.click(confirmButton());
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    rerender(<ConfirmDialog open={false} title={TITLE} description={DESCRIPTION} onConfirm={vi.fn()} />);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("does not update state after unmounting mid-confirm", async () => {
    const pending = deferred<void>();
    const consoleError = vi.spyOn(console, "error");
    const { unmount } = renderUncontrolled({ onConfirm: () => pending.promise });
    open();
    fireEvent.click(confirmButton());
    await screen.findByRole("button", { name: DEFAULT_PENDING_LABEL });

    unmount();
    await act(async () => pending.resolve());

    expect(consoleError).not.toHaveBeenCalled();
  });
});
