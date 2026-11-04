import { describe, expect, it } from "vitest";

import {
  boundedText,
  DEFAULT_MIN_TEXT_LENGTH,
  EMPTY_TEXT_MESSAGE,
  NOT_TEXT_MESSAGE,
  tooLongMessage,
  tooShortMessage,
} from "./bounded-text.ts";

const MAX = 5;

const firstMessage = (schema: ReturnType<typeof boundedText>, value: unknown) =>
  schema.safeParse(value).error?.issues[0]?.message;

describe("boundedText", () => {
  it("defaults min to 1", () => {
    expect(DEFAULT_MIN_TEXT_LENGTH).toBe(1);
  });

  describe("with the default min", () => {
    const schema = boundedText(MAX);

    it.each([
      ["one char", "a", "a"],
      ["exactly max", "abcde", "abcde"],
      ["surrounding spaces trimmed", "  ab  ", "ab"],
      ["max after trimming", "  abcde\n\t", "abcde"],
      ["inner whitespace kept", "a  b", "a  b"],
      ["unicode letters", "żółw", "żółw"],
    ])("accepts %s", (_label, value, expected) => {
      expect(schema.parse(value)).toBe(expected);
    });

    it.each([
      ["empty string", "", EMPTY_TEXT_MESSAGE],
      ["spaces only", "   ", EMPTY_TEXT_MESSAGE],
      ["mixed whitespace only", " \n\t\r ", EMPTY_TEXT_MESSAGE],
      ["max + 1", "abcdef", tooLongMessage(MAX)],
      ["max + 1 inside whitespace", "  abcdef  ", tooLongMessage(MAX)],
    ])("rejects %s", (_label, value, message) => {
      expect(firstMessage(schema, value)).toBe(message);
    });

    it.each([
      ["number", 12],
      ["null", null],
      ["undefined", undefined],
      ["boolean", true],
      ["array", ["a"]],
      ["object", { toString: () => "a" }],
    ])("rejects a %s as not text", (_label, value) => {
      expect(firstMessage(schema, value)).toBe(NOT_TEXT_MESSAGE);
    });
  });

  describe("with a custom min", () => {
    const schema = boundedText(MAX, { min: 3 });

    it.each([
      ["exactly min", "abc"],
      ["exactly max", "abcde"],
    ])("accepts %s", (_label, value) => {
      expect(schema.parse(value)).toBe(value);
    });

    it.each([
      ["min - 1", "ab", tooShortMessage(3)],
      ["min - 1 after trimming", "  ab  ", tooShortMessage(3)],
      ["whitespace only", "     ", tooShortMessage(3)],
      ["max + 1", "abcdef", tooLongMessage(MAX)],
    ])("rejects %s", (_label, value, message) => {
      expect(firstMessage(schema, value)).toBe(message);
    });
  });

  describe("with min 0", () => {
    const schema = boundedText(MAX, { min: 0 });

    it.each([
      ["empty string", "", ""],
      ["whitespace only, trimmed to empty", "   ", ""],
      ["exactly max", "abcde", "abcde"],
    ])("accepts %s", (_label, value, expected) => {
      expect(schema.parse(value)).toBe(expected);
    });

    it("still rejects max + 1", () => {
      expect(firstMessage(schema, "abcdef")).toBe(tooLongMessage(MAX));
    });
  });

  it("accepts min equal to max", () => {
    expect(boundedText(2, { min: 2 }).parse(" ab ")).toBe("ab");
  });

  it.each([
    ["max 0", 0, undefined],
    ["negative max", -1, undefined],
    ["fractional max", 2.5, undefined],
    ["NaN max", Number.NaN, undefined],
    ["negative min", MAX, -1],
    ["fractional min", MAX, 1.5],
    ["min above max", MAX, MAX + 1],
  ])("throws on %s", (_label, max, min) => {
    expect(() => boundedText(max, { min })).toThrow(RangeError);
  });

  it.each([
    [tooShortMessage, 3, "Must be at least 3 characters"],
    [tooLongMessage, 120, "Must be at most 120 characters"],
  ])("formats %o(%i)", (format, n, message) => {
    expect(format(n)).toBe(message);
  });
});
