// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { refresh, apiCall } = vi.hoisted(() => ({ refresh: vi.fn(), apiCall: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@plantai/ui/backend/api/apiCall", () => ({ apiCall }));

const { GardensPanel } = await import("./gardens-panel");

const GARDEN = { id: "g1", name: "Back yard", description: "Tomatoes", createdAt: "2026-11-03T10:00:00.000Z" };
const BARE = { id: "g2", name: "Allotment", description: null, createdAt: "2026-11-02T10:00:00.000Z" };
const OK = { ok: true, data: GARDEN };

/** The table and the cards both render; the table holds the md+ layout. */
const table = () => screen.getByRole("table", { name: "Your gardens" });

beforeAll(() => {
  // jsdom has no layout APIs that Radix dialogs touch.
  Element.prototype.scrollIntoView = () => undefined;
});

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

beforeEach(() => {
  vi.clearAllMocks();
  apiCall.mockResolvedValue(OK);
});

afterEach(() => {
  cleanup();
});

describe("GardensPanel", () => {
  it("shows the empty state with a create button", () => {
    render(<GardensPanel gardens={[]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Gardens" })).toBeTruthy();
    expect(screen.getByText("No gardens yet")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "New garden" })).toHaveLength(2);
  });

  it("lists gardens with the description under the name, and the creation date", () => {
    render(<GardensPanel gardens={[GARDEN, BARE]} />);

    const rows = within(table()).getAllByRole("row").slice(1);
    expect(rows.map((row) => within(row).getAllByRole("cell").slice(0, 2).map((cell) => cell.textContent))).toEqual([
      ["Back yardTomatoes", "2026-11-03"],
      ["Allotment", "2026-11-02"],
    ]);
    expect(within(table()).getByText("Tomatoes").className).toContain("text-muted-foreground");
  });

  it("creates a garden in a sheet, then closes it and refreshes", async () => {
    render(<GardensPanel gardens={[]} />);
    fireEvent.click(screen.getAllByRole("button", { name: "New garden" })[0] as HTMLElement);

    const dialog = await screen.findByRole("dialog", { name: "New garden" });
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: " Herb spiral " } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Create garden" }));

    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(apiCall).toHaveBeenCalledWith("/api/gardens", { body: { name: "Herb spiral", description: null } });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("renames with the current values filled in and sends a PATCH", async () => {
    render(<GardensPanel gardens={[GARDEN]} />);
    fireEvent.click(within(table()).getByRole("button", { name: "Rename Back yard" }));

    const dialog = await screen.findByRole("dialog", { name: "Rename garden" });
    const name = within(dialog).getByLabelText(/Name/) as HTMLInputElement;
    expect(name.value).toBe("Back yard");
    fireEvent.change(name, { target: { value: "Front yard" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(apiCall).toHaveBeenCalledWith("/api/gardens/g1", {
        method: "PATCH",
        body: { name: "Front yard", description: "Tomatoes" },
      }),
    );
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("closes the sheet from Cancel without writing", async () => {
    render(<GardensPanel gardens={[BARE]} />);
    fireEvent.click(within(table()).getByRole("button", { name: "Rename Allotment" }));
    const dialog = await screen.findByRole("dialog", { name: "Rename garden" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(apiCall).not.toHaveBeenCalled();
  });

  it("closes the create sheet from Cancel too", async () => {
    render(<GardensPanel gardens={[]} />);
    fireEvent.click(screen.getAllByRole("button", { name: "New garden" })[0] as HTMLElement);
    const dialog = await screen.findByRole("dialog", { name: "New garden" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes the sheet on Escape", async () => {
    render(<GardensPanel gardens={[]} />);
    fireEvent.click(screen.getAllByRole("button", { name: "New garden" })[0] as HTMLElement);
    const dialog = await screen.findByRole("dialog", { name: "New garden" });

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("deletes after confirmation and refreshes", async () => {
    apiCall.mockResolvedValue({ ok: true, data: { id: "g1" } });
    render(<GardensPanel gardens={[GARDEN]} />);
    fireEvent.click(within(table()).getByRole("button", { name: "Delete Back yard" }));

    const confirm = await screen.findByRole("alertdialog", { name: "Delete “Back yard”?" });
    fireEvent.click(within(confirm).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(apiCall).toHaveBeenCalledWith("/api/gardens/g1", { method: "DELETE" });
  });

  it("keeps the confirmation open with the error when the delete fails", async () => {
    apiCall.mockResolvedValue({ ok: false, status: 404, error: { code: "NOT_FOUND", message: "That garden is gone." } });
    render(<GardensPanel gardens={[GARDEN]} />);
    fireEvent.click(within(table()).getByRole("button", { name: "Delete Back yard" }));
    const confirm = await screen.findByRole("alertdialog");

    fireEvent.click(within(confirm).getByRole("button", { name: "Delete" }));

    expect((await within(confirm).findByRole("alert")).textContent).toContain("That garden is gone.");
    expect(refresh).not.toHaveBeenCalled();
  });
});
