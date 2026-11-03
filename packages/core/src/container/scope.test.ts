import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRequestScope, dispose } = vi.hoisted(() => ({
  createRequestScope: vi.fn(),
  dispose: vi.fn(),
}));

vi.mock("./container.ts", () => ({ createRequestScope }));

const { withScope } = await import("./scope.ts");

const cradle = { gardenService: { list: vi.fn() } };

beforeEach(() => {
  vi.clearAllMocks();
  createRequestScope.mockResolvedValue({ cradle, dispose });
});

describe("withScope", () => {
  it("runs the callback with a fresh scope and disposes it", async () => {
    const result = await withScope(async (scope) => {
      expect(scope).toBe(cradle);
      return "done";
    });

    expect(result).toBe("done");
    expect(createRequestScope).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it("disposes the scope even when the callback throws", async () => {
    await expect(
      withScope(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(dispose).toHaveBeenCalledOnce();
  });
});
