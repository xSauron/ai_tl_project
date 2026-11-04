import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ApiResult } from "./apiCall";
import { useMutation } from "./useMutation";

type Garden = { id: string; name: string };

const SUCCESS: ApiResult<Garden> = { ok: true, data: { id: "g1", name: "Back yard" } };
const VALIDATION_ERROR = {
  code: "VALIDATION_FAILED",
  message: "Check the highlighted fields.",
  fieldErrors: { name: ["Required"] },
};
const FAILURE: ApiResult<Garden> = { ok: false, status: 422, error: VALIDATION_ERROR };
const NOT_FOUND: ApiResult<Garden> = { ok: false, status: 404, error: { code: "NOT_FOUND", message: "Not found." } };

/** A promise the test resolves by hand, to observe the pending state. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useMutation", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useMutation(vi.fn<(input: string) => Promise<ApiResult<Garden>>>()));

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
  });

  it("toggles isPending, passes the input, returns the result and calls onSuccess with the data", async () => {
    const pending = deferred<ApiResult<Garden>>();
    const fn = vi.fn<(input: { name: string }) => Promise<ApiResult<Garden>>>(() => pending.promise);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useMutation(fn, { onSuccess }));

    let runPromise!: Promise<ApiResult<Garden>>;
    act(() => {
      runPromise = result.current.run({ name: "Back yard" });
    });
    expect(result.current.isPending).toBe(true);
    expect(fn).toHaveBeenCalledWith({ name: "Back yard" });

    await act(async () => {
      pending.resolve(SUCCESS);
      await runPromise;
    });

    await expect(runPromise).resolves.toBe(SUCCESS);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(SUCCESS.ok && SUCCESS.data);
  });

  it("exposes error and fieldErrors on failure without calling onSuccess", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useMutation(async () => FAILURE, { onSuccess }));

    let returned: ApiResult<Garden> | undefined;
    await act(async () => {
      returned = await result.current.run(undefined);
    });

    expect(returned).toBe(FAILURE);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toEqual(VALIDATION_ERROR);
    expect(result.current.fieldErrors).toEqual({ name: ["Required"] });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("returns empty fieldErrors for an error without them", async () => {
    const { result } = renderHook(() => useMutation(async () => NOT_FOUND));

    await act(async () => {
      await result.current.run(undefined);
    });

    expect(result.current.error?.code).toBe("NOT_FOUND");
    expect(result.current.fieldErrors).toEqual({});
  });

  it("clears the previous error when a run starts and after it succeeds", async () => {
    const pending = deferred<ApiResult<Garden>>();
    const fn = vi.fn<(input: number) => Promise<ApiResult<Garden>>>().mockResolvedValueOnce(FAILURE);
    fn.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useMutation(fn));

    await act(async () => {
      await result.current.run(1);
    });
    expect(result.current.error).not.toBeNull();

    let runPromise!: Promise<ApiResult<Garden>>;
    act(() => {
      runPromise = result.current.run(2);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});

    await act(async () => {
      pending.resolve(SUCCESS);
      await runPromise;
    });
    expect(result.current.error).toBeNull();
  });

  it("reset clears error and fieldErrors", async () => {
    const { result } = renderHook(() => useMutation(async () => FAILURE));
    await act(async () => {
      await result.current.run(undefined);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
  });

  it("uses the latest fn and onSuccess passed on re-render", async () => {
    type Run = () => Promise<ApiResult<Garden>>;
    const first = vi.fn<Run>(async () => FAILURE);
    const second = vi.fn<Run>(async () => SUCCESS);
    const onSuccess = vi.fn();
    const { result, rerender } = renderHook(({ fn }) => useMutation(fn, { onSuccess }), {
      initialProps: { fn: first },
    });

    rerender({ fn: second });
    await act(async () => {
      await result.current.run(undefined);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("resets isPending and rethrows when fn throws", async () => {
    const { result } = renderHook(() => useMutation(async (): Promise<ApiResult<Garden>> => Promise.reject(new Error("bug"))));

    await act(async () => {
      await expect(result.current.run(undefined)).rejects.toThrow("bug");
    });

    expect(result.current.isPending).toBe(false);
  });

  it.each([
    ["success", SUCCESS],
    ["failure", FAILURE],
  ])("doesn't update state after unmount (%s), but still returns the result", async (_label, outcome) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const pending = deferred<ApiResult<Garden>>();
    const onSuccess = vi.fn();
    const { result, unmount } = renderHook(() => useMutation(() => pending.promise, { onSuccess }));

    let runPromise!: Promise<ApiResult<Garden>>;
    act(() => {
      runPromise = result.current.run(undefined);
    });
    const lastRendered = result.current;
    unmount();

    pending.resolve(outcome);
    await expect(runPromise).resolves.toBe(outcome);

    await waitFor(() => {
      expect(result.current).toBe(lastRendered);
    });
    expect(result.current.isPending).toBe(true);
    expect(result.current.error).toBeNull();
    // The write happened, so the caller's onSuccess (e.g. a refresh) still runs.
    expect(onSuccess).toHaveBeenCalledTimes(outcome.ok ? 1 : 0);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
