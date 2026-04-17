// ─── CONSTANTS ─────────────────────────────────────────────
export const WORD_GROUPS = {
  "Group 1 – Most Common": [
    "the",
    "and",
    "is",
    "it",
    "in",
    "to",
    "he",
    "she",
    "was",
    "we",
    "my",
    "do",
    "no",
    "go",
    "so",
  ],
  "Group 2 – Action Words": [
    "said",
    "have",
    "like",
    "come",
    "make",
    "see",
    "look",
    "play",
    "run",
    "jump",
    "help",
    "want",
    "give",
    "take",
    "put",
  ],
  "Group 3 – Connectors": [
    "what",
    "where",
    "when",
    "who",
    "why",
    "how",
    "that",
    "this",
    "with",
    "from",
    "they",
    "them",
    "her",
    "his",
    "but",
  ],
  "Group 4 – Describing Words": [
    "big",
    "little",
    "good",
    "new",
    "old",
    "first",
    "long",
    "very",
    "over",
    "after",
    "before",
    "under",
    "just",
    "again",
    "around",
  ],
  "Group 5 – Tricky Words": [
    "could",
    "would",
    "should",
    "because",
    "know",
    "write",
    "right",
    "their",
    "there",
    "were",
    "some",
    "done",
    "does",
    "goes",
    "every",
  ],
};
export const ALL_WORDS = Object.values(WORD_GROUPS).flat();
export const GROUP_NAMES = Object.keys(WORD_GROUPS);

export const C = {
  // Kumi theme — bright, friendly kids palette
  bg: "#B5DE5E",         // --bg-world: lime green outdoors
  surface: "#C9F0E2",    // --bg-surface: mint teal cards
  panel: "#E8F5E0",      // light green panels
  panelHover: "#D4EDCA",
  primary: "#8BCF3B",    // --primary-cta: bright green buttons
  secondary: "#3FAFE8",  // --secondary-cta: sky blue alt buttons
  accent: "#F5A623",     // --accent-warm: orange highlights/progress
  heart: "#FF6B7A",      // --accent-heart: red/pink hearts/lives
  sun: "#FFC93C",        // --accent-sun: yellow coins/stars
  text: "#3A4A54",       // --text-primary: dark slate body
  textLight: "#FFFFFF",  // --text-on-cta: white on colored buttons
  muted: "#7BA68A",      // muted green for secondary text
  green: "#8BCF3B",      // success/correct (same as primary)
  red: "#FF6B7A",        // wrong/heart (same as heart)
  blue: "#3FAFE8",       // info/secondary (same as secondary)
  purple: "#B088D4",     // soft purple accent
  // Shadows & borders
  shadow: "rgba(58, 74, 84, 0.08)",
  border: "rgba(58, 74, 84, 0.12)",
};

// Semantic aliases for clarity
export const FONT = "'Fredoka', sans-serif";
export const RADIUS = {
  card: 20,
  button: 24,
  pill: 50,
  small: 12,
};
