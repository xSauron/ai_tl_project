import { describe, expect, it } from "vitest";

import { useBrowser } from "./support/use-browser.ts";

const browser = useBrowser("home");

const HERO_HEADING = "Plan your vegetable garden, one square foot at a time.";

describe("Home page", () => {
  it("renders the public landing page", async () => {
    await browser().open("/");

    expect(await browser().title()).toBe("Plant.AI");
    expect(await browser().headingText(HERO_HEADING)).toBe(HERO_HEADING);
    const main = await browser().text("main");
    for (const feature of [
      "Square-foot bed planner",
      "Companion planting hints",
      "Planting calendar",
      "AI layout suggestions",
    ]) {
      expect(main).toContain(feature);
    }
    expect(await browser().text("footer")).toContain("A square-foot vegetable garden planner.");
  });

  it("links the 'Plan your garden' CTA to /register", async () => {
    await browser().open("/");
    await browser().clickRole("link", "Plan your garden");
    await browser().waitForPath("/register");

    expect(await browser().pathname()).toBe("/register");
  });

  it("navigates to the admin panel", async () => {
    await browser().open("/");
    await browser().clickRole("link", "Admin →");
    await browser().waitForPath("/admin");

    expect(await browser().pathname()).toBe("/admin");
    expect(await browser().headingText("Dashboard")).toBe("Dashboard");
  });
});
