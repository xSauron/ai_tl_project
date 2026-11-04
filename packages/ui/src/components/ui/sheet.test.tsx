import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

type Side = "top" | "right" | "bottom" | "left";

function renderSheet(contentProps: { side?: Side; showCloseButton?: boolean } = {}) {
  return render(
    <Sheet>
      <SheetTrigger>Open menu</SheetTrigger>
      <SheetContent {...contentProps} className="custom-sheet">
        <SheetHeader>
          <SheetTitle>Garden menu</SheetTitle>
          <SheetDescription>Pick a garden.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  );
}

function openSheet() {
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  return screen.getByRole("dialog", { name: "Garden menu" });
}

describe("Sheet", () => {
  it("opens from the right by default with a touch-sized close button", () => {
    renderSheet();
    const dialog = openSheet();

    expect(dialog).toHaveProperty("dataset.slot", "sheet-content");
    expect(dialog.className).toContain("right-0");
    expect(dialog.className).toContain("custom-sheet");
    expect(screen.getByText("Pick a garden.")).toHaveProperty("dataset.slot", "sheet-description");
    expect(document.querySelector("[data-slot=sheet-overlay]")?.className).toContain("bg-overlay");
    expect(screen.getByRole("button", { name: "Close" }).className).toContain("size-touch");
  });

  it.each<[Side, string]>([
    ["left", "left-0"],
    ["top", "top-0"],
    ["bottom", "bottom-0"],
  ])("slides in from the %s edge", (side, expectedClass) => {
    renderSheet({ side });

    expect(openSheet().className).toContain(expectedClass);
  });

  it("can hide the built-in close button and close from its own action", () => {
    renderSheet({ showCloseButton: false });
    openSheet();

    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
