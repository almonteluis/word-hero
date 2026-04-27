import { getWordBank } from "../constants";
import { shuffle } from "./shuffle";

// Weighted letter pools for K-3 age range
const POOLS = {
  en: {
    vowels: { e: 3, a: 3, i: 2, o: 2, u: 1 },
    consonants: {
      t: 3, n: 3, s: 3, r: 3, l: 2,
      d: 2, g: 2, m: 2, p: 2, c: 2, b: 2, h: 2,
      f: 1, w: 1, y: 1, k: 1, v: 1,
    },
  },
  es: {
    vowels: { e: 3, a: 3, i: 2, o: 2, u: 1 },
    consonants: {
      t: 3, n: 3, s: 3, r: 3, l: 2,
      d: 2, g: 2, m: 2, p: 2, c: 2, b: 2, h: 1,
      f: 1, y: 1, k: 0, v: 1, w: 0,
    },
  },
};

function weightedPick(pool) {
  const entries = Object.entries(pool).filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [letter, weight] of entries) {
    r -= weight;
    if (r <= 0) return letter;
  }
  return entries[entries.length - 1][0];
}

function generateLetterSet(lang = "en", count = 15) {
  const pool = POOLS[lang] || POOLS.en;
  const { ALL_WORDS } = getWordBank(lang);

  // Pick 2-3 short seed words to guarantee formable words exist
  const shortWords = ALL_WORDS.filter((w) => w.length >= 2 && w.length <= 4);
  const seedCount = 2 + Math.floor(Math.random() * 2); // 2-3
  const seeds = shuffle([...shortWords]).slice(0, seedCount);

  // Extract unique letters from seeds
  const seedLetters = [];
  for (const word of seeds) {
    for (const ch of word.toLowerCase()) {
      if (!seedLetters.includes(ch) && /[a-z]/.test(ch)) {
        seedLetters.push(ch);
      }
    }
  }

  // Start with seed letters (up to count)
  const letters = seedLetters.slice(0, count);

  // Count vowels
  const vowelSet = new Set(Object.keys(pool.vowels));
  let vowelCount = letters.filter((l) => vowelSet.has(l)).length;

  // Ensure at least 5 vowels total
  while (vowelCount < 5 && letters.length < count) {
    letters.push(weightedPick(pool.vowels));
    vowelCount++;
  }

  // Fill remaining with weighted consonants
  while (letters.length < count) {
    // Add a vowel ~40% of the time if under 7 vowels
    if (vowelCount < 7 && Math.random() < 0.4) {
      letters.push(weightedPick(pool.vowels));
      vowelCount++;
    } else {
      letters.push(weightedPick(pool.consonants));
    }
  }

  return shuffle(letters);
}

export { generateLetterSet };
