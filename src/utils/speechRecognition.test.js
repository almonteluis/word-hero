import { describe, it, expect } from "vitest";
import { wordMatch } from "../utils/speechRecognition";

// ─── English word matching ──────────────────────────────────

describe("wordMatch", () => {
  it("matches exact word", () => {
    expect(wordMatch("the", "the")).toBe(true);
  });

  it("matches case-insensitive", () => {
    expect(wordMatch("THE", "the")).toBe(true);
    expect(wordMatch("The", "the")).toBe(true);
  });

  it("matches from alternatives (pipe-separated)", () => {
    expect(wordMatch("duh|the|da", "the")).toBe(true);
  });

  it("does not match completely wrong word", () => {
    expect(wordMatch("elephant", "the")).toBe(false);
  });

  it("does not fuzzy-match short words (<=3 chars)", () => {
    // Short words require exact match to avoid false positives
    expect(wordMatch("at", "it")).toBe(false);
    expect(wordMatch("am", "an")).toBe(false);
  });

  it("exact-matches short words", () => {
    expect(wordMatch("the", "the")).toBe(true);
    expect(wordMatch("it", "it")).toBe(true);
  });

  it("matches when alternative contains the target", () => {
    expect(wordMatch("they're|there", "there")).toBe(true);
  });

  it("matches when target contains the heard word (with length check)", () => {
    // "through" contains "throug" which is >= 80% of "through"
    expect(wordMatch("throug", "through")).toBe(true);
  });

  it("strips non-alpha characters", () => {
    expect(wordMatch("th.e!", "the")).toBe(true);
  });

  it("returns false for empty inputs", () => {
    expect(wordMatch("", "the")).toBe(false);
    expect(wordMatch("the", "")).toBe(false);
  });
});

// ─── Spanish word matching (accent normalization) ───────────

describe("wordMatch with Spanish accents", () => {
  it("matches accented word without accent", () => {
    expect(wordMatch("ano", "año")).toBe(true);
  });

  it("matches exact accented word", () => {
    expect(wordMatch("año", "año")).toBe(true);
  });

  it("matches niño without tilde", () => {
    expect(wordMatch("nino", "niño")).toBe(true);
  });

  it("does not match wrong Spanish word", () => {
    expect(wordMatch("gato", "perro")).toBe(false);
  });

  it("matches Spanish word from alternatives", () => {
    expect(wordMatch("pero|perro|peo", "perro")).toBe(true);
  });

  it("handles mixed accent input", () => {
    expect(wordMatch("él", "el")).toBe(true); // accent stripped → "el" matches "el"
  });
});

// ─── Edge cases ─────────────────────────────────────────────

describe("wordMatch edge cases", () => {
  it("handles single character words", () => {
    expect(wordMatch("a", "a")).toBe(true);
    expect(wordMatch("b", "a")).toBe(false);
  });

  it("handles very long words", () => {
    expect(wordMatch("supercalifragilistic", "supercalifragilistic")).toBe(true);
  });

  it("handles word with numbers", () => {
    expect(wordMatch("abc123", "abc")).toBe(true); // numbers stripped
  });

  it("handles all non-alpha input", () => {
    expect(wordMatch("123!@#", "hello")).toBe(false);
  });
});
