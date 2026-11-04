import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders a native textarea with forwarded props and classes", () => {
    render(<Textarea aria-label="Description" className="min-h-32" defaultValue="Sunny corner" />);
    const textarea = screen.getByRole("textbox", { name: "Description" });

    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveProperty("dataset.slot", "textarea");
    expect(textarea).toHaveProperty("value", "Sunny corner");
    expect(textarea.className).toContain("min-h-32");
    expect(textarea.className).toContain("border-input");
  });
});
