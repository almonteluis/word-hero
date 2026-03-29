# ⚡ Word Hero — Sight Word Training Academy

A superhero-themed sight word learning PWA for kids. Built with React + Vite.

## Features

- **Kid Profiles** — Each child gets their own profile with separate progress tracking
- **3-Round Flashcard Progression:**
  - Round 1: Listen & Learn (word spoken aloud, manual marking)
  - Round 2: Say It (10s timer, speech recognition via mic)
  - Round 3: Speed Round (5s timer, speech recognition)
  - 80%+ overall → auto-advances to Find It game
- **Find It Game** — Hear a word, tap the correct one from 4 options
- **Progress Tracker** — Mastered words, accuracy, sessions, hero rank
- **Speech Recognition** — Kids must say the word correctly to pass (rounds 2 & 3)
- **PWA** — Install on iPhone/Android home screen, works offline

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

### Option A: CLI
```bash
npm install -g vercel
vercel
```

### Option B: GitHub
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Framework: Vite → Deploy

Once deployed, open the Vercel URL on your iPhone in Safari:
**Share → Add to Home Screen**

That's it — you have a fullscreen app with the ⚡ icon.

## Speech Recognition Notes

- Requires HTTPS (Vercel provides this automatically)
- Safari will prompt for mic permission on first use — tap Allow
- If mic isn't available, falls back to manual buttons
- Uses Web Speech API (`webkitSpeechRecognition`)

## Customizing Words

Edit the `WORD_GROUPS` object in `src/App.jsx` to add/remove/change word groups.

## Tech Stack

- React 18
- Vite 6
- vite-plugin-pwa
- Web Speech API (synthesis + recognition)
- localStorage for persistence
