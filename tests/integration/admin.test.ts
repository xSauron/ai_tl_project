import { describe, expect, it } from "vitest";

import { useBrowser } from "./support/use-browser.ts";

const browser = useBrowser("admin");

describe("Admin panel", () => {
  it("renders the dashboard with navigation", async () => {
    await browser().open("/admin");

    // The layout's title template only applies to child segments.
    expect(await browser().title()).toBe("Admin");
    expect(await browser().headingText("Dashboard")).toBe("Dashboard");
    const sidebar = await browser().text("aside");
    expect(sidebar).toContain("Dashboard");
    expect(sidebar).toContain("Gardens");
  });

  it("opens garden management from the dashboard", async () => {
    await browser().open("/admin");
    await browser().clickRole("link", "Manage gardens");
    await browser().waitForPath("/admin/gardens");

    expect(await browser().title()).toBe("Gardens · Plant.AI Admin");
    expect(await browser().text("table")).toContain("No gardens yet.");
  });

  it("creates a garden that persists in PostgreSQL", async () => {
    await browser().open("/admin/gardens");
    await browser().fillLabel("Name", "Raised bed A");
    await browser().fillLabel("Description", "Tomatoes and basil");
    await browser().clickRole("button", "Create garden");
    await browser().waitForText("Raised bed A");

    await browser().reload();
    const table = await browser().text("table");
    expect(table).toContain("Raised bed A");
    expect(table).toContain("Tomatoes and basil");
    expect(table).not.toContain("No gardens yet.");
  });
});
