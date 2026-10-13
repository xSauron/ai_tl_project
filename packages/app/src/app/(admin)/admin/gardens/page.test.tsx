import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { connection, list } = vi.hoisted(() => ({ connection: vi.fn(), list: vi.fn() }));

vi.mock("next/server", () => ({ connection }));
vi.mock("@/server/request-scope", () => ({
  withRequestScope: (fn: (cradle: unknown) => unknown) => fn({ gardenService: { list } }),
}));
vi.mock("./actions", () => ({ createGardenAction: vi.fn() }));

const { default: GardensPage, metadata } = await import("./page");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GardensPage", () => {
  it("opts into request-time rendering before reading the database", async () => {
    list.mockResolvedValue([]);

    await GardensPage();

    expect(connection).toHaveBeenCalledOnce();
    expect(connection.mock.invocationCallOrder[0]).toBeLessThan(list.mock.invocationCallOrder[0]!);
  });

  it("shows the create form and an empty state", async () => {
    list.mockResolvedValue([]);

    const html = renderToStaticMarkup(await GardensPage());

    expect(html).toContain("New garden");
    expect(html).toMatch(/<input(?=[^>]*\bname="name")(?=[^>]*\brequired)[^>]*>/);
    expect(html).toContain("No gardens yet.");
  });

  it("lists gardens with their creation date", async () => {
    list.mockResolvedValue([
      { id: "g1", name: "Backyard", description: "Tomatoes", createdAt: new Date("2026-10-13T08:30:00Z") },
      { id: "g2", name: "Herb spiral", description: null, createdAt: new Date("2026-10-12T08:30:00Z") },
    ]);

    const html = renderToStaticMarkup(await GardensPage());

    expect(html).not.toContain("No gardens yet.");
    expect(html).toContain("Backyard");
    expect(html).toContain("Tomatoes");
    expect(html).toContain("Herb spiral");
    expect(html).toContain("13/10/2026");
  });

  it("sets the page title", () => {
    expect(metadata.title).toBe("Gardens");
  });
});
