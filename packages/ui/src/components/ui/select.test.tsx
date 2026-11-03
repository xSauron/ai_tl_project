import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

function renderSelect({ isOpen, position }: { isOpen: boolean; position?: "item-aligned" | "popper" }) {
  return render(
    <Select open={isOpen} defaultValue="tomato">
      <SelectTrigger aria-label="Crop" className="w-48">
        <SelectValue placeholder="Pick a crop" />
      </SelectTrigger>
      <SelectContent position={position}>
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="tomato">Tomato</SelectItem>
          <SelectItem value="carrot" disabled>
            Carrot
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
      </SelectContent>
    </Select>,
  );
}

describe("Select", () => {
  beforeAll(() => {
    // jsdom has no layout APIs; Radix scrolls the selected option into view on open.
    Element.prototype.scrollIntoView = () => undefined;
  });

  afterAll(() => {
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  });

  it("renders a touch-sized combobox trigger showing the selected value", () => {
    renderSelect({ isOpen: false });
    const trigger = screen.getByRole("combobox", { name: "Crop" });

    expect(trigger).toHaveProperty("dataset.slot", "select-trigger");
    expect(trigger.className).toContain("h-touch");
    expect(trigger.className).toContain("w-48");
    expect(trigger.textContent).toContain("Tomato");
  });

  it("lists touch-sized options when open (item-aligned by default)", () => {
    renderSelect({ isOpen: true });
    const listbox = screen.getByRole("listbox");

    expect(listbox).toHaveProperty("dataset.slot", "select-content");
    expect(listbox.className).not.toContain("translate-y-1");
    expect(screen.getByRole("option", { name: "Tomato" }).className).toContain("min-h-touch");
    expect(screen.getByRole("option", { name: "Carrot" }).getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Vegetables")).toHaveProperty("dataset.slot", "select-label");
    expect(document.querySelector("[data-slot=select-separator]")).not.toBeNull();
  });

  it("offsets the popper position from the trigger", () => {
    renderSelect({ isOpen: true, position: "popper" });

    expect(screen.getByRole("listbox").className).toContain("translate-y-1");
  });

});
