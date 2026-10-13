import { describe, expect, it } from "vitest";

import { useBrowser } from "./support/use-browser.ts";

const browser = useBrowser("home");

describe("Home page", () => {
  it("renders the public landing page", async () => {
    await browser().open("/");

    expect(await browser().title()).toBe("Plant.AI");
    expect(await browser().headingText("Grow a smarter garden.")).toBe("Grow a smarter garden.");
    const main = await browser().text("main");
    for (const feature of ["Plan your beds", "Companion planting", "AI growing advice"]) {
      expect(main).toContain(feature);
    }
  });

  it("navigates to the admin panel", async () => {
    await browser().open("/");
    await browser().clickRole("link", "Admin →");
    await browser().waitForPath("/admin");

    expect(await browser().pathname()).toBe("/admin");
    expect(await browser().headingText("Dashboard")).toBe("Dashboard");
  });
});
