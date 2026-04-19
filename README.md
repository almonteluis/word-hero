# Word Hero — Sight Word Training Academy

A superhero-themed sight word learning app (PWA) built for kids. Features speech recognition, multi-child profiles, animated mode selection, daily challenge notifications, gamified progression, and offline support.

Built with **React 18 + Vite 6**.

---

## Features

- **Kid Profiles** — Each child gets a personalized profile with emoji avatar and separate progress tracking
- **Mode Selection Screen** — Animated "Choose Your Mission" screen with portal-expand transitions into each activity
- **3-Round Flashcard System (Flash Training):**
  - **Round 1 — Listen & Learn:** Word is spoken aloud; child marks it correct/incorrect manually
  - **Round 2 — Say It:** 10-second timer; child must say the word into the mic
  - **Round 3 — Speed Round:** 5-second timer; faster-paced speech recognition challenge
- **Find It Game** — Hear a word, tap the correct one from 4 on-screen choices (unlocked after completing a Flash Training session)
- **Hero Stats** — Tracks mastered words, accuracy %, sessions played, and hero rank
- **Word Mastery** — 3 consecutive correct answers marks a word as mastered; 7-day review decay un-masters words not practiced recently
- **Daily Challenge Notifications** — Configurable daily reminder to practice (with iOS notification support)
- **Speech Recognition** — Uses the Web Speech API; falls back to manual buttons if mic is unavailable
- **PWA** — Installable on iPhone/Android home screen; works fully offline after first load

---

## Tech Stack

| Layer       | Technology                               |
| ----------- | ---------------------------------------- |
| Framework   | React 18                                 |
| Build Tool  | Vite 6                                   |
| Testing     | Vitest + React Testing Library           |
| PWA         | vite-plugin-pwa                          |
| Speech      | Web Speech API (synthesis + recognition) |
| Persistence | localStorage                             |
| Fonts       | Google Fonts (Russo One, Nunito)         |
| Deployment  | Vercel                                   |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Deployment

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B: GitHub + Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Select **Vite** as the framework preset → Deploy

Once deployed, open the Vercel URL on your iPhone in Safari:
**Share → Add to Home Screen** — you get a fullscreen app with the icon on your home screen.

---

## PWA & Speech Recognition Notes

- Speech recognition requires **HTTPS** — Vercel handles this automatically
- On **Safari (iOS)**, the browser will prompt for microphone permission on first use — tap Allow
- On **Chrome (Android/Desktop)**, mic permission is requested via the browser permission bar
- If the microphone is unavailable or denied, the app automatically falls back to manual pass/fail buttons
- The app uses `webkitSpeechRecognition` (Chrome/Safari) with a fuzzy matching fallback for common mispronunciations

---

## Customizing Word Groups

Edit the `WORD_GROUPS` constant in `src/App.jsx` to add, remove, or reorganize word groups:

```js
const WORD_GROUPS = {
  "Group Name": ["word1", "word2", "word3", ...],
  // add more groups here
};
```

The app ships with 5 default word groups (75 sight words total) organized by difficulty.

---

## Project Structure

```
word-hero/
├── public/
│   ├── icon-192.png       # PWA icon (192x192)
│   ├── icon-512.png       # PWA icon (512x512)
│   └── icon.svg           # Vector logo
├── src/
│   ├── App.jsx            # Main application (~4000 lines, all components + logic)
│   ├── constants.ts       # Shared constants (word groups, color palette)
│   ├── main.jsx           # React entry point
│   └── test-setup.js      # Vitest + jest-dom setup
├── index.html             # HTML shell with PWA meta tags
├── vite.config.js         # Vite + PWA plugin + Vitest config
└── package.json
```

### Key Components (in `src/App.jsx`)

| Component              | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `WordHeroApp`          | Root component — manages profiles, active kid, and modes |
| `KidSelector`          | Profile selection/creation screen with emoji avatars      |
| `ModeSelectScreen`     | Animated mission-select screen (Flash / Find It / Stats)  |
| `FlashcardMode`        | 3-round flashcard training with speech recognition        |
| `FindItGame`           | Tap-the-correct-word recognition game                     |
| `ProgressScreen`       | Full stats dashboard — achievements, word groups, alerts  |
| `StatsRow`             | Mastered/Learning/Accuracy/Sessions stat badges           |
| `HeroPowerBar`         | Mastery progress bar                                      |
| `DailyStreak`          | Weekly streak tracker                                     |
| `DailyReminderSettings`| Notification scheduling and preferences                   |
| `CountdownTimer`       | Animated countdown used in Rounds 2 and 3                 |
| `HomeBackground`       | Animated star field background                            |

---

## Available Scripts

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Start dev server with hot reload  |
| `npm run build`    | Build optimized production bundle |
| `npm run preview`  | Preview production build locally  |
| `npm run test`     | Run tests once (Vitest)           |
| `npm run test:watch` | Run tests in watch mode         |
