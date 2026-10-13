import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table";

describe("Table", () => {
  it("renders a scrollable table with all sections", () => {
    render(
      <Table className="text-xs">
        <TableCaption>Gardens</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Backyard</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>1 garden</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    const table = screen.getByRole("table", { name: "Gardens" });
    expect(table.className).toContain("text-xs");
    expect(table.parentElement).toHaveProperty("dataset.slot", "table-container");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveProperty("dataset.slot", "table-head");
    expect(screen.getByRole("cell", { name: "Backyard" })).toHaveProperty("dataset.slot", "table-cell");
    expect(table.querySelector("thead")).toHaveProperty("dataset.slot", "table-header");
    expect(table.querySelector("tbody")).toHaveProperty("dataset.slot", "table-body");
    expect(table.querySelector("tfoot")).toHaveProperty("dataset.slot", "table-footer");
    expect(screen.getAllByRole("row")[0]).toHaveProperty("dataset.slot", "table-row");
  });
});
