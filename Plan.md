# Word Hero UI Redesign Plan

## Current State
- Dark space theme (deep navy `#0a0e27` bg, yellow `#f6c619` accent, star/planet decorations)
- Fonts: Russo One (headers/buttons), Nunito (body)
- All inline styles, no CSS variables or theme system
- Screens: KidSelector (welcome/choose) → ModeSelectScreen (mission cards) → FlashcardMode / FindItGame / ProgressTracker

## Target: Kumi-style bright kids theme

### Phase 0 — Design System Foundation (START HERE)
**Goal:** Replace all colors/fonts with token-based system. Zero visual changes yet — just infrastructure.

- [ ] Add Fredoka font via Google Fonts (replace Russo One + Nunito)
- [ ] Create CSS custom properties for all design tokens in `constants.ts`
- [ ] Update `C` object to use new Kumi palette
- [ ] Update `index.html` theme-color and background
- [ ] Run build, verify no breakage

### Phase 1 — Welcome / Sign-In Screen (KidSelector)
**Goal:** Bright outdoor feel replacing dark space theme.

- [ ] Replace space background with lime/green outdoor gradient
- [ ] Replace StarField/HomeBackground with nature decorations
- [ ] Restyle title to friendly rounded font + warm colors
- [ ] Restyle profile cards as rounded "character" cards
- [ ] Pill buttons with 3D bottom-border effect
- [ ] Commit + verify build

### Phase 2 — Roadmap (ModeSelectScreen)
**Goal:** Replace 3 mission cards with friendly activity selection.

- [ ] Restyle mission cards as bright rounded cards
- [ ] Update iconography and colors
- [ ] Friendly character mascot alongside name
- [ ] Commit + verify build

### Phase 3 — Game Mode Layout (FlashcardMode + FindItGame)
**Goal:** Apply Kumi styling to existing game screens.

- [ ] Restyle flashcard with rounded card + progress bar
- [ ] Restyle Find It options as pill buttons
- [ ] Consistent header with hearts/progress
- [ ] Commit + verify build

### Phase 4 — Post-Activity Screen (victory/results)
**Goal:** Celebratory win screen with stars.

- [ ] Star rating system on completion
- [ ] Confetti/celebration feel
- [ ] Rewards display (trophies, coins, hearts)
- [ ] Commit + verify build

### Phase 5 — Stats Screen (ProgressTracker)
**Goal:** Friendly progress dashboard.

- [ ] Restyle stats cards with Kumi tokens
- [ ] Achievement/streak display
- [ ] Commit + verify build

## Design Tokens (Kumi Theme)

### Colors
| Token | Value |
|---|---|
| `--bg-world` | `#B5DE5E` (lime green) |
| `--bg-surface` | `#C9F0E2` (mint teal) |
| `--primary-cta` | `#8BCF3B` (bright green) |
| `--secondary-cta` | `#3FAFE8` (sky blue) |
| `--accent-warm` | `#F5A623` (orange) |
| `--accent-heart` | `#FF6B7A` (red/pink) |
| `--accent-sun` | `#FFC93C` (yellow) |
| `--text-primary` | `#3A4A54` (dark slate) |
| `--text-on-cta` | `#FFFFFF` |
| `--panel` | `#E8F5E0` (light green) |
| `--muted` | `#7BA68A` (muted green) |

### Typography
- **Primary:** Fredoka (headers, buttons, body — bold weight for headers, regular for body)
- Body: 16-18px, Headers: 24-32px

### Component Conventions
- Cards: `border-radius: 20px`, soft drop shadow
- Buttons: `border-radius: 24px+` (pill), 4px solid bottom border darker shade
- All radius/font via tokens for future skin system
