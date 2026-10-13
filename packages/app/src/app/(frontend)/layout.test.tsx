import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font-geist-test" }) }));

const { default: FrontendLayout, metadata } = await import("./layout");

describe("FrontendLayout", () => {
  it("renders the document shell with the brand font and children", () => {
    const html = renderToStaticMarkup(
      <FrontendLayout>
        <p>child</p>
      </FrontendLayout>,
    );

    expect(html).toMatch(/^<html lang="en" class="font-geist-test">/);
    expect(html).toContain("bg-soil-50");
    expect(html).toContain("<p>child</p>");
  });

  it("defines the public site metadata", () => {
    expect(metadata.title).toEqual({ default: "Plant.AI", template: "%s · Plant.AI" });
    expect(metadata.description).toContain("garden");
  });
});
