import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminDashboardPage from "./page";

describe("AdminDashboardPage", () => {
  it("links to garden management", () => {
    const html = renderToStaticMarkup(<AdminDashboardPage />);

    expect(html).toContain("Dashboard");
    expect(html).toContain('data-slot="card-title"');
    expect(html).toMatch(/<a[^>]*data-slot="button"[^>]*href="\/admin\/gardens"|<a[^>]*href="\/admin\/gardens"[^>]*data-slot="button"/);
    expect(html).toContain("Manage gardens");
  });
});
