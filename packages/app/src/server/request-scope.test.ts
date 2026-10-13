import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRequestScope, dispose } = vi.hoisted(() => ({
  createRequestScope: vi.fn(),
  dispose: vi.fn(),
}));

vi.mock("@plant-ai/core", () => ({ createRequestScope }));

const { withRequestScope } = await import("./request-scope");

const cradle = { gardenService: { list: vi.fn() } };

beforeEach(() => {
  vi.clearAllMocks();
  createRequestScope.mockResolvedValue({ cradle, dispose });
});

describe("withRequestScope", () => {
  it("runs the callback with a fresh scope and disposes it", async () => {
    const result = await withRequestScope(async (scope) => {
      expect(scope).toBe(cradle);
      return "done";
    });

    expect(result).toBe("done");
    expect(createRequestScope).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it("disposes the scope even when the callback throws", async () => {
    await expect(
      withRequestScope(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(dispose).toHaveBeenCalledOnce();
  });
});
