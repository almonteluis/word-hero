import { describe, it, expect } from "vitest";
import { getWordBank, SUPPORTED_LANGS, LANG_LABELS } from "./index";

describe("getWordBank", () => {
  it("returns English word bank by default", () => {
    const bank = getWordBank();
    expect(bank.WORD_GROUPS).toBeDefined();
    expect(bank.ALL_WORDS.length).toBeGreaterThan(0);
    expect(bank.GROUP_NAMES.length).toBe(15);
  });

  it("returns English word bank when lang is 'en'", () => {
    const bank = getWordBank("en");
    expect(bank.GROUP_NAMES[0]).toBe("Group 1 – Most Common");
    expect(bank.ALL_WORDS).toContain("the");
    expect(bank.ALL_WORDS).toContain("and");
  });

  it("returns Spanish word bank when lang is 'es'", () => {
    const bank = getWordBank("es");
    expect(bank.GROUP_NAMES[0]).toBe("Grupo 1 – Palabras Comunes");
    expect(bank.ALL_WORDS).toContain("el");
    expect(bank.ALL_WORDS).toContain("la");
  });

  it("falls back to English for unknown language", () => {
    const bank = getWordBank("fr");
    expect(bank.GROUP_NAMES[0]).toBe("Group 1 – Most Common");
    expect(bank.ALL_WORDS).toContain("the");
  });

  it("falls back to English for null/undefined", () => {
    const bank = getWordBank(null);
    expect(bank.ALL_WORDS).toContain("the");
  });
});

describe("English word bank integrity", () => {
  const en = getWordBank("en");

  it("has 15 groups", () => {
    expect(en.GROUP_NAMES.length).toBe(15);
  });

  it("has ~30 words per group", () => {
    for (const name of en.GROUP_NAMES) {
      const words = en.WORD_GROUPS[name];
      expect(words.length).toBeGreaterThanOrEqual(28);
      expect(words.length).toBeLessThanOrEqual(35);
    }
  });

  it("ALL_WORDS contains no duplicates", () => {
    const unique = new Set(en.ALL_WORDS);
    expect(unique.size).toBe(en.ALL_WORDS.length);
  });

  it("every word is lowercase except 'I'", () => {
    for (const w of en.ALL_WORDS) {
      if (w === "I") continue;
      expect(w).toBe(w.toLowerCase());
    }
  });

  it("GROUP_NAMES matches WORD_GROUPS keys", () => {
    const keys = Object.keys(en.WORD_GROUPS);
    expect(keys).toEqual(en.GROUP_NAMES);
  });
});

describe("Spanish word bank integrity", () => {
  const es = getWordBank("es");

  it("has 15 groups", () => {
    expect(es.GROUP_NAMES.length).toBe(15);
  });

  it("ALL_WORDS contains word strings (extracted from objects)", () => {
    expect(es.ALL_WORDS).toContain("el");
    expect(es.ALL_WORDS).toContain("la");
    // Accented words are present
    expect(es.ALL_WORDS).toContain("él");
    expect(es.ALL_WORDS).toContain("ella");
  });

  it("ALL_WORDS contains no duplicates", () => {
    const unique = new Set(es.ALL_WORDS);
    expect(unique.size).toBe(es.ALL_WORDS.length);
  });

  it("WORD_GROUPS entries are objects with word and en fields", () => {
    for (const name of es.GROUP_NAMES) {
      for (const entry of es.WORD_GROUPS[name]) {
        expect(entry).toHaveProperty("word");
        expect(entry).toHaveProperty("en");
        expect(typeof entry.word).toBe("string");
        expect(typeof entry.en).toBe("string");
      }
    }
  });

  it("GROUP_NAMES matches WORD_GROUPS keys", () => {
    const keys = Object.keys(es.WORD_GROUPS);
    expect(keys).toEqual(es.GROUP_NAMES);
  });
});

describe("SUPPORTED_LANGS and LANG_LABELS", () => {
  it("has correct supported languages", () => {
    expect(SUPPORTED_LANGS).toEqual(["en", "es"]);
  });

  it("has labels for all supported languages", () => {
    for (const lang of SUPPORTED_LANGS) {
      expect(LANG_LABELS[lang]).toBeDefined();
      expect(typeof LANG_LABELS[lang]).toBe("string");
    }
  });
});
