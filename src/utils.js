const STORAGE_VERSION = "v1";

export function loadProfiles() {
  try {
    const raw = localStorage.getItem(`word-hero-profiles:${STORAGE_VERSION}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfiles(data) {
  try {
    localStorage.setItem(
      `word-hero-profiles:${STORAGE_VERSION}`,
      JSON.stringify(data),
    );
  } catch {}
}

export function loadKidProgress(kidId) {
  try {
    const raw = localStorage.getItem(
      `word-hero-progress-${kidId}:${STORAGE_VERSION}`,
    );
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveKidProgress(kidId, progress) {
  try {
    localStorage.setItem(
      `word-hero-progress-${kidId}:${STORAGE_VERSION}`,
      JSON.stringify(progress),
    );
  } catch {}
}

export function removeKidProgress(kidId) {
  try {
    localStorage.removeItem(`word-hero-progress-${kidId}:${STORAGE_VERSION}`);
  } catch {}
}

export function initProgress() {
  return {
    mastered: {},
    learning: {},
    streaks: {},
    totalCorrect: 0,
    totalAttempts: 0,
    sessions: 0,
  };
}

export function progressReducer(state, action) {
  switch (action.type) {
    case "MARK_CORRECT": {
      const w = action.word;
      const streak = (state.streaks[w] || 0) + 1;
      const streaks = { ...state.streaks, [w]: streak };
      const totalCorrect = (state.totalCorrect || 0) + 1;
      const totalAttempts = (state.totalAttempts || 0) + 1;
      if (streak >= 3) {
        const mastered = { ...state.mastered, [w]: Date.now() };
        const learning = { ...state.learning };
        delete learning[w];
        return {
          ...state,
          mastered,
          learning,
          streaks,
          totalCorrect,
          totalAttempts,
        };
      }
      // in the return statement the ...state.learning is coming in as undefinted. Im guessing it's hasn't recivied anything yet.
      return {
        ...state,
        learning: { ...state.learning, [w]: true },
        streaks,
        totalCorrect,
        totalAttempts,
      };
    }
    case "MARK_WRONG": {
      const w = action.word;
      return {
        ...state,
        learning: { ...state.learning, [w]: true },
        streaks: { ...state.streaks, [w]: 0 },
        totalAttempts: (state.totalAttempts || 0) + 1,
      };
    }
    case "NEW_SESSION":
      return { ...state, sessions: (state.sessions || 0) + 1 };
    case "LOAD":
      return action.data || initProgress();
    case "RESET":
      return initProgress();
    default:
      return state;
  }
}

export function speak(word) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.75;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
  }
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function wordMatch(spokenResult, target) {
  const alts = spokenResult.split("|");
  const t = target.toLowerCase().trim();
  return alts.some((a) => a === t || a.includes(t) || t.includes(a));
}
