import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font-geist-test" }) }));

const { default: AdminLayout, metadata } = await import("./layout");

describe("AdminLayout", () => {
  it("renders the admin shell with navigation and children", () => {
    const html = renderToStaticMarkup(
      <AdminLayout>
        <p>child</p>
      </AdminLayout>,
    );

    expect(html).toMatch(/^<html lang="en" class="font-geist-test">/);
    expect(html).toContain("bg-background");
    expect(html).toMatch(/<a[^>]*href="\/admin"[^>]*>Dashboard<\/a>/);
    expect(html).toMatch(/<a[^>]*href="\/admin\/gardens"[^>]*>Gardens<\/a>/);
    expect(html).toContain('data-slot="separator"');
    expect(html).toContain("<p>child</p>");
  });

  it("keeps admin pages out of search engines", () => {
    expect(metadata.title).toEqual({ default: "Admin", template: "%s · Plant.AI Admin" });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
