import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

function renderDialog({ size }: { size?: "default" | "sm" } = {}) {
  return render(
    <AlertDialog>
      <AlertDialogTrigger>Delete garden</AlertDialogTrigger>
      <AlertDialogContent size={size} className="custom-content">
        <AlertDialogHeader>
          <AlertDialogMedia>!</AlertDialogMedia>
          <AlertDialogTitle>Delete this garden?</AlertDialogTitle>
          <AlertDialogDescription>Beds and plantings are removed too.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

describe("AlertDialog", () => {
  it("stays closed until the trigger is pressed", () => {
    renderDialog();
    const trigger = screen.getByRole("button", { name: "Delete garden" });

    expect(trigger).toHaveProperty("dataset.slot", "alert-dialog-trigger");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("opens an accessible alert dialog with default size and button actions", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Delete garden" }));

    const dialog = screen.getByRole("alertdialog", { name: "Delete this garden?" });
    expect(dialog).toHaveProperty("dataset.slot", "alert-dialog-content");
    expect(dialog).toHaveProperty("dataset.size", "default");
    expect(dialog.className).toContain("custom-content");
    expect(dialog.getAttribute("aria-describedby")).toBe(
      screen.getByText("Beds and plantings are removed too.").id,
    );
    expect(document.querySelector("[data-slot=alert-dialog-overlay]")?.className).toContain("bg-overlay");
    expect(screen.getByText("!")).toHaveProperty("dataset.slot", "alert-dialog-media");

    const cancel = screen.getByRole("button", { name: "Cancel" });
    const action = screen.getByRole("button", { name: "Delete" });
    expect(cancel).toHaveProperty("dataset.variant", "outline");
    expect(cancel).toHaveProperty("dataset.size", "default");
    expect(action).toHaveProperty("dataset.variant", "destructive");
    expect(action.className).toContain("h-touch");
  });

  it("supports the small size", () => {
    renderDialog({ size: "sm" });
    fireEvent.click(screen.getByRole("button", { name: "Delete garden" }));

    expect(screen.getByRole("alertdialog")).toHaveProperty("dataset.size", "sm");
  });

  it("closes from the cancel action", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Delete garden" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
