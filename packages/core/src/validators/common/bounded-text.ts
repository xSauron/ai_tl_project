import { z } from "zod";

export const DEFAULT_MIN_TEXT_LENGTH = 1;
export const NOT_TEXT_MESSAGE = "Must be text";
export const EMPTY_TEXT_MESSAGE = "Must not be empty";

export const tooShortMessage = (min: number) => `Must be at least ${min} characters`;
export const tooLongMessage = (max: number) => `Must be at most ${max} characters`;

export interface BoundedTextOptions {
  /** Minimum length after trimming. Defaults to 1, so whitespace-only input fails. */
  min?: number;
}

const assertBounds = (min: number, max: number) => {
  if (!Number.isInteger(max) || max < 1) {
    throw new RangeError(`boundedText: max must be a positive integer, got ${max}`);
  }
  if (!Number.isInteger(min) || min < 0 || min > max) {
    throw new RangeError(`boundedText: min must be an integer in [0, ${max}], got ${min}`);
  }
};

/**
 * A trimmed string of `min`–`max` characters (lengths count the trimmed
 * value). Every free-text field goes through this so no input is unbounded.
 */
export const boundedText = (max: number, { min = DEFAULT_MIN_TEXT_LENGTH }: BoundedTextOptions = {}) => {
  assertBounds(min, max);
  const minMessage = min === DEFAULT_MIN_TEXT_LENGTH ? EMPTY_TEXT_MESSAGE : tooShortMessage(min);
  return z
    .string({ error: NOT_TEXT_MESSAGE })
    .trim()
    .min(min, { error: minMessage })
    .max(max, { error: tooLongMessage(max) });
};
