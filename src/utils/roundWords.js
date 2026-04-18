import { WORD_GROUPS, GROUP_NAMES, WORDS_PER_ROUND } from "../constants";
import { shuffle } from "./shuffle";

function selectRoundWords(group, progress, count = WORDS_PER_ROUND) {
  const allWords = WORD_GROUPS[GROUP_NAMES[group]];
  const learning = shuffle(allWords.filter((w) => progress.learning[w]));
  const fresh = shuffle(
    allWords.filter((w) => !progress.learning[w] && !progress.mastered[w]),
  );
  const mastered = shuffle(allWords.filter((w) => progress.mastered[w]));
  return [...learning, ...fresh, ...mastered].slice(0, count);
}

export { selectRoundWords };
