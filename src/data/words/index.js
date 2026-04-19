import { WORD_GROUPS as EN_GROUPS, ALL_WORDS as EN_ALL, GROUP_NAMES as EN_NAMES } from "./en";
import { WORD_GROUPS as ES_GROUPS, ALL_WORDS as ES_ALL, GROUP_NAMES as ES_NAMES } from "./es";

const banks = {
  en: { WORD_GROUPS: EN_GROUPS, ALL_WORDS: EN_ALL, GROUP_NAMES: EN_NAMES },
  es: { WORD_GROUPS: ES_GROUPS, ALL_WORDS: ES_ALL, GROUP_NAMES: ES_NAMES },
};

export function getWordBank(lang = "en") {
  return banks[lang] || banks.en;
}

export const SUPPORTED_LANGS = ["en", "es"];

export const LANG_LABELS = { en: "English", es: "Español" };
