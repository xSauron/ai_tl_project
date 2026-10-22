import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import DesignSystemNotBuiltPage from "./page";

describe("DesignSystemNotBuiltPage", () => {
  it("explains the build command and links back home", () => {
    const html = renderToStaticMarkup(<DesignSystemNotBuiltPage />);
    expect(html).toContain("npm run design-system:build");
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>[\s\S]*Plant\.AI/);
  });
});
