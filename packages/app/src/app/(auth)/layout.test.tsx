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
    expect(html).toMatch(/<main[^>]*><div[^>]*bg-card[^>]*><span[^>]*>.*?<\/span><p>child<\/p><\/div><\/main>/);
  });

  it("sets the form in a green square-foot bed with the tagline and highlights", () => {
    const html = renderToStaticMarkup(
      <AuthLayout>
        <p>child</p>
      </AuthLayout>,
    );

    expect(html).toMatch(/<body class="accent-brand [^"]*bg-brand /);
    expect(html).toMatch(/<div aria-hidden="true" class="auth-bed">/);
    expect(html).toContain("Plant.AI");
    expect(html.split(AUTH_TAGLINE)).toHaveLength(2);
    for (const highlight of ["Lay out beds on a square-foot grid", "See which plants grow well together", "Get a planting calendar from your frost dates"]) {
      expect(html).toContain(highlight);
    }
    expect(html).not.toMatch(/<svg(?![^>]*aria-hidden="true")/);
  });

  it("plants the bed cells on their grid lines, pairs a shade lighter", () => {
    const html = renderToStaticMarkup(
      <AuthLayout>
        <p>child</p>
      </AuthLayout>,
    );

    expect(html).toContain('class="auth-bed-cell bg-brand-foreground/10" style="grid-column:1;grid-row:3"');
    expect(html).toContain('class="auth-bed-cell bg-brand-foreground/20" style="grid-column:3;grid-row:2"');
    expect(html).toContain('style="grid-column:-2;grid-row:2"');
  });

  it("keeps sign-in pages out of search engines", () => {
    expect(metadata.title).toEqual({ default: "Plant.AI", template: "%s · Plant.AI" });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
