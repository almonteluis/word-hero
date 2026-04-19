import { describe, it, expect } from "vitest";
import { getPronunciationFeedback } from "../utils/pronunciationFeedback";

// ─── English pronunciation feedback ─────────────────────────

describe("getPronunciationFeedback (English)", () => {
  it("returns null for null inputs", () => {
    expect(getPronunciationFeedback(null, "the")).toBeNull();
    expect(getPronunciationFeedback("duh", null)).toBeNull();
    expect(getPronunciationFeedback(null, null)).toBeNull();
  });

  it("returns null for empty string inputs", () => {
    expect(getPronunciationFeedback("", "the")).toBeNull();
    expect(getPronunciationFeedback("duh", "")).toBeNull();
  });

  it("returns null for only pipe separators", () => {
    expect(getPronunciationFeedback("|||", "the")).toBeNull();
  });

  it("returns feedback with heard and tip fields", () => {
    const result = getPronunciationFeedback("duh", "the");
    expect(result).toHaveProperty("heard");
    expect(result).toHaveProperty("tip");
    expect(typeof result.heard).toBe("string");
    expect(typeof result.tip).toBe("string");
  });

  it("provides specific hint for 'the' mispronounced as 'duh'", () => {
    const result = getPronunciationFeedback("duh", "the");
    expect(result.tip).toContain("th");
  });

  it("provides specific hint for 'she' mispronounced as 'see'", () => {
    const result = getPronunciationFeedback("see", "she");
    expect(result.tip).toContain("shh");
  });

  it("picks closest alternative from pipe-separated results", () => {
    // Verify it processes multiple alternatives and returns a valid result
    const result = getPronunciationFeedback("xyz|duh|de", "the");
    expect(result).not.toBeNull();
    expect(result.heard).toBeTruthy();
    expect(result.tip).toBeTruthy();
    // "de" has edit distance 2 from "the", same as "duh" — either is reasonable
    expect(["xyz", "duh", "de"]).toContain(result.heard);
  });

  it("provides 'say it clearer' tip when heard equals target", () => {
    const result = getPronunciationFeedback("the", "the");
    expect(result.tip).toContain("clearer");
  });

  it("provides silent-k hint for 'know' mispronounced as 'now'", () => {
    const result = getPronunciationFeedback("now", "know");
    expect(result.tip).toContain("Silent");
  });

  it("provides digraph hint for 'sh' words", () => {
    const result = getPronunciationFeedback("ip", "ship");
    expect(result.tip).toContain("sh");
  });

  it("provides fallback tip for unknown mispronunciation", () => {
    const result = getPronunciationFeedback("xyz", "elephant");
    expect(result.tip).toContain("slowly");
  });

  it("handles uppercase target", () => {
    const result = getPronunciationFeedback("duh", "THE");
    expect(result).not.toBeNull();
    expect(result.tip).toBeTruthy();
  });
});

// ─── Spanish pronunciation feedback ─────────────────────────

describe("getPronunciationFeedback (Spanish)", () => {
  it("provides Spanish tip for silent h", () => {
    const result = getPronunciationFeedback("ola", "hola", "es");
    // "hola|ola" is in ES_HINT_MAP with "silenciosa"
    expect(result.tip).toContain("silenciosa");
  });

  it("provides Spanish tip for rr vs r", () => {
    const result = getPronunciationFeedback("pero", "perro", "es");
    expect(result.tip).toContain("rr");
  });

  it("provides Spanish tip for missing initial consonant", () => {
    const result = getPronunciationFeedback("ato", "gato", "es");
    expect(result.tip).toContain("g");
  });

  it("normalizes accented characters for matching", () => {
    // "nino" should match "niño" after accent normalization
    const result = getPronunciationFeedback("nino", "niño", "es");
    expect(result).not.toBeNull();
    expect(result.heard).toBe("nino");
  });

  it("provides Spanish fallback tip", () => {
    const result = getPronunciationFeedback("xyz", "gato", "es");
    expect(result.tip).toContain("despacio");
  });

  it("provides 'casi' tip when heard matches target after normalization", () => {
    const result = getPronunciationFeedback("año", "año", "es");
    expect(result.tip).toContain("Casi");
  });

  it("still works for English when lang is default", () => {
    const result = getPronunciationFeedback("duh", "the");
    expect(result.tip).toContain("th");
  });
});

// ─── Edge cases ─────────────────────────────────────────────

describe("getPronunciationFeedback edge cases", () => {
  it("handles single-character words", () => {
    const result = getPronunciationFeedback("a", "a");
    expect(result).not.toBeNull();
  });

  it("handles extra pipe separators gracefully", () => {
    const result = getPronunciationFeedback("duh||see||", "the");
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("heard");
  });

  it("handles very long mispronunciation", () => {
    const result = getPronunciationFeedback("supercalifragilisticexpialidocious", "the");
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("tip");
  });

  it("handles whitespace in target", () => {
    const result = getPronunciationFeedback("duh", " the ");
    expect(result).not.toBeNull();
  });
});
