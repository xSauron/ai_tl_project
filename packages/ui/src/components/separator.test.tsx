import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator";

describe("Separator", () => {
  it("is horizontal and decorative by default", () => {
    const { container } = render(<Separator className="my-4" />);
    const separator = container.querySelector("[data-slot=separator]");

    expect(separator?.getAttribute("data-orientation")).toBe("horizontal");
    expect(separator?.getAttribute("role")).toBe("none");
    expect(separator?.className).toContain("my-4");
  });

  it("supports a semantic vertical separator", () => {
    const { getByRole } = render(<Separator orientation="vertical" decorative={false} />);

    expect(getByRole("separator").getAttribute("aria-orientation")).toBe("vertical");
  });
});
