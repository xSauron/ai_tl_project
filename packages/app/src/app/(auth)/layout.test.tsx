import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font-geist-test" }) }));

const { default: AuthLayout, metadata } = await import("./layout");

describe("AuthLayout", () => {
  it("renders its own root document with the main landmark", () => {
    const html = renderToStaticMarkup(
      <AuthLayout>
        <p>child</p>
      </AuthLayout>,
    );

    expect(html).toMatch(/^<html lang="en" class="font-geist-test">/);
    expect(html).toMatch(/<main[^>]*><p>child<\/p><\/main>/);
  });

  it("keeps sign-in pages out of search engines", () => {
    expect(metadata.title).toEqual({ default: "Plant.AI", template: "%s · Plant.AI" });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
