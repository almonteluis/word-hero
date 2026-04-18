import {
  WORD_GROUPS,
  GROUP_NAMES,
  ALL_WORDS,
  WORDS_PER_ROUND,
} from "../constants";
import { shuffle } from "./shuffle";

const REVIEW_WARNING_DAYS = 5;
const STRUGGLING_MIN_ATTEMPTS = 3;
const STRUGGLING_ACCURACY = 0.6;

function getWordGroup(word) {
  for (const gn of GROUP_NAMES) {
    if (WORD_GROUPS[gn].includes(word)) return gn;
  }
  return null;
}

function bucketize(progress) {
  const ws = progress.wordStats || {};
  const mastered = progress.mastered || {};
  const learning = progress.learning || {};
  const reviewCutoff =
    Date.now() - REVIEW_WARNING_DAYS * 24 * 60 * 60 * 1000;

  const review = [];
  const struggling = [];
  const learningWords = [];
  const fresh = [];
  const masteredFresh = [];

  for (const w of ALL_WORDS) {
    const stat = ws[w];
    if (mastered[w]) {
      const lastSeen = stat ? stat.lastSeen : mastered[w];
      if (lastSeen && lastSeen < reviewCutoff) review.push(w);
      else masteredFresh.push(w);
      continue;
    }
    if (
      stat &&
      stat.attempts >= STRUGGLING_MIN_ATTEMPTS &&
      stat.correct / stat.attempts < STRUGGLING_ACCURACY
    ) {
      struggling.push(w);
      continue;
    }
    if (learning[w]) {
      learningWords.push(w);
      continue;
    }
    if (!stat || stat.attempts === 0) {
      fresh.push(w);
      continue;
    }
    learningWords.push(w);
  }

  return { review, struggling, learningWords, fresh, masteredFresh };
}

// Round-robin across groups so a small selection still mixes groups.
function interleaveByGroup(words) {
  const byGroup = {};
  for (const gn of GROUP_NAMES) byGroup[gn] = [];
  for (const w of words) {
    const g = getWordGroup(w);
    if (g) byGroup[g].push(w);
  }
  for (const gn of GROUP_NAMES) byGroup[gn] = shuffle(byGroup[gn]);

  const result = [];
  let added = true;
  while (added) {
    added = false;
    for (const gn of GROUP_NAMES) {
      if (byGroup[gn].length > 0) {
        result.push(byGroup[gn].shift());
        added = true;
      }
    }
  }
  return result;
}

function selectPracticeWords(progress, count = WORDS_PER_ROUND) {
  const buckets = bucketize(progress);
  const picked = new Set();
  const result = [];

  const take = (arr, max) => {
    let added = 0;
    for (const w of arr) {
      if (result.length >= count || added >= max) return;
      if (picked.has(w)) continue;
      result.push(w);
      picked.add(w);
      added++;
    }
  };

  // Priority quotas — fall through to next bucket if the previous is short.
  take(shuffle(buckets.review), 2);
  take(shuffle(buckets.struggling), 3);
  take(shuffle(buckets.learningWords), 3);
  take(interleaveByGroup(buckets.fresh), count);
  take(shuffle(buckets.masteredFresh), count);

  if (result.length < count) {
    const leftover = [
      ...buckets.review,
      ...buckets.struggling,
      ...buckets.learningWords,
      ...buckets.masteredFresh,
    ].filter((w) => !picked.has(w));
    take(shuffle(leftover), count);
  }

  return shuffle(result).slice(0, count);
}

export {
  selectPracticeWords,
  selectPracticeWords as selectRoundWords,
  bucketize,
  interleaveByGroup,
};
