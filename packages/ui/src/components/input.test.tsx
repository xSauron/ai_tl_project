import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("forwards type, props and classes", () => {
    render(<Input type="email" placeholder="Email" className="w-64" required />);
    const input = screen.getByPlaceholderText("Email");

    expect(input.getAttribute("type")).toBe("email");
    expect(input).toHaveProperty("required", true);
    expect(input).toHaveProperty("dataset.slot", "input");
    expect(input.className).toContain("w-64");
  });
});
