import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the hero, feature cards and the admin link", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Grow a smarter garden.");
    expect(html).toContain("Plan your beds");
    expect(html).toContain("Companion planting");
    expect(html).toContain("AI growing advice");
    expect(html).toMatch(/<a[^>]*href="\/admin"/);
  });
});
