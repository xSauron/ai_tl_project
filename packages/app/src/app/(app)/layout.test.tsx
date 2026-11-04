import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font-geist-test" }) }));
vi.mock("./app-frame", () => ({ AppFrame: ({ children }: { children: React.ReactNode }) => <div data-frame="">{children}</div> }));

const { default: AppLayout, metadata } = await import("./layout");

describe("AppLayout", () => {
  it("renders its own root document around the app frame", () => {
    const html = renderToStaticMarkup(
      <AppLayout>
        <p>child</p>
      </AppLayout>,
    );

    expect(html).toMatch(/^<html lang="en" class="font-geist-test">/);
    expect(html).toContain('<div data-frame=""><p>child</p></div>');
  });

  it("puts the whole app in the brand-green accent", () => {
    const html = renderToStaticMarkup(
      <AppLayout>
        <p>child</p>
      </AppLayout>,
    );

    expect(html).toMatch(/<body class="accent-brand /);
  });

  it("keeps app pages out of search engines", () => {
    expect(metadata.title).toEqual({ default: "Plant.AI", template: "%s · Plant.AI" });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
