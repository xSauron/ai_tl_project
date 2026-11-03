import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font-geist-test" }) }));

const { AUTH_TAGLINE, default: AuthLayout, metadata } = await import("./layout");

describe("AuthLayout", () => {
  it("renders its own root document with the main landmark", () => {
    const html = renderToStaticMarkup(
      <AuthLayout>
        <p>child</p>
      </AuthLayout>,
    );

    expect(html).toMatch(/^<html lang="en" class="font-geist-test">/);
    expect(html).toMatch(/<main[^>]*><div[^>]*bg-card[^>]*><p>child<\/p><\/div><\/main>/);
  });

  it("frames the form with the brand panel, tagline and highlights, in green", () => {
    const html = renderToStaticMarkup(
      <AuthLayout>
        <p>child</p>
      </AuthLayout>,
    );

    expect(html).toMatch(/<body class="accent-brand [^"]*bg-brand-surface/);
    expect(html).toMatch(/<aside class="[^"]*bg-brand /);
    expect(html).toContain("Plant.AI");
    expect(html.split(AUTH_TAGLINE)).toHaveLength(3);
    for (const highlight of ["Lay out beds on a square-foot grid", "See which plants grow well together", "Get a planting calendar from your frost dates"]) {
      expect(html).toContain(highlight);
    }
    expect(html).not.toMatch(/<svg(?![^>]*aria-hidden="true")/);
  });

  it("keeps sign-in pages out of search engines", () => {
    expect(metadata.title).toEqual({ default: "Plant.AI", template: "%s · Plant.AI" });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
