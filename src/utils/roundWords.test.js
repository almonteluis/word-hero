import { describe, it, expect } from "vitest";
import { getWordBank } from "../data/words/index";
import {
  selectPracticeWords,
  selectStrugglingWords,
  bucketize,
  interleaveByGroup,
} from "../utils/roundWords";

// ─── bucketize ──────────────────────────────────────────────

describe("bucketize", () => {
  const emptyProgress = {
    wordStats: {},
    mastered: {},
    learning: {},
  };

  it("classifies all words as fresh for empty progress (English)", () => {
    const buckets = bucketize(emptyProgress, "en");
    expect(buckets.fresh.length).toBeGreaterThan(0);
    expect(buckets.review).toHaveLength(0);
    expect(buckets.struggling).toHaveLength(0);
    expect(buckets.learningWords).toHaveLength(0);
    expect(buckets.masteredFresh).toHaveLength(0);
  });

  it("classifies all words as fresh for empty progress (Spanish)", () => {
    const buckets = bucketize(emptyProgress, "es");
    expect(buckets.fresh.length).toBeGreaterThan(0);
    expect(buckets.review).toHaveLength(0);
    expect(buckets.struggling).toHaveLength(0);
    expect(buckets.learningWords).toHaveLength(0);
    expect(buckets.masteredFresh).toHaveLength(0);
  });

  it("classifies mastered words into masteredFresh", () => {
    const { ALL_WORDS } = getWordBank("en");
    const progress = {
      wordStats: {},
      mastered: { [ALL_WORDS[0]]: Date.now() },
      learning: {},
    };
    const buckets = bucketize(progress, "en");
    expect(buckets.masteredFresh).toContain(ALL_WORDS[0]);
  });

  it("classifies mastered words into review if lastSeen is old", () => {
    const { ALL_WORDS } = getWordBank("en");
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
    const progress = {
      wordStats: {},
      mastered: { [ALL_WORDS[0]]: sixDaysAgo },
      learning: {},
    };
    const buckets = bucketize(progress, "en");
    expect(buckets.review).toContain(ALL_WORDS[0]);
  });

  it("classifies struggling words (low accuracy)", () => {
    const { ALL_WORDS } = getWordBank("en");
    const word = ALL_WORDS[0];
    const progress = {
      wordStats: { [word]: { attempts: 5, correct: 1, lastSeen: Date.now() } },
      mastered: {},
      learning: {},
    };
    const buckets = bucketize(progress, "en");
    expect(buckets.struggling).toContain(word);
  });

  it("classifies learning words", () => {
    const { ALL_WORDS } = getWordBank("en");
    const word = ALL_WORDS[0];
    const progress = {
      wordStats: { [word]: { attempts: 1, correct: 0, lastSeen: Date.now() } },
      mastered: {},
      learning: { [word]: true },
    };
    const buckets = bucketize(progress, "en");
    expect(buckets.learningWords).toContain(word);
  });

  it("does not mix English and Spanish word progress", () => {
    const progress = {
      wordStats: { the: { attempts: 5, correct: 5, lastSeen: Date.now() } },
      mastered: { the: Date.now() },
      learning: {},
    };
    const esBuckets = bucketize(progress, "es");
    expect(esBuckets.masteredFresh).not.toContain("the");
    expect(esBuckets.fresh.length).toBeGreaterThan(0);
  });
});

// ─── selectPracticeWords ────────────────────────────────────

describe("selectPracticeWords", () => {
  const emptyProgress = {
    wordStats: {},
    mastered: {},
    learning: {},
  };

  it("returns 10 words by default", () => {
    const words = selectPracticeWords(emptyProgress, undefined, "en");
    expect(words).toHaveLength(10);
  });

  it("returns requested count", () => {
    const words = selectPracticeWords(emptyProgress, 5, "en");
    expect(words).toHaveLength(5);
  });

  it("returns no duplicates", () => {
    const words = selectPracticeWords(emptyProgress, 20, "en");
    const unique = new Set(words);
    expect(unique.size).toBe(words.length);
  });

  it("returns Spanish words when lang is 'es'", () => {
    const { ALL_WORDS: esAll } = getWordBank("es");
    const words = selectPracticeWords(emptyProgress, 10, "es");
    for (const w of words) {
      expect(esAll).toContain(w);
    }
  });

  it("returns empty array if count is 0", () => {
    const words = selectPracticeWords(emptyProgress, 0, "en");
    expect(words).toHaveLength(0);
  });

  it("handles progress with all words mastered", () => {
    const { ALL_WORDS } = getWordBank("en");
    const mastered = {};
    for (const w of ALL_WORDS) mastered[w] = Date.now();
    const progress = { wordStats: {}, mastered, learning: {} };
    const words = selectPracticeWords(progress, 10, "en");
    expect(words).toHaveLength(10);
  });
});

// ─── interleaveByGroup ──────────────────────────────────────

// ─── selectStrugglingWords ─────────────────────────────────

describe("selectStrugglingWords", () => {
  const emptyProgress = { wordStats: {}, mastered: {}, learning: {} };

  it("returns at most `count` words from the base deck", () => {
    const { ALL_WORDS } = getWordBank("en");
    const baseDeck = ALL_WORDS.slice(0, 10);
    const result = selectStrugglingWords(emptyProgress, baseDeck, [], "en", 10);
    expect(result).toHaveLength(10);
    for (const w of result) expect(baseDeck).toContain(w);
  });

  it("places session misses ahead of fresh words", () => {
    const { ALL_WORDS } = getWordBank("en");
    const baseDeck = ALL_WORDS.slice(0, 10);
    const misses = [baseDeck[7], baseDeck[9]];
    // Run many times to defeat the final shuffle and confirm both misses
    // are reliably included in the trimmed result.
    for (let i = 0; i < 5; i++) {
      const result = selectStrugglingWords(emptyProgress, baseDeck, misses, "en", 5);
      expect(result).toContain(misses[0]);
      expect(result).toContain(misses[1]);
    }
  });

  it("prioritizes persistent struggling words inside the base deck", () => {
    const { ALL_WORDS } = getWordBank("en");
    const baseDeck = ALL_WORDS.slice(0, 10);
    const struggleWord = baseDeck[6];
    const progress = {
      wordStats: { [struggleWord]: { attempts: 5, correct: 1, lastSeen: Date.now() } },
      mastered: {},
      learning: {},
    };
    for (let i = 0; i < 5; i++) {
      const result = selectStrugglingWords(progress, baseDeck, [], "en", 4);
      expect(result).toContain(struggleWord);
    }
  });

  it("returns no duplicates even with overlapping inputs", () => {
    const { ALL_WORDS } = getWordBank("en");
    const baseDeck = ALL_WORDS.slice(0, 10);
    const misses = [baseDeck[0], baseDeck[0], baseDeck[1]];
    const result = selectStrugglingWords(emptyProgress, baseDeck, misses, "en", 10);
    expect(new Set(result).size).toBe(result.length);
  });

  it("handles an empty base deck without throwing", () => {
    const result = selectStrugglingWords(emptyProgress, [], [], "en", 5);
    expect(result).toEqual([]);
  });
});

describe("interleaveByGroup", () => {
  it("round-robins words across groups", () => {
    const { ALL_WORDS } = getWordBank("en");
    const words = ALL_WORDS.slice(0, 30);
    const result = interleaveByGroup(words, "en");
    expect(result).toHaveLength(30);
    const inputSet = new Set(words);
    const outputSet = new Set(result);
    expect(outputSet.size).toBe(inputSet.size);
  });

  it("returns empty array for empty input", () => {
    const result = interleaveByGroup([], "en");
    expect(result).toHaveLength(0);
  });
});
