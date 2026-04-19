// ─── CONSTANTS ─────────────────────────────────────────────
import { getWordBank, SUPPORTED_LANGS, LANG_LABELS } from "./data/words";

// Default English exports for backward compatibility
const enBank = getWordBank("en");
export const WORD_GROUPS = enBank.WORD_GROUPS;
export const ALL_WORDS = enBank.ALL_WORDS;
export const GROUP_NAMES = enBank.GROUP_NAMES;
export { getWordBank, SUPPORTED_LANGS, LANG_LABELS };
export const WORDS_PER_ROUND = 10;

export const C = {
  // Pastel Pop Squishy Toy Theme
  bg: "#F9FAFB",         // Soft cream background
  surface: "#FFFFFF",    // White cards
  panel: "#F1F5F9",      // Soft gray-blue panels
  panelHover: "#E2E8F0",
  primary: "#FF8BA7",    // Cotton Candy Pink
  secondary: "#BAE6FD",  // Sky Blue
  accent: "#FFDE59",     // Sunny Yellow
  heart: "#FF6B8B",      // Bright Pink/Red for lives
  sun: "#FFD166",        // Warm yellow
  text: "#334155",       // Soft Ink (Dark slate) - for text
  textLight: "#FFFFFF",  // White text on dark/colored buttons
  muted: "#94A3B8",      // Soft slate for secondary text
  green: "#A7F3D0",      // Mint green
  pink: "#FF8BA7",       // Extra ref alias
  red: "#FF6B8B",        
  blue: "#BAE6FD",       
  purple: "#DDD6FE",     // Soft Lilac
  
  // Shadows & borders for Toy Block (Neobrutalism) effect
  ink: "#334155",        // Soft ink used for borders and thick toy shadows
  border: "#334155",     
  shadowLine: "#334155", // For the main block drop shadows
  softShadow: "rgba(51, 65, 85, 0.15)", // For soft floating elements
};

// Semantic aliases for clarity
export const FONT = "'Fredoka', sans-serif";
export const RADIUS = {
  card: 20,
  button: 24,
  pill: 50,
  small: 12,
};
