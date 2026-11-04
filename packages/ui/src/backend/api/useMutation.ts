"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ApiErrorBody, ApiResult, FieldErrors } from "./apiCall";

export interface UseMutationOptions<T> {
  /** Called with the response data after a successful run (e.g. `router.refresh()` in the app). */
  onSuccess?: (data: T) => void;
}

export interface UseMutationResult<I, T> {
  /** Runs the mutation; resolves to the `ApiResult` so callers can branch on it too. */
  run: (input: I) => Promise<ApiResult<T>>;
  isPending: boolean;
  error: ApiErrorBody | null;
  fieldErrors: FieldErrors;
  /** Clears `error` and `fieldErrors` (e.g. when a form is cancelled). */
  reset: () => void;
}

const NO_FIELD_ERRORS: FieldErrors = {};

/**
 * Wraps an `apiCall`-based function with pending and error state. Stays free
 * of `next/*`: the app passes navigation (refresh) in through `onSuccess`.
 */
export function useMutation<I, T>(
  fn: (input: I) => Promise<ApiResult<T>>,
  options: UseMutationOptions<T> = {},
): UseMutationResult<I, T> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<ApiErrorBody | null>(null);
  const isMountedRef = useRef(false);
  const fnRef = useRef(fn);
  const onSuccessRef = useRef(options.onSuccess);

  useEffect(() => {
    fnRef.current = fn;
    onSuccessRef.current = options.onSuccess;
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const run = useCallback(async (input: I): Promise<ApiResult<T>> => {
    setError(null);
    setIsPending(true);
    let result: ApiResult<T>;
    try {
      result = await fnRef.current(input);
    } finally {
      if (isMountedRef.current) setIsPending(false);
    }
    // The write happened even if the component is gone, so onSuccess still runs.
    if (result.ok) onSuccessRef.current?.(result.data);
    else if (isMountedRef.current) setError(result.error);
    return result;
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { run, isPending, error, fieldErrors: error?.fieldErrors ?? NO_FIELD_ERRORS, reset };
}
