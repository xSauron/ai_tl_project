import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { connection, checkDbConnection } = vi.hoisted(() => ({
  connection: vi.fn(),
  checkDbConnection: vi.fn(),
}));

vi.mock("next/server", () => ({ connection }));
vi.mock("@plantai/core", () => ({ checkDbConnection }));

const { default: AdminDashboardPage } = await import("./page");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminDashboardPage", () => {
  it("shows system status only, with no user data or garden management", async () => {
    checkDbConnection.mockResolvedValue({ ok: true });

    const html = renderToStaticMarkup(await AdminDashboardPage());

    expect(html).toContain("Dashboard");
    expect(html).toContain('data-slot="card-title"');
    expect(html).not.toContain("/admin/gardens");
    expect(html).not.toContain("Manage gardens");
  });

  it("opts into request-time rendering before checking the database", async () => {
    checkDbConnection.mockResolvedValue({ ok: true });

    await AdminDashboardPage();

    expect(connection).toHaveBeenCalledOnce();
    expect(connection.mock.invocationCallOrder[0]).toBeLessThan(
      checkDbConnection.mock.invocationCallOrder[0]!,
    );
  });

  it("shows the database as connected", async () => {
    checkDbConnection.mockResolvedValue({ ok: true });

    const html = renderToStaticMarkup(await AdminDashboardPage());

    expect(html).toContain("System status");
    expect(html).toContain("Connected");
  });

  it("shows the database as unavailable with the failure reason", async () => {
    checkDbConnection.mockResolvedValue({ ok: false, reason: "connection refused" });

    const html = renderToStaticMarkup(await AdminDashboardPage());

    expect(html).toContain("Unavailable");
    expect(html).toContain("connection refused");
  });
});
