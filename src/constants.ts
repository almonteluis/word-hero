// ─── CONSTANTS ─────────────────────────────────────────────
import { getWordBank, SUPPORTED_LANGS, LANG_LABELS } from "./data/words";

// Default English exports for backward compatibility
const enBank = getWordBank("en");
export const WORD_GROUPS = enBank.WORD_GROUPS;
export const ALL_WORDS = enBank.ALL_WORDS;
export const GROUP_NAMES = enBank.GROUP_NAMES;
export { getWordBank, SUPPORTED_LANGS, LANG_LABELS };
export const WORDS_PER_ROUND = 10;

// ─── COLOR TOKENS ──────────────────────────────────────────
export const C = {
  // Base palette
  bg: "#F9FAFB",         // Soft cream — page background
  surface: "#FFFFFF",    // White — card/panel backgrounds
  panel: "#F1F5F9",      // Soft gray-blue — secondary panels
  panelHover: "#E2E8F0", // Panel hover

  primary: "#FF8BA7",    // Cotton Candy Pink — CTAs
  secondary: "#BAE6FD",  // Sky Blue — backgrounds
  accent: "#FFDE59",     // Sunny Yellow — active states
  sun: "#FFD166",        // Warm Yellow — decorative
  green: "#A7F3D0",      // Mint Green — success/correct
  purple: "#DDD6FE",     // Soft Lilac — Find It mode
  heart: "#FF6B8B",      // Bright Pink/Red — error/lives

  text: "#334155",       // Soft Ink — all body text
  textLight: "#FFFFFF",  // White text on colored bg
  muted: "#94A3B8",      // Secondary/hint text
  ink: "#334155",        // Neobrutalist border + shadow

  // Legacy aliases
  pink: "#FF8BA7",
  red: "#FF6B8B",
  blue: "#BAE6FD",
  border: "#334155",
  shadowLine: "#334155",
  softShadow: "rgba(51, 65, 85, 0.15)",
};

// ─── TYPOGRAPHY ────────────────────────────────────────────
export const FONT = "'Fredoka', sans-serif";

export const TEXT = {
  hero: "clamp(52px, 15vw, 78px)",   // Splash title
  display: "clamp(36px, 10vw, 56px)", // Section headers
  h1: "28px",                          // Screen titles
  h2: "22px",                          // Card titles
  h3: "18px",                          // Sub-section titles
  body: "16px",                        // Primary content
  sm: "14px",                          // Secondary content
  xs: "13px",                          // Hints
  label: "10px",                       // Nav labels, caps tags
};

export const WEIGHT = {
  regular: 400,
  medium: 500,
  semi: 600,
  bold: 700,
};

// ─── BORDER RADIUS ────────────────────────────────────────
export const RADIUS = {
  card: 20,
  button: 24,
  pill: 50,
  small: 12,
  circle: "50%",
};

// ─── SHADOWS — CLAY-BLOCK SYSTEM (NEOBRUTALIST + CLAYMORPHISM) ─
export const SHADOW = {
  toy: `inset -3px -3px 6px rgba(255,255,255,0.5), inset 3px 3px 6px rgba(0,0,0,0.06), 4px 6px 0px ${C.ink}`,
  toySm: `inset -2px -2px 5px rgba(255,255,255,0.5), inset 2px 2px 5px rgba(0,0,0,0.06), 3px 4px 0px ${C.ink}`,
  toyXs: `inset -2px -2px 4px rgba(255,255,255,0.4), inset 2px 2px 4px rgba(0,0,0,0.05), 2px 3px 0px ${C.ink}`,
  toyPressed: `inset -1px -1px 3px rgba(255,255,255,0.3), inset 1px 1px 3px rgba(0,0,0,0.08), 2px 2px 0px ${C.ink}`,
  soft: "0 4px 16px rgba(51, 65, 85, 0.12)",
  softLg: "0 8px 32px rgba(51, 65, 85, 0.15)",
};

// ─── SPACING SCALE ────────────────────────────────────────
export const SPACE = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
};

// ─── ANIMATION TOKENS ─────────────────────────────────────
export const EASE = {
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",   // Signature spring overshoot
  out: "cubic-bezier(0.4, 0, 0.2, 1)",             // Standard ease-out
  inOut: "cubic-bezier(0.4, 0, 0.6, 1)",
};

export const DURATION = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
  blob: "8s",
};
