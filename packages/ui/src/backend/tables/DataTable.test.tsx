import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type DataTableColumn, DataTable, type DataTableProps, DEFAULT_ACTIONS_HEADER, DEFAULT_EMPTY_TITLE } from "./DataTable";

type Garden = { id: string; name: string; description: string };

const ROWS: Garden[] = [
  { id: "g1", name: "Back yard", description: "Three beds" },
  { id: "g2", name: "Allotment", description: "Fruit trees" },
];

const COLUMNS: DataTableColumn<Garden>[] = [
  { key: "name", header: "Name", cell: (row) => row.name },
  { key: "description", header: "Description", cell: (row) => row.description, hideOnMobile: true },
];

function renderTable(props: Partial<DataTableProps<Garden>> = {}) {
  return render(
    <DataTable columns={COLUMNS} rows={ROWS} getRowId={(row) => row.id} caption="Your gardens" {...props} />,
  );
}

const desktopTable = () => screen.getByRole("table", { name: "Your gardens" });
const cardList = () => screen.getByRole("list", { name: "Your gardens" });

describe("DataTable", () => {
  it("renders a captioned table with a column header and a row per item", () => {
    renderTable();

    const table = desktopTable();
    expect(within(table).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Name", "Description"]);
    expect(within(table).getAllByRole("columnheader")[0]?.getAttribute("scope")).toBe("col");
    const bodyRows = within(table).getAllByRole("row").slice(1);
    expect(bodyRows.map((row) => within(row).getAllByRole("cell").map((cell) => cell.textContent))).toEqual([
      ["Back yard", "Three beds"],
      ["Allotment", "Fruit trees"],
    ]);
    expect(table.closest("div.hidden")?.className).toContain("md:block");
  });

  it("renders one card per row below md, without hideOnMobile columns", () => {
    renderTable();

    const list = cardList();
    expect(list.className).toContain("md:hidden");
    const cards = within(list).getAllByRole("listitem");
    expect(cards).toHaveLength(2);
    expect(within(cards[0] as HTMLElement).getByText("Name").tagName).toBe("DT");
    expect(within(cards[0] as HTMLElement).getByText("Back yard").tagName).toBe("DD");
    expect(within(list).queryByText("Description")).toBeNull();
    expect(within(list).queryByText("Three beds")).toBeNull();
  });

  it("titles each card with the primary column, actions beside it, and no empty label list", () => {
    renderTable({
      columns: [{ ...COLUMNS[0]!, isPrimary: true }, COLUMNS[1]!],
      rowActions: (row) => <button type="button">Rename {row.name}</button>,
    });

    const card = within(cardList()).getAllByRole("listitem")[0] as HTMLElement;
    expect(within(card).queryByText("Name")).toBeNull();
    expect(card.querySelector("dl")).toBeNull();
    const title = within(card).getByText("Back yard");
    expect(title.parentElement?.querySelector("button")?.textContent).toBe("Rename Back yard");
    expect(within(card).getAllByRole("button")).toHaveLength(1);
    expect(within(desktopTable()).getAllByRole("columnheader")[0]?.textContent).toBe("Name");
  });

  it("keeps the other columns as labels under a primary title without actions", () => {
    renderTable({ columns: [{ ...COLUMNS[0]!, isPrimary: true }, { ...COLUMNS[1]!, hideOnMobile: false }] });

    const card = within(cardList()).getAllByRole("listitem")[0] as HTMLElement;
    expect(within(card).getByText("Back yard").parentElement?.querySelector("button")).toBeNull();
    expect(within(card).getByText("Description").tagName).toBe("DT");
    expect(within(card).queryByRole("button")).toBeNull();
  });

  it("renders row actions in both layouts under a hidden header", () => {
    const onRename = vi.fn();
    renderTable({
      rowActions: (row) => (
        <button type="button" onClick={() => onRename(row.id)}>
          Rename {row.name}
        </button>
      ),
    });

    const headers = within(desktopTable()).getAllByRole("columnheader");
    expect(headers).toHaveLength(3);
    expect(headers[2]?.textContent).toBe(DEFAULT_ACTIONS_HEADER);
    expect(headers[2]?.querySelector(".sr-only")).toBeTruthy();

    fireEvent.click(within(desktopTable()).getByRole("button", { name: "Rename Allotment" }));
    fireEvent.click(within(cardList()).getByRole("button", { name: "Rename Back yard" }));
    expect(onRename.mock.calls).toEqual([["g2"], ["g1"]]);
  });

  it("takes a custom actions header", () => {
    renderTable({ rowActions: () => null, actionsHeader: "Manage" });

    expect(within(desktopTable()).getAllByRole("columnheader")[2]?.textContent).toBe("Manage");
  });

  it("shows the default empty state for no rows", () => {
    renderTable({ rows: [] });

    expect(screen.getByText(DEFAULT_EMPTY_TITLE)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows the given empty slot", () => {
    renderTable({ rows: [], empty: <p>No gardens yet</p> });

    expect(screen.getByText("No gardens yet")).toBeTruthy();
    expect(screen.queryByText(DEFAULT_EMPTY_TITLE)).toBeNull();
  });

  it("shows the loading state instead of rows", () => {
    renderTable({ isLoading: true, loadingLabel: "Loading gardens…" });

    expect(screen.getByRole("status").textContent).toBe("Loading gardens…");
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows the error first, with retry", () => {
    const onRetry = vi.fn();
    renderTable({ isLoading: true, error: { code: "NETWORK", message: "Can't reach the server." }, onRetry });

    expect(screen.getByRole("alert").textContent).toContain("Can't reach the server.");
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
