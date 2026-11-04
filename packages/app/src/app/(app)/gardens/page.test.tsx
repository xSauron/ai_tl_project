import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { connection, requireActor, withScope, list } = vi.hoisted(() => ({
  connection: vi.fn(),
  requireActor: vi.fn(),
  withScope: vi.fn(),
  list: vi.fn(),
}));

vi.mock("next/server", () => ({ connection }));
vi.mock("@/server/session", () => ({ requireActor }));
vi.mock("@plantai/core", () => ({ withScope }));
vi.mock("./gardens-panel", () => ({
  GardensPanel: ({ gardens }: { gardens: { name: string }[] }) => <ul>{gardens.map((g) => <li key={g.name}>{g.name}</li>)}</ul>,
}));

const { default: GardensPage, metadata } = await import("./page");

const ACTOR = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };

beforeEach(() => {
  vi.clearAllMocks();
  requireActor.mockResolvedValue(ACTOR);
  withScope.mockImplementation(async (fn: (cradle: unknown) => unknown) => fn({ gardenService: { list } }));
  list.mockResolvedValue([{ name: "Back yard" }]);
});

describe("GardensPage", () => {
  it("lists the signed-in actor's gardens", async () => {
    const html = renderToStaticMarkup(await GardensPage());

    expect(metadata.title).toBe("Gardens");
    expect(html).toBe("<ul><li>Back yard</li></ul>");
    expect(list).toHaveBeenCalledWith(ACTOR);
  });

  it("opts into request-time rendering, then checks the session before reading data", async () => {
    await GardensPage();

    expect(connection.mock.invocationCallOrder[0]).toBeLessThan(requireActor.mock.invocationCallOrder[0] ?? 0);
    expect(requireActor.mock.invocationCallOrder[0]).toBeLessThan(withScope.mock.invocationCallOrder[0] ?? 0);
  });

  it("reads nothing for a guest (requireActor redirects)", async () => {
    requireActor.mockRejectedValue(new Error("NEXT_REDIRECT:/login"));

    await expect(GardensPage()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(withScope).not.toHaveBeenCalled();
  });
});
