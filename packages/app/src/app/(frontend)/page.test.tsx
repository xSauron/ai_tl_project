import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  const html = renderToStaticMarkup(<HomePage />);

  it("renders the hero with a 'Plan your garden' CTA to /register", () => {
    expect(html).toMatch(/<h1[^>]*>Plan your vegetable garden, one square foot at a time\.<\/h1>/);
    expect(html).toMatch(/<a[^>]*href="\/register"[^>]*>Plan your garden<\/a>/);
  });

  it("renders the four feature cards under a features heading", () => {
    expect(html).toMatch(/<h2[^>]*class="sr-only"[^>]*>Features<\/h2>/);
    for (const title of [
      "Square-foot bed planner",
      "Companion planting hints",
      "Planting calendar",
      "AI layout suggestions",
    ]) {
      expect(html).toContain(`>${title}</h3>`);
    }
  });

  it("renders the decorative 4 × 4 sample bed", () => {
    expect(html).toContain(
      'role="img" aria-label="Example 4 by 4 foot raised bed planted square by square"',
    );
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(16);
    expect(html).toContain("Example bed — 4 × 4 ft, illustrative only");
  });

  it("renders the admin link and the footer", () => {
    expect(html).toMatch(/<a[^>]*href="\/admin"/);
    expect(html).toMatch(/<footer[^>]*>[\s\S]*A square-foot vegetable garden planner\.[\s\S]*<\/footer>/);
  });
});
