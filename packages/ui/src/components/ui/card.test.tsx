import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card", () => {
  it("renders every slot with its data-slot and custom classes", () => {
    render(
      <Card className="max-w-md" data-testid="card">
        <CardHeader>
          <CardTitle>Gardens</CardTitle>
          <CardDescription>Manage gardens</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card").className).toContain("max-w-md");
    const slots = [
      ["Gardens", "card-title"],
      ["Manage gardens", "card-description"],
      ["Action", "card-action"],
      ["Body", "card-content"],
      ["Footer", "card-footer"],
    ] as const;
    for (const [text, slot] of slots) {
      expect(screen.getByText(text)).toHaveProperty("dataset.slot", slot);
    }
    expect(screen.getByText("Gardens").parentElement).toHaveProperty("dataset.slot", "card-header");
  });
});
