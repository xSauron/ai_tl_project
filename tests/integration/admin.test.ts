import { describe, expect, it } from "vitest";

import { useBrowser } from "./support/use-browser.ts";

const browser = useBrowser("admin");

describe("Admin panel", () => {
  it("renders the dashboard with system status only", async () => {
    await browser().open("/admin");

    // The layout's title template only applies to child segments.
    expect(await browser().title()).toBe("Admin");
    expect(await browser().headingText("Dashboard")).toBe("Dashboard");
    const sidebar = await browser().text("aside");
    expect(sidebar).toContain("Dashboard");
    expect(sidebar).not.toContain("Gardens");
    expect(await browser().text("main")).toContain("System status");
  });

  it("no longer serves the unauthenticated garden list", async () => {
    await browser().open("/admin/gardens");

    expect(await browser().text("body")).toContain("404");
  });
});
