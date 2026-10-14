import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOrm } = vi.hoisted(() => ({ getOrm: vi.fn() }));

vi.mock("../db/orm.ts", () => ({ getOrm }));

function fakeOrm() {
  let forks = 0;
  return { em: { fork: vi.fn(() => ({ fork: ++forks })) } };
}

async function loadContainerModule() {
  vi.resetModules();
  const [container, { GardenService }] = await Promise.all([
    import("./container.ts"),
    import("../modules/gardens/garden.service.ts"),
  ]);
  return { ...container, GardenService };
}

beforeEach(() => {
  getOrm.mockReset();
});

describe("getContainer", () => {
  it("registers the ORM as a singleton and caches the container", async () => {
    const orm = fakeOrm();
    getOrm.mockResolvedValue(orm);
    const { getContainer } = await loadContainerModule();

    const container = await getContainer();

    expect(container.cradle.orm).toBe(orm);
    await expect(getContainer()).resolves.toBe(container);
    expect(getOrm).toHaveBeenCalledOnce();
  });

  it("does not cache a failed build", async () => {
    getOrm.mockRejectedValueOnce(new Error("db down")).mockResolvedValueOnce(fakeOrm());
    const { getContainer } = await loadContainerModule();

    await expect(getContainer()).rejects.toThrow("db down");
    await expect(getContainer()).resolves.toBeDefined();
  });
});

describe("createRequestScope", () => {
  it("gives every scope its own forked EntityManager and scoped services", async () => {
    getOrm.mockResolvedValue(fakeOrm());
    const { createRequestScope, GardenService } = await loadContainerModule();

    const first = await createRequestScope();
    const second = await createRequestScope();

    expect(first.cradle.em).toEqual({ fork: 1 });
    expect(second.cradle.em).toEqual({ fork: 2 });
    expect(first.cradle.gardenService).toBeInstanceOf(GardenService);
    expect(first.cradle.gardenService).toBe(first.cradle.gardenService);
    expect(first.cradle.gardenService).not.toBe(second.cradle.gardenService);
  });
});

describe("awilix module globbing", () => {
  // Root package.json overrides awilix's fast-glob with tools/fast-glob-disabled (#6).
  it("is disabled, so dependencies must be registered explicitly", async () => {
    const { createContainer, listModules } = await import("awilix");

    expect(() => listModules("*.ts")).toThrow("awilix loadModules is disabled");
    expect(() => createContainer().loadModules(["*.ts"])).toThrow("awilix loadModules is disabled");
  });
});
