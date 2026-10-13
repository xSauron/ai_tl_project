import { beforeEach, describe, expect, it, vi } from "vitest";

const { init } = vi.hoisted(() => ({ init: vi.fn() }));

vi.mock("@mikro-orm/postgresql", () => ({ MikroORM: { init } }));
vi.mock("./config.ts", () => ({ createOrmConfig: () => ({ marker: "config" }) }));

async function loadOrmModule() {
  vi.resetModules();
  return import("./orm.ts");
}

beforeEach(() => {
  init.mockReset();
});

describe("getOrm", () => {
  it("initialises MikroORM once with the shared config and caches it", async () => {
    const orm = { close: vi.fn() };
    init.mockResolvedValue(orm);
    const { getOrm } = await loadOrmModule();

    await expect(getOrm()).resolves.toBe(orm);
    await expect(getOrm()).resolves.toBe(orm);
    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith({ marker: "config" });
  });

  it("does not cache a failed initialisation", async () => {
    const orm = { close: vi.fn() };
    init.mockRejectedValueOnce(new Error("db down")).mockResolvedValueOnce(orm);
    const { getOrm } = await loadOrmModule();

    await expect(getOrm()).rejects.toThrow("db down");
    await expect(getOrm()).resolves.toBe(orm);
    expect(init).toHaveBeenCalledTimes(2);
  });
});

describe("closeOrm", () => {
  it("closes the cached ORM and forgets it", async () => {
    const first = { close: vi.fn() };
    const second = { close: vi.fn() };
    init.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const { getOrm, closeOrm } = await loadOrmModule();

    await getOrm();
    await closeOrm();

    expect(first.close).toHaveBeenCalledOnce();
    await expect(getOrm()).resolves.toBe(second);
  });

  it("is a no-op when no ORM was created", async () => {
    const { closeOrm } = await loadOrmModule();

    await expect(closeOrm()).resolves.toBeUndefined();
    expect(init).not.toHaveBeenCalled();
  });
});
