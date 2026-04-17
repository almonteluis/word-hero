const MASTERY_SESSIONS = 3;
const MASTERY_ACCURACY = 0.95;
const REVIEW_DAYS = 7;

function initProgress() {
  return {
    mastered: {},
    learning: {},
    streaks: {},
    wordStats: {},
    totalCorrect: 0,
    totalAttempts: 0,
    sessions: 0,
    currentSessionId: null,
  };
}

function getWordStats(state, word) {
  return (
    state.wordStats[word] || {
      correct: 0,
      attempts: 0,
      sessionsCorrect: 0,
      lastSeen: null,
      sessionId: null,
    }
  );
}

function checkMastery(ws) {
  if (ws.sessionsCorrect < MASTERY_SESSIONS) return false;
  if (ws.attempts === 0) return false;
  return ws.correct / ws.attempts >= MASTERY_ACCURACY;
}

function weightedShuffle(words, wordStats, mastered) {
  const scored = words.map((w) => {
    const ws = wordStats[w] || { correct: 0, attempts: 0 };
    if (ws.attempts === 0) return { word: w, weight: 0.5 };
    const accuracy = ws.correct / ws.attempts;
    const weight = mastered[w] ? 0.05 : 1 - accuracy + 0.1;
    return { word: w, weight };
  });
  scored.forEach((s) => {
    s.sort = s.weight * (0.5 + Math.random());
  });
  scored.sort((a, b) => b.sort - a.sort);
  return scored.map((s) => s.word);
}

function progressReducer(state, action) {
  switch (action.type) {
    case "MARK_CORRECT": {
      const w = action.word;
      const streak = (state.streaks[w] || 0) + 1;
      const streaks = { ...state.streaks, [w]: streak };
      const totalCorrect = (state.totalCorrect || 0) + 1;
      const totalAttempts = (state.totalAttempts || 0) + 1;
      const ws = getWordStats(state, w);
      const updatedWs = {
        ...ws,
        correct: ws.correct + 1,
        attempts: ws.attempts + 1,
        lastSeen: Date.now(),
        sessionsCorrect:
          ws.sessionId !== state.currentSessionId
            ? ws.sessionsCorrect + 1
            : ws.sessionsCorrect,
        sessionId: state.currentSessionId,
      };
      const wordStats = { ...state.wordStats, [w]: updatedWs };

      if (checkMastery(updatedWs)) {
        const mastered = { ...state.mastered, [w]: Date.now() };
        const learning = { ...state.learning };
        delete learning[w];
        return {
          ...state,
          mastered,
          learning,
          streaks,
          wordStats,
          totalCorrect,
          totalAttempts,
        };
      }
      return {
        ...state,
        learning: { ...state.learning, [w]: true },
        streaks,
        wordStats,
        totalCorrect,
        totalAttempts,
      };
    }
    case "MARK_WRONG": {
      const w = action.word;
      const ws = getWordStats(state, w);
      const updatedWs = {
        ...ws,
        attempts: ws.attempts + 1,
        lastSeen: Date.now(),
        sessionId: state.currentSessionId,
      };
      const wordStats = { ...state.wordStats, [w]: updatedWs };
      return {
        ...state,
        learning: { ...state.learning, [w]: true },
        streaks: { ...state.streaks, [w]: 0 },
        wordStats,
        totalAttempts: (state.totalAttempts || 0) + 1,
      };
    }
    case "RECORD_RETRY": {
      const w = action.word;
      const ws = getWordStats(state, w);
      const updatedWs = {
        ...ws,
        attempts: ws.attempts + 1,
        lastSeen: Date.now(),
        sessionId: state.currentSessionId,
      };
      return {
        ...state,
        wordStats: { ...state.wordStats, [w]: updatedWs },
        totalAttempts: (state.totalAttempts || 0) + 1,
      };
    }
    case "CHECK_REVIEW_DECAY": {
      const now = Date.now();
      const cutoff = now - REVIEW_DAYS * 24 * 60 * 60 * 1000;
      const mastered = { ...state.mastered };
      const learning = { ...state.learning };
      const wordStats = { ...state.wordStats };
      let changed = false;
      for (const w of Object.keys(mastered)) {
        const ws = wordStats[w];
        const lastSeen = ws ? ws.lastSeen : mastered[w];
        if (lastSeen && lastSeen < cutoff) {
          delete mastered[w];
          learning[w] = true;
          if (ws) wordStats[w] = { ...ws, sessionsCorrect: 0 };
          changed = true;
        }
      }
      if (!changed) return state;
      return { ...state, mastered, learning, wordStats };
    }
    case "NEW_SESSION": {
      const sessionId = Date.now().toString();
      return {
        ...state,
        sessions: (state.sessions || 0) + 1,
        currentSessionId: sessionId,
      };
    }
    case "LOAD": {
      const data = action.data || initProgress();
      if (!data.wordStats) data.wordStats = {};
      if (!data.currentSessionId) data.currentSessionId = null;
      return data;
    }
    case "RESET":
      return initProgress();
    default:
      return state;
  }
}

export {
  MASTERY_SESSIONS,
  MASTERY_ACCURACY,
  REVIEW_DAYS,
  initProgress,
  getWordStats,
  checkMastery,
  weightedShuffle,
  progressReducer,
};
