import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  it("renders a span with the default variant", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");

    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveProperty("dataset.variant", "default");
  });

  it("supports variants, custom classes and asChild", () => {
    render(
      <Badge variant="secondary" className="ml-2" asChild>
        <a href="/crops">Crops</a>
      </Badge>,
    );
    const badge = screen.getByRole("link", { name: "Crops" });

    expect(badge).toHaveProperty("dataset.variant", "secondary");
    expect(badge.className).toContain("bg-secondary");
    expect(badge.className).toContain("ml-2");
  });

  it("exposes the variant class builder", () => {
    expect(badgeVariants({ variant: "outline" })).toContain("text-foreground");
  });
});
