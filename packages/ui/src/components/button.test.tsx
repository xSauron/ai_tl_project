import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders a native button with default variant and size", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveProperty("dataset.variant", "default");
    expect(button).toHaveProperty("dataset.size", "default");
    expect(button.className).toContain("bg-primary");
  });

  it("applies variant, size and custom classes", () => {
    render(
      <Button variant="destructive" size="sm" className="w-full">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });

    expect(button).toHaveProperty("dataset.variant", "destructive");
    expect(button).toHaveProperty("dataset.size", "sm");
    expect(button.className).toContain("bg-destructive");
    expect(button.className).toContain("w-full");
  });

  it("renders its child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/admin">Admin</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Admin" });

    expect(link.getAttribute("href")).toBe("/admin");
    expect(link).toHaveProperty("dataset.slot", "button");
  });

  it("exposes the variant class builder", () => {
    expect(buttonVariants({ variant: "outline", size: "icon" })).toContain("size-9");
  });
});
