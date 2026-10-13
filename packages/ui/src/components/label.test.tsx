import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "./label";

describe("Label", () => {
  it("renders a label bound to its control", () => {
    render(
      <>
        <Label htmlFor="name" className="sr-only">
          Name
        </Label>
        <input id="name" />
      </>,
    );

    const label = screen.getByText("Name");
    expect(label.tagName).toBe("LABEL");
    expect(label.className).toContain("sr-only");
    expect(screen.getByLabelText("Name").id).toBe("name");
  });
});
