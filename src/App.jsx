import { useState, useEffect, useCallback, useReducer, useRef } from "react";

// ─── CONSTANTS ─────────────────────────────────────────────
const WORD_GROUPS = {
  "Group 1 – Most Common": ["the","and","is","it","in","to","he","she","was","we","my","do","no","go","so"],
  "Group 2 – Action Words": ["said","have","like","come","make","see","look","play","run","jump","help","want","give","take","put"],
  "Group 3 – Connectors": ["what","where","when","who","why","how","that","this","with","from","they","them","her","his","but"],
  "Group 4 – Describing Words": ["big","little","good","new","old","first","long","very","over","after","before","under","just","again","around"],
  "Group 5 – Tricky Words": ["could","would","should","because","know","write","right","their","there","were","some","done","does","goes","every"],
};
const ALL_WORDS = Object.values(WORD_GROUPS).flat();
const GROUP_NAMES = Object.keys(WORD_GROUPS);

const C = {
  bg: "#0a0e27",
  panel: "#111638",
  panelHover: "#181e4a",
  accent: "#f6c619",
  red: "#e84545",
  blue: "#4a90ff",
  green: "#2ecc71",
  purple: "#9b59b6",
  text: "#f0f0f0",
  muted: "#7a82a6",
};

// ─── STORAGE HELPERS (localStorage for PWA) ──────────────
function loadProfiles() {
  try {
    const raw = localStorage.getItem("word-hero-profiles");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveProfiles(data) {
  try { localStorage.setItem("word-hero-profiles", JSON.stringify(data)); } catch {}
}
function loadKidProgress(kidId) {
  try {
    const raw = localStorage.getItem(`word-hero-progress-${kidId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveKidProgress(kidId, progress) {
  try { localStorage.setItem(`word-hero-progress-${kidId}`, JSON.stringify(progress)); } catch {}
}

// ─── PROGRESS REDUCER ──────────────────────────────────────
// wordStats: { [word]: { correct, attempts, sessionsCorrect, lastSeen, sessionId } }
// mastered: { [word]: timestamp }  — word mastered when sessionsCorrect >= 3 AND accuracy >= 95%
// 7-day decay: words unseen for 7+ days get un-mastered on session start

const MASTERY_SESSIONS = 3;
const MASTERY_ACCURACY = 0.95;
const REVIEW_DAYS = 7;

function initProgress() {
  return { mastered: {}, learning: {}, streaks: {}, wordStats: {}, totalCorrect: 0, totalAttempts: 0, sessions: 0, currentSessionId: null };
}

function getWordStats(state, word) {
  return state.wordStats[word] || { correct: 0, attempts: 0, sessionsCorrect: 0, lastSeen: null, sessionId: null };
}

function checkMastery(ws) {
  if (ws.sessionsCorrect < MASTERY_SESSIONS) return false;
  if (ws.attempts === 0) return false;
  return (ws.correct / ws.attempts) >= MASTERY_ACCURACY;
}

// Weighted shuffle: words with lower per-word accuracy or more attempts come first more often
function weightedShuffle(words, wordStats, mastered) {
  const scored = words.map(w => {
    const ws = wordStats[w] || { correct: 0, attempts: 0 };
    // Never-seen words get a medium weight so they appear naturally
    if (ws.attempts === 0) return { word: w, weight: 0.5 };
    const accuracy = ws.correct / ws.attempts;
    // Lower accuracy = higher weight (appears more). Mastered words get lowest weight.
    const weight = mastered[w] ? 0.05 : (1 - accuracy) + 0.1;
    return { word: w, weight };
  });
  // Weighted random sort: multiply weight by random factor, sort descending
  scored.forEach(s => { s.sort = s.weight * (0.5 + Math.random()); });
  scored.sort((a, b) => b.sort - a.sort);
  return scored.map(s => s.word);
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
        // Track if this is a new session for this word
        sessionsCorrect: ws.sessionId !== state.currentSessionId
          ? ws.sessionsCorrect + 1
          : ws.sessionsCorrect,
        sessionId: state.currentSessionId,
      };
      const wordStats = { ...state.wordStats, [w]: updatedWs };

      if (checkMastery(updatedWs)) {
        const mastered = { ...state.mastered, [w]: Date.now() };
        const learning = { ...state.learning };
        delete learning[w];
        return { ...state, mastered, learning, streaks, wordStats, totalCorrect, totalAttempts };
      }
      return { ...state, learning: { ...state.learning, [w]: true }, streaks, wordStats, totalCorrect, totalAttempts };
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
      // Track a retry attempt (wrong before getting it right) — counts as an attempt but not correct
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
      // Un-master words not seen in 7+ days
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
          // Reset sessionsCorrect so they need to re-earn mastery
          if (ws) wordStats[w] = { ...ws, sessionsCorrect: 0 };
          changed = true;
        }
      }
      if (!changed) return state;
      return { ...state, mastered, learning, wordStats };
    }
    case "NEW_SESSION": {
      const sessionId = Date.now().toString();
      return { ...state, sessions: (state.sessions || 0) + 1, currentSessionId: sessionId };
    }
    case "LOAD": {
      const data = action.data || initProgress();
      // Migrate old data: ensure wordStats exists
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

// ─── SPEECH HELPER ─────────────────────────────────────────
function speak(word) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const pickVoice = (voices) => {
    // UK English female has the best natural intonation for this style
    const preferred = [
      "Google UK English Female",
      "Samantha",
      "Karen",
      "Moira",
      "Tessa",
      "Microsoft Zira Desktop",
      "Google US English",
    ];
    return (
      voices.find(v => preferred.includes(v.name)) ||
      voices.find(v => /female/i.test(v.name) && /en[-_]GB/i.test(v.lang)) ||
      voices.find(v => /female/i.test(v.name) && /en/i.test(v.lang)) ||
      voices.find(v => /en[-_]US/i.test(v.lang)) ||
      voices.find(v => /en/i.test(v.lang))
    );
  };

  const buildUtterances = (voice) => {
    const utt = new SpeechSynthesisUtterance(word);
    utt.rate = 0.85;
    utt.pitch = 1.3;
    utt.volume = 1.0;
    if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    buildUtterances(pickVoice(voices));
  } else {
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      buildUtterances(pickVoice(window.speechSynthesis.getVoices()));
    }, { once: true });
  }
}

// ─── SMALL COMPONENTS ──────────────────────────────────────
const StarField = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    {Array.from({ length: 30 }).map((_, i) => (
      <div key={i} style={{
        position: "absolute",
        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
        width: 4 + Math.random() * 4, height: 4 + Math.random() * 4,
        background: [C.accent, C.blue, C.red, C.purple, C.green][i % 5],
        borderRadius: "50%", opacity: 0.15 + Math.random() * 0.3,
        animation: `starPulse ${2 + Math.random() * 3}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 3}s`,
      }} />
    ))}
  </div>
);

function GroupSelector({ selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", padding: "0 8px" }}>
      {GROUP_NAMES.map((g, i) => (
        <button key={g} onClick={() => onChange(i)} style={{
          background: i === selected ? C.accent : C.panel,
          color: i === selected ? C.bg : C.muted,
          border: `2px solid ${i === selected ? C.accent : "transparent"}`,
          borderRadius: 20, padding: "5px 12px", cursor: "pointer",
          fontWeight: 700, fontSize: 11, fontFamily: "'Russo One', sans-serif", letterSpacing: 1,
          transition: "all 0.2s",
        }}>
          {g.split("–")[0].trim()}
        </button>
      ))}
    </div>
  );
}

function Btn({ children, color = C.accent, onClick, style = {}, small = false }) {
  return (
    <button onClick={onClick} style={{
      background: color, color: color === C.accent || color === C.green ? C.bg : "#fff",
      border: "none", borderRadius: small ? 12 : 16,
      padding: small ? "8px 18px" : "12px 28px",
      fontSize: small ? 13 : 16, fontWeight: 800, cursor: "pointer",
      fontFamily: "'Russo One', sans-serif", letterSpacing: 2,
      boxShadow: `0 4px 15px ${color}50`,
      transition: "transform 0.15s", ...style,
    }}>
      {children}
    </button>
  );
}

// ─── KAWAII HOME BACKGROUND ────────────────────────────────
const STAR_DATA = Array.from({ length: 40 }).map((_, i) => ({
  left: (i * 13.7 + 7) % 100,
  top: (i * 17.3 + 11) % 100,
  size: 3 + (i % 4),
  color: ["#f6c619","#4a90ff","#e84545","#9b59b6","#2ecc71","#ffffff","#ffb3c6"][i % 7],
  opacity: 0.15 + (i % 6) * 0.05,
  dur: 2 + (i % 3),
  delay: (i * 0.4) % 3,
}));

function HomeBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Twinkling star dots */}
      {STAR_DATA.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size, background: s.color,
          borderRadius: "50%", opacity: s.opacity,
          animation: `starPulse ${s.dur}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}

      {/* ── Top-left: large teal Saturn-style planet ── */}
      <div style={{ position: "absolute", left: "-8%", top: "1%", width: "46vw", maxWidth: 190, animation: "floatPlanet 7s ease-in-out infinite" }}>
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <ellipse cx="80" cy="108" rx="76" ry="18" fill="#4aaac0" opacity="0.65" />
          <text x="80" y="116" textAnchor="middle" fontSize="8.5" fill="#0a0e27" fontFamily="monospace" opacity="0.85" letterSpacing="2">F M G I S K Z E E A N</text>
          <circle cx="80" cy="72" r="54" fill="#5bb8cc" />
          <ellipse cx="80" cy="66" rx="54" ry="12" fill="#82d8ea" opacity="0.55" />
          <ellipse cx="80" cy="82" rx="54" ry="8" fill="#3a98b0" opacity="0.4" />
          <ellipse cx="80" cy="108" rx="76" ry="18" fill="none" stroke="#82d8ea" strokeWidth="7" opacity="0.25" />
          <circle cx="65" cy="66" r="8.5" fill="white" />
          <circle cx="95" cy="66" r="8.5" fill="white" />
          <circle cx="67" cy="68" r="4" fill="#0a2a44" />
          <circle cx="97" cy="68" r="4" fill="#0a2a44" />
          <circle cx="65.5" cy="66" r="1.5" fill="white" />
          <circle cx="95.5" cy="66" r="1.5" fill="white" />
          <ellipse cx="54" cy="78" rx="9" ry="5" fill="#ffaac6" opacity="0.45" />
          <ellipse cx="106" cy="78" rx="9" ry="5" fill="#ffaac6" opacity="0.45" />
          <path d="M 63 81 Q 80 93 97 81" stroke="#0a2a44" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Shooting star top-center ── */}
      <div style={{ position: "absolute", left: "52%", top: "7%", animation: "shootingStarAnim 4.5s ease-in-out infinite", animationDelay: "1.2s" }}>
        <svg width="68" height="34" viewBox="0 0 68 34">
          <line x1="68" y1="2" x2="8" y2="30" stroke="#f6c619" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
          <circle cx="68" cy="2" r="5" fill="#f6c619" />
        </svg>
      </div>

      {/* ── Top-right: small swirling galaxy ── */}
      <div style={{ position: "absolute", right: "3%", top: "7%", width: "22vw", maxWidth: 92, animation: "floatPlanet 8s ease-in-out infinite", animationDelay: "2.1s" }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <ellipse cx="50" cy="50" rx="48" ry="22" fill="#6b4c9a" opacity="0.5" transform="rotate(-25,50,50)" />
          <ellipse cx="50" cy="50" rx="40" ry="18" fill="#8b6cba" opacity="0.45" transform="rotate(60,50,50)" />
          <circle cx="50" cy="50" r="23" fill="#c4a0e8" />
          <circle cx="50" cy="50" r="16" fill="#e2d0f8" />
          <circle cx="43" cy="47" r="4.5" fill="white" />
          <circle cx="57" cy="47" r="4.5" fill="white" />
          <circle cx="44.5" cy="48.5" r="2.2" fill="#444" />
          <circle cx="58.5" cy="48.5" r="2.2" fill="#444" />
          <ellipse cx="38" cy="54" rx="5" ry="3" fill="#ffb3c6" opacity="0.5" />
          <ellipse cx="62" cy="54" rx="5" ry="3" fill="#ffb3c6" opacity="0.5" />
          <path d="M 43 56 Q 50 62 57 56" stroke="#444" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Right side: striped blue planet ── */}
      <div style={{ position: "absolute", right: "-4%", top: "33%", width: "28vw", maxWidth: 112, animation: "floatPlanet 6s ease-in-out infinite", animationDelay: "0.8s" }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="50" r="42" fill="#8ecae6" />
          <ellipse cx="50" cy="35" rx="42" ry="7" fill="#aaddf0" opacity="0.65" />
          <ellipse cx="50" cy="50" rx="42" ry="6" fill="#70b8d8" opacity="0.5" />
          <ellipse cx="50" cy="64" rx="42" ry="7" fill="#aaddf0" opacity="0.6" />
          <circle cx="40" cy="46" r="6.5" fill="white" />
          <circle cx="60" cy="46" r="6.5" fill="white" />
          <circle cx="41.5" cy="47.5" r="3" fill="#0a2a44" />
          <circle cx="61.5" cy="47.5" r="3" fill="#0a2a44" />
          <ellipse cx="33" cy="54" rx="7" ry="4" fill="#ffaac6" opacity="0.45" />
          <ellipse cx="67" cy="54" rx="7" ry="4" fill="#ffaac6" opacity="0.45" />
          <path d="M 40 56 Q 50 65 60 56" stroke="#0a2a44" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Shooting star lower-left ── */}
      <div style={{ position: "absolute", left: "18%", top: "72%", animation: "shootingStarAnim 5s ease-in-out infinite", animationDelay: "0.4s" }}>
        <svg width="58" height="28" viewBox="0 0 58 28">
          <line x1="58" y1="2" x2="6" y2="24" stroke="#f6c619" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <circle cx="58" cy="2" r="4" fill="#f6c619" />
        </svg>
      </div>

      {/* ── Bottom-left: teal planet with letter ring ── */}
      <div style={{ position: "absolute", left: "-7%", bottom: "4%", width: "42vw", maxWidth: 168, animation: "floatPlanet 7.5s ease-in-out infinite", animationDelay: "3.2s" }}>
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <ellipse cx="80" cy="108" rx="74" ry="17" fill="#4aaac0" opacity="0.65" />
          <text x="80" y="116" textAnchor="middle" fontSize="8.5" fill="#0a0e27" fontFamily="monospace" opacity="0.85" letterSpacing="2">U Z A T E L Y K H G E V</text>
          <circle cx="80" cy="72" r="50" fill="#5bb8cc" />
          <ellipse cx="80" cy="65" rx="50" ry="11" fill="#82d8ea" opacity="0.5" />
          <ellipse cx="80" cy="80" rx="50" ry="8" fill="#3a98b0" opacity="0.4" />
          <ellipse cx="80" cy="108" rx="74" ry="17" fill="none" stroke="#82d8ea" strokeWidth="6" opacity="0.25" />
          <circle cx="66" cy="67" r="8" fill="white" />
          <circle cx="94" cy="67" r="8" fill="white" />
          <circle cx="67.5" cy="69" r="3.8" fill="#0a2a44" />
          <circle cx="95.5" cy="69" r="3.8" fill="#0a2a44" />
          <ellipse cx="55" cy="78" rx="8.5" ry="5" fill="#ffaac6" opacity="0.45" />
          <ellipse cx="105" cy="78" rx="8.5" ry="5" fill="#ffaac6" opacity="0.45" />
          <path d="M 64 81 Q 80 92 96 81" stroke="#0a2a44" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Bottom-right: warm spiral galaxy ── */}
      <div style={{ position: "absolute", right: "4%", bottom: "7%", width: "30vw", maxWidth: 118, animation: "floatPlanet 9s ease-in-out infinite", animationDelay: "4.1s" }}>
        <svg viewBox="0 0 120 120" width="100%" height="100%">
          <ellipse cx="60" cy="60" rx="58" ry="26" fill="#3d5a80" opacity="0.5" transform="rotate(-15,60,60)" />
          <ellipse cx="60" cy="60" rx="48" ry="22" fill="#5a7fa0" opacity="0.4" transform="rotate(55,60,60)" />
          <circle cx="60" cy="60" r="28" fill="#e8d5a0" />
          <circle cx="60" cy="60" r="20" fill="#f5e8c0" />
          <circle cx="51" cy="56" r="5.5" fill="white" />
          <circle cx="69" cy="56" r="5.5" fill="white" />
          <circle cx="52.5" cy="57.5" r="2.5" fill="#555" />
          <circle cx="70.5" cy="57.5" r="2.5" fill="#555" />
          <ellipse cx="45" cy="64" rx="6" ry="3.5" fill="#ffb3c6" opacity="0.5" />
          <ellipse cx="75" cy="64" rx="6" ry="3.5" fill="#ffb3c6" opacity="0.5" />
          <path d="M 51 66 Q 60 73 69 66" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

// ─── KID SELECTOR SCREEN ───────────────────────────────────
const AVATARS = ["🦸","🦸‍♀️","🦹","🦹‍♀️","🧑‍🚀","👨‍🚀","🦊","🐉","🦁","🐺","🦅","🐲"];

function KidSelector({ profiles, onSelect, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ id: Date.now().toString(), name: name.trim(), avatar: AVATARS[avatar] });
    setName(""); setAvatar(0); setAdding(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#0c1130 0%,#0a0e27 55%,#0c1530 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 20px", position: "relative", overflowX: "hidden",
    }}>
      <HomeBackground />

      <style>{`
        @keyframes floatPlanet {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes shootingStarAnim {
          0%,100% { opacity: 0; }
          15%,85% { opacity: 0.85; }
        }
        @keyframes titleGlow {
          0%,100% { filter: drop-shadow(0 0 12px #f6c61970); }
          50%      { filter: drop-shadow(0 0 28px #f6c619aa); }
        }
        @keyframes cardSlideIn {
          0%   { opacity: 0; transform: translateY(14px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes addBtnPop {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ks-hero-card:hover  { border-color: rgba(246,198,25,0.7) !important; box-shadow: 0 0 24px rgba(246,198,25,0.25) !important; }
        .ks-delete-btn:hover { background: rgba(232,69,69,0.55) !important; border-color: rgba(232,69,69,0.8) !important; }
        .ks-add-btn:hover    { transform: scale(1.03) !important; box-shadow: 0 8px 32px rgba(74,144,255,0.55) !important; }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, textAlign: "center" }}>

        {/* ── Title ── */}
        <div style={{ animation: "titleGlow 3.5s ease-in-out infinite", marginBottom: 6 }}>
          <div style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: "clamp(50px, 14vw, 74px)",
            color: "#f6c619",
            letterSpacing: "0.03em",
            lineHeight: 1.0,
            textShadow: "3px 3px 0 #c4900a, 6px 6px 0 #7a5800, 0 0 40px rgba(246,198,25,0.4)",
          }}>⚡ WORD</div>
          <div style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: "clamp(50px, 14vw, 74px)",
            color: "#f6c619",
            letterSpacing: "0.03em",
            lineHeight: 1.0,
            textShadow: "3px 3px 0 #c4900a, 6px 6px 0 #7a5800, 0 0 40px rgba(246,198,25,0.4)",
            marginBottom: 8,
          }}>HERO ⚡ ⚡</div>
        </div>

        <div style={{
          fontSize: 13, color: "#7ab8d4", fontFamily: "'Russo One', sans-serif",
          letterSpacing: 6, marginBottom: 44, textTransform: "uppercase",
        }}>
          TRAINING ACADEMY
        </div>

        {/* ── Who's training label ── */}
        <div style={{
          fontSize: 15, color: "#f0f0f0", fontFamily: "'Russo One', sans-serif",
          letterSpacing: 3, marginBottom: 18, fontWeight: 800,
        }}>
          WHO'S TRAINING TODAY?
        </div>

        {/* ── Profile cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
          {profiles.map((kid, idx) => (
            <div key={kid.id} style={{
              display: "flex", gap: 10, alignItems: "center",
              animation: `cardSlideIn 0.4s ease-out ${idx * 0.08}s both`,
            }}>
              <button
                className="ks-hero-card"
                onClick={() => onSelect(kid)}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg,rgba(91,184,212,0.16) 0%,rgba(58,152,176,0.10) 100%)",
                  border: "2.5px solid rgba(246,198,25,0.32)",
                  borderRadius: 20, padding: "15px 18px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                  transition: "border-color 0.22s, box-shadow 0.22s",
                  backdropFilter: "blur(6px)",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 42, lineHeight: 1, flexShrink: 0 }}>{kid.avatar}</span>
                <div>
                  <div style={{
                    fontFamily: "'Russo One', sans-serif",
                    fontSize: "clamp(20px, 5.5vw, 26px)",
                    color: "#f0f0f0", letterSpacing: 1,
                  }}>
                    {kid.name}
                  </div>
                  <div style={{
                    fontFamily: "'Russo One', sans-serif",
                    fontSize: 10, color: "#7ab8d4", letterSpacing: 2.5, marginTop: 3,
                  }}>
                    TAP TO START TRAINING
                  </div>
                </div>
              </button>

              <button
                className="ks-delete-btn"
                onClick={() => { if (confirm(`Remove ${kid.name}'s profile?`)) onDelete(kid.id); }}
                style={{
                  background: "rgba(232,69,69,0.22)",
                  border: "2px solid rgba(232,69,69,0.38)",
                  borderRadius: 14, padding: "11px 13px",
                  cursor: "pointer", color: "#e84545",
                  fontSize: 18, fontWeight: 900, lineHeight: 1,
                  transition: "background 0.18s, border-color 0.18s", flexShrink: 0,
                }}
              >✕</button>
            </div>
          ))}
        </div>

        {/* ── Add hero / form ── */}
        {!adding ? (
          <button
            className="ks-add-btn"
            onClick={() => setAdding(true)}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#2e6fd4 0%,#4a90ff 60%,#5ca8ff 100%)",
              border: "none", borderRadius: 50,
              padding: "18px 28px",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 4px 22px rgba(74,144,255,0.38)",
              transition: "transform 0.22s, box-shadow 0.22s",
              animation: "addBtnPop 0.5s ease-out 0.25s both",
            }}
          >
            <span style={{ fontSize: 22, color: "#f6c619", fontWeight: 900, lineHeight: 1 }}>+</span>
            <span style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: 16, color: "white", letterSpacing: 3, fontWeight: 800,
            }}>ADD A HERO</span>
          </button>
        ) : (
          <div style={{
            background: "linear-gradient(135deg,rgba(24,38,76,0.97) 0%,rgba(17,22,56,0.97) 100%)",
            borderRadius: 24, padding: 22,
            border: "2px solid rgba(74,144,255,0.38)",
            backdropFilter: "blur(12px)",
            animation: "cardSlideIn 0.3s ease-out both",
          }}>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Hero name..."
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              style={{
                width: "100%", background: "rgba(10,14,39,0.85)",
                border: "2px solid rgba(74,144,255,0.45)",
                borderRadius: 14, padding: "13px 16px", color: "#f0f0f0",
                fontSize: 18, fontFamily: "'Russo One', sans-serif", letterSpacing: 2,
                outline: "none", boxSizing: "border-box", marginBottom: 14,
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
              {AVATARS.map((a, i) => (
                <button key={i} onClick={() => setAvatar(i)} style={{
                  fontSize: 28,
                  background: i === avatar ? "rgba(74,144,255,0.22)" : "transparent",
                  border: `2px solid ${i === avatar ? "#4a90ff" : "transparent"}`,
                  borderRadius: 12, padding: 5, cursor: "pointer", lineHeight: 1,
                  transition: "all 0.15s",
                }}>{a}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={() => setAdding(false)} color={C.panel} small
                style={{ border: "1px solid rgba(122,130,166,0.35)", color: C.muted }}>
                CANCEL
              </Btn>
              <Btn onClick={handleAdd} color={C.green} small>
                CREATE HERO
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHUFFLE HELPER ────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── SPEECH RECOGNITION HELPER ─────────────────────────────
function useSpeechRecognition() {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.maxAlternatives = 5;
    rec.onresult = (e) => {
      const alternatives = [];
      for (let i = 0; i < e.results[0].length; i++) {
        alternatives.push(e.results[0][i].transcript.toLowerCase().trim());
      }
      setResult(alternatives.join("|"));
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  const startListening = useCallback(() => {
    setResult("");
    if (recRef.current) {
      try { recRef.current.start(); setListening(true); } catch {}
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch {}
    }
    setListening(false);
  }, []);

  return { listening, result, startListening, stopListening, supported };
}

function wordMatch(spokenResult, target) {
  const alts = spokenResult.split("|");
  const t = target.toLowerCase().trim();
  return alts.some(a => {
    if (a === t) return true;
    // Short words (3 chars or fewer) require exact match only
    if (t.length <= 3) return false;
    // Longer words: allow partial match only if spoken is at least 80% the target's length
    if (a.includes(t)) return true;
    if (t.includes(a) && a.length >= t.length * 0.8) return true;
    return false;
  });
}

// ─── COUNTDOWN TIMER COMPONENT ─────────────────────────────
function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { onExpire(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining <= 0]);

  const pct = (remaining / seconds) * 100;
  const color = remaining <= 3 ? C.red : remaining <= 5 ? C.accent : C.blue;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 120, height: 8, background: C.panel, borderRadius: 8, overflow: "hidden",
        border: `1px solid ${color}30`,
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          borderRadius: 8, transition: "width 1s linear, background 0.3s",
        }} />
      </div>
      <span style={{
        fontFamily: "'Russo One', sans-serif", fontSize: 16, color,
        minWidth: 28, textAlign: "center",
      }}>{remaining}s</span>
    </div>
  );
}

// ─── FLASHCARD MODE (3-ROUND PROGRESSION) ──────────────────
function FlashcardMode({ progress, dispatch, onAdvanceToFindIt }) {
  const [group, setGroup] = useState(0);
  const [idx, setIdx] = useState(0);
  const [exitAnim, setExitAnim] = useState(null);
  const [shuffled, setShuffled] = useState(() => shuffle(WORD_GROUPS[GROUP_NAMES[0]]));
  const [round, setRound] = useState(1); // 1, 2, or 3
  const [roundScores, setRoundScores] = useState({ 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 } });
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [micResult, setMicResult] = useState(null); // "correct" | "wrong" | null
  const [waitingForMic, setWaitingForMic] = useState(false);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [micReady, setMicReady] = useState(false);

  const { listening, result, startListening, stopListening, supported } = useSpeechRecognition();

  const word = shuffled[idx];
  const timerSeconds = round === 2 ? 10 : round === 3 ? 5 : 0;

  // Build word lists: round 1 gets all words, rounds 2&3 exclude mastered
  const getWordsForRound = useCallback((r) => {
    const allGroupWords = WORD_GROUPS[GROUP_NAMES[group]];
    const words = r >= 2
      ? allGroupWords.filter(w => !progress.mastered[w])
      : allGroupWords;
    // If all words are mastered in rounds 2/3, fall back to all words
    const pool = words.length > 0 ? words : allGroupWords;
    return weightedShuffle(pool, progress.wordStats || {}, progress.mastered || {});
  }, [group, progress.mastered, progress.wordStats]);

  // Reset when group changes
  useEffect(() => {
    setShuffled(getWordsForRound(1));
    setIdx(0);
    setRound(1);
    setRoundScores({ 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 } });
    setShowRoundSummary(false);
    setShowFinalSummary(false);
    setShowMicPrompt(false);
    setMicReady(false);
  }, [group]);

  // Round 1: auto-speak when new word appears (debounced to handle StrictMode + group-effect re-renders)
  useEffect(() => {
    if (round !== 1) return;
    const t = setTimeout(() => speak(word), 50);
    return () => clearTimeout(t);
  }, [word]);

  // Rounds 2 & 3: auto-start mic when new word appears (after mic prompt dismissed)
  useEffect(() => {
    if (round >= 2 && micReady && !micResult && !timerExpired) {
      setMicResult(null);
      setWaitingForMic(true);
      startListening();
    }
  }, [word, micReady]);

  // Process speech recognition result
  useEffect(() => {
    if (!result || !waitingForMic) return;
    const matched = wordMatch(result, word);
    setMicResult(matched ? "correct" : "wrong");
    setWaitingForMic(false);
    if (matched) {
      dispatch({ type: "MARK_CORRECT", word });
      setRoundScores(s => ({
        ...s,
        [round]: { correct: s[round].correct + 1, total: s[round].total + 1 }
      }));
    }
    // If wrong, don't auto-advance — let them try again or skip
  }, [result]);

  const handleTimerExpire = () => {
    setTimerExpired(true);
    // Auto-mark as wrong if timer runs out
    dispatch({ type: "MARK_WRONG", word });
    setRoundScores(s => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 }
    }));
  };

  const advanceCard = () => {
    setExitAnim("pushRight");
    setTimerExpired(false);
    setMicResult(null);
    setWaitingForMic(false);
    setTimeout(() => {
      setExitAnim(null);
      if (idx + 1 >= shuffled.length) {
        // End of round
        if (round < 3) {
          setShowRoundSummary(true);
        } else {
          setShowFinalSummary(true);
        }
      } else {
        setIdx(i => i + 1);
      }
    }, 400);
  };

  // Round 1 manual marking
  const markRound1 = (correct) => {
    dispatch({ type: correct ? "MARK_CORRECT" : "MARK_WRONG", word });
    setRoundScores(s => ({
      ...s,
      1: { correct: s[1].correct + (correct ? 1 : 0), total: s[1].total + 1 }
    }));
    setExitAnim(correct ? "pushRight" : "pushLeft");
    setTimerExpired(false);
    setMicResult(null);
    setTimeout(() => {
      setExitAnim(null);
      if (idx + 1 >= shuffled.length) {
        setShowRoundSummary(true);
      } else {
        setIdx(i => i + 1);
      }
    }, 400);
  };

  // Start mic for rounds 2 & 3
  const handleSayIt = () => {
    setMicResult(null);
    setWaitingForMic(true);
    startListening();
  };

  const handleSkipWord = () => {
    dispatch({ type: "MARK_WRONG", word });
    setRoundScores(s => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 }
    }));
    advanceCard();
  };

  const handleMicWrong_TryAgain = () => {
    // Record the failed attempt for this word (tracks retries)
    dispatch({ type: "RECORD_RETRY", word });
    setRoundScores(s => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 }
    }));
    setMicResult(null);
    setWaitingForMic(false);
  };

  // Start next round
  const startNextRound = () => {
    const nextRound = round + 1;
    setRound(nextRound);
    setShuffled(getWordsForRound(nextRound));
    setIdx(0);
    setShowRoundSummary(false);
    setTimerExpired(false);
    setMicResult(null);
    setShowMicPrompt(true);
    setMicReady(false);
  };

  // Calculate final score
  const totalCorrect = roundScores[1].correct + roundScores[2].correct + roundScores[3].correct;
  const totalAttempts = roundScores[1].total + roundScores[2].total + roundScores[3].total;
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const passed = overallPct >= 80;

  // ─── ROUND SUMMARY SCREEN ────────────────────────────────
  if (showRoundSummary) {
    const rs = roundScores[round];
    const pct = rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 16px", animation: "fadeUp 0.4s" }}>
        <div style={{ fontSize: 56 }}>{pct >= 80 ? "💪" : pct >= 50 ? "👊" : "🛡️"}</div>
        <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 24, color: C.accent, letterSpacing: 3 }}>
          ROUND {round} COMPLETE
        </div>
        <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 36, color: pct >= 80 ? C.green : C.accent }}>
          {rs.correct}/{rs.total} ({pct}%)
        </div>
        <div style={{ color: C.muted, fontFamily: "'Russo One', sans-serif", fontSize: 13, letterSpacing: 2, textAlign: "center", maxWidth: 280 }}>
          {round === 1 ? "NEXT: READ THE WORD ALOUD (10s TIMER)" : "NEXT: SPEED ROUND (5s TIMER)"}
        </div>
        <Btn onClick={startNextRound} color={C.green}>
          ⚡ START ROUND {round + 1}
        </Btn>
      </div>
    );
  }

  // ─── FINAL SUMMARY SCREEN ────────────────────────────────
  if (showFinalSummary) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 16px", animation: "fadeUp 0.4s" }}>
        <div style={{ fontSize: 64 }}>{passed ? "🏆" : "💪"}</div>
        <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 22, color: C.accent, letterSpacing: 3 }}>
          ALL 3 ROUNDS DONE
        </div>

        {/* Per-round breakdown */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {[1,2,3].map(r => {
            const rs = roundScores[r];
            const p = rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0;
            return (
              <div key={r} style={{
                background: C.panel, borderRadius: 14, padding: "12px 18px", textAlign: "center",
                border: `1px solid ${p >= 80 ? C.green : C.accent}30`, minWidth: 85,
              }}>
                <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 11, color: C.muted, letterSpacing: 2 }}>
                  ROUND {r}
                </div>
                <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 22, color: p >= 80 ? C.green : C.accent }}>
                  {p}%
                </div>
                <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 10, color: C.muted }}>
                  {rs.correct}/{rs.total}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          fontFamily: "'Russo One', sans-serif", fontSize: 32,
          color: passed ? C.green : C.accent,
          textShadow: passed ? `0 0 20px ${C.green}60` : "none",
          letterSpacing: 3,
        }}>
          {overallPct}% OVERALL
        </div>

        {passed ? (
          <>
            <div style={{ color: C.green, fontFamily: "'Russo One', sans-serif", fontSize: 14, letterSpacing: 2, textAlign: "center" }}>
              ⚡ YOU CRUSHED IT! TIME FOR FIND IT! ⚡
            </div>
            <Btn onClick={() => onAdvanceToFindIt(group)} color={C.green}>
              🔍 GO TO FIND IT
            </Btn>
          </>
        ) : (
          <>
            <div style={{ color: C.muted, fontFamily: "'Russo One', sans-serif", fontSize: 13, letterSpacing: 2, textAlign: "center" }}>
              NEED 80% TO UNLOCK FIND IT — KEEP TRAINING!
            </div>
            <Btn onClick={() => {
              setRound(1);
              setRoundScores({ 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 } });
              setShuffled(getWordsForRound(1));
              setIdx(0); setShowFinalSummary(false);
            }}>
              ⚡ TRY AGAIN
            </Btn>
          </>
        )}
      </div>
    );
  }

  // ─── MIC PROMPT MODAL (shown at start of rounds 2 & 3) ──
  if (showMicPrompt) {
    const isSpeedRound = round + 1 === 3;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "40px 24px", animation: "fadeUp 0.4s" }}>
        <div style={{ fontSize: 64 }}>🎤</div>
        <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 22, color: C.accent, letterSpacing: 3, textAlign: "center" }}>
          {isSpeedRound ? "SPEED ROUND!" : "TIME TO SPEAK!"}
        </div>
        <div style={{
          background: C.panel, borderRadius: 16, padding: "16px 20px", maxWidth: 300,
          border: `2px solid ${C.blue}40`, textAlign: "center",
        }}>
          <div style={{ color: C.text, fontFamily: "'Russo One', sans-serif", fontSize: 13, letterSpacing: 1, lineHeight: 1.7 }}>
            This round will listen to you! Say each word out loud when the card flips.
            {isSpeedRound ? " You only have 5 seconds!" : " You have 10 seconds!"}
          </div>
        </div>
        <Btn onClick={() => { setShowMicPrompt(false); setMicReady(true); }} color={C.green}>
          🎤 I'M READY — LET'S GO!
        </Btn>
      </div>
    );
  }

  // ─── CARD VIEW ────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 16px 24px" }}>
      <GroupSelector selected={group} onChange={i => { setGroup(i); }} />

      {/* Round indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {[1,2,3].map(r => (
          <div key={r} style={{
            width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: r === round ? `linear-gradient(135deg, ${C.accent}, ${C.red})` : r < round ? C.green : C.panel,
            color: r <= round ? C.bg : C.muted,
            fontFamily: "'Russo One', sans-serif", fontSize: 14, fontWeight: 800,
            border: `2px solid ${r === round ? C.accent : r < round ? C.green : C.muted + "30"}`,
            boxShadow: r === round ? `0 0 12px ${C.accent}50` : "none",
          }}>{r}</div>
        ))}
        <span style={{ color: C.muted, fontFamily: "'Russo One', sans-serif", fontSize: 11, letterSpacing: 2, marginLeft: 4 }}>
          {round === 1 ? "LISTEN & LEARN" : round === 2 ? "SAY IT (10s)" : "SPEED (5s)"}
        </span>
      </div>

      <div style={{ color: C.muted, fontSize: 12, fontFamily: "'Russo One', sans-serif", letterSpacing: 2 }}>
        WORD {idx + 1} OF {shuffled.length}
        {round >= 2 && Object.keys(progress.mastered).filter(w => WORD_GROUPS[GROUP_NAMES[group]].includes(w)).length > 0 && (
          <span style={{ color: C.green, marginLeft: 8, fontSize: 10 }}>
            ({Object.keys(progress.mastered).filter(w => WORD_GROUPS[GROUP_NAMES[group]].includes(w)).length} mastered)
          </span>
        )}
      </div>

      {/* Timer for rounds 2 & 3 */}
      {round >= 2 && !timerExpired && !micResult && (
        <CountdownTimer
          key={`${round}-${idx}`}
          seconds={timerSeconds}
          onExpire={handleTimerExpire}
        />
      )}

      {/* Card */}
      <div style={{
        width: 300, height: 210,
        animation: exitAnim ? `${exitAnim} 0.5s cubic-bezier(0.4, 0, 1, 1) forwards` : "cardEnter 0.35s ease-out",
      }}>
        <div style={{
          width: "100%", height: "100%",
          background: timerExpired ? `linear-gradient(135deg, ${C.red}, #8b0000)` :
                      micResult === "correct" ? `linear-gradient(135deg, ${C.green}, #1a8a4a)` :
                      micResult === "wrong" ? `linear-gradient(135deg, ${C.red}, #8b0000)` :
                      `linear-gradient(135deg, ${C.accent}, ${C.red})`,
          borderRadius: 20,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 40px ${C.accent}40, 0 8px 32px rgba(0,0,0,0.4)`,
          transition: "background 0.3s",
        }}>
          <div style={{
            fontSize: 64, fontFamily: "'Russo One', sans-serif", color: C.bg,
            textShadow: "2px 2px 0 rgba(255,255,255,0.2)", letterSpacing: 4,
          }}>{word}</div>
          {round === 1 && (
            <button onClick={e => { e.stopPropagation(); speak(word); }}
              style={{
                marginTop: 8, background: "rgba(0,0,0,0.2)", border: "2px solid rgba(0,0,0,0.3)",
                borderRadius: 20, padding: "4px 16px", color: C.bg,
                fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Russo One', sans-serif",
              }}>🔊 HEAR IT</button>
          )}
        </div>
      </div>

      {/* Controls based on round */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>

          {/* ROUND 1: Manual got-it / learning + voice plays */}
          {round === 1 && !micResult && (
            <div style={{ display: "flex", gap: 14 }}>
              <Btn onClick={() => markRound1(false)} color={C.red}>✗ LEARNING</Btn>
              <Btn onClick={() => markRound1(true)} color={C.green}>⚡ GOT IT!</Btn>
            </div>
          )}

          {listening && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              color: C.blue, fontFamily: "'Russo One', sans-serif", fontSize: 15, letterSpacing: 2,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%", background: C.red,
                animation: "starPulse 0.8s ease-in-out infinite",
              }} />
              LISTENING...
            </div>
          )}

          {micResult === "correct" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                fontFamily: "'Russo One', sans-serif", fontSize: 20, color: C.green,
                letterSpacing: 3, textShadow: `0 0 12px ${C.green}60`,
              }}>⚡ PERFECT! ⚡</div>
              <Btn onClick={advanceCard} color={C.green} small>NEXT →</Btn>
            </div>
          )}

          {micResult === "wrong" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                fontFamily: "'Russo One', sans-serif", fontSize: 16, color: C.red,
                letterSpacing: 2,
              }}>NOT QUITE — TRY AGAIN!</div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn onClick={() => { handleMicWrong_TryAgain(); setTimeout(handleSayIt, 100); }} color={C.blue} small>🎤 RETRY</Btn>
                <Btn onClick={handleSkipWord} color={C.red} small>SKIP →</Btn>
              </div>
            </div>
          )}

          {timerExpired && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                fontFamily: "'Russo One', sans-serif", fontSize: 16, color: C.red,
                letterSpacing: 2,
              }}>⏱️ TIME'S UP!</div>
              <Btn onClick={advanceCard} color={C.accent} small>NEXT →</Btn>
            </div>
          )}

          {/* Fallback if mic not supported (rounds 2 & 3) */}
          {round >= 2 && !supported && !timerExpired && !micResult && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ color: C.muted, fontFamily: "'Russo One', sans-serif", fontSize: 11, letterSpacing: 1 }}>
                MIC NOT AVAILABLE — MARK MANUALLY
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <Btn onClick={() => {
                  dispatch({ type: "MARK_WRONG", word });
                  setRoundScores(s => ({ ...s, [round]: { ...s[round], total: s[round].total + 1 } }));
                  advanceCard();
                }} color={C.red} small>✗ LEARNING</Btn>
                <Btn onClick={() => {
                  dispatch({ type: "MARK_CORRECT", word });
                  setRoundScores(s => ({ ...s, [round]: { correct: s[round].correct + 1, total: s[round].total + 1 } }));
                  advanceCard();
                }} color={C.green} small>⚡ GOT IT!</Btn>
              </div>
            </div>
          )}
        </div>

      {/* Round score so far */}
      {roundScores[round].total > 0 && (
        <div style={{ color: C.muted, fontFamily: "'Russo One', sans-serif", fontSize: 11, letterSpacing: 2 }}>
          ROUND {round}: {roundScores[round].correct}/{roundScores[round].total} CORRECT
        </div>
      )}
    </div>
  );
}

// ─── FIND IT GAME ──────────────────────────────────────────
function FindItGame({ progress, dispatch, initialGroup = 0 }) {
  const [group, setGroup] = useState(initialGroup);
  const [target, setTarget] = useState("");
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [shakeWord, setShakeWord] = useState(null);
  const [combo, setCombo] = useState(0);
  const TOTAL = 10;

  const genRound = useCallback(() => {
    const words = WORD_GROUPS[GROUP_NAMES[group]];
    // Use weighted selection: struggling words appear more often as targets
    const weighted = weightedShuffle(words, progress.wordStats || {}, progress.mastered || {});
    const t = weighted[0]; // Pick the highest-weighted word as target
    const others = words.filter(w => w !== t).sort(() => Math.random() - 0.5).slice(0, 3);
    setTarget(t);
    setOptions([...others, t].sort(() => Math.random() - 0.5));
    setFeedback(null);
    setShakeWord(null);
    speak(t);
  }, [group, progress.wordStats, progress.mastered]);

  useEffect(() => { genRound(); }, [genRound, round]);

  const handlePick = (w) => {
    if (feedback) return;
    if (w === target) {
      setFeedback("correct");
      setCombo(c => c + 1);
      dispatch({ type: "MARK_CORRECT", word: target });
      setScore(s => s + 1);
      setTimeout(() => {
        if (round + 1 < TOTAL) setRound(r => r + 1);
        else setFeedback("done");
      }, 1000);
    } else {
      setFeedback("wrong");
      setShakeWord(w);
      setCombo(0);
      dispatch({ type: "MARK_WRONG", word: target });
      setTimeout(() => { setFeedback(null); setShakeWord(null); }, 800);
    }
  };

  const restart = () => { setRound(0); setScore(0); setCombo(0); setFeedback(null); };

  if (feedback === "done") {
    const msg = score >= 9 ? "LEGENDARY HERO!" : score >= 7 ? "SUPER HERO!" : score >= 5 ? "HERO IN TRAINING!" : "KEEP GOING, HERO!";
    return (
      <div style={{ textAlign: "center", padding: "40px 16px", animation: "fadeUp 0.4s ease-out" }}>
        <div style={{ fontSize: 80, marginBottom: 8 }}>🏆</div>
        <div style={{
          fontSize: 40, fontFamily: "'Russo One', sans-serif", color: C.accent,
          textShadow: `0 0 25px ${C.accent}60`, letterSpacing: 4,
        }}>{score}/{TOTAL}</div>
        <div style={{ color: C.green, fontFamily: "'Russo One', sans-serif", fontSize: 22, letterSpacing: 3, margin: "8px 0 24px" }}>
          {msg}
        </div>
        <Btn onClick={restart}>⚡ PLAY AGAIN</Btn>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "16px 16px 24px" }}>
      <GroupSelector selected={group} onChange={i => { setGroup(i); restart(); }} />

      {/* Score + Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: C.accent, fontFamily: "'Russo One', sans-serif", fontSize: 16, letterSpacing: 2 }}>
          ⚡ {score}
        </span>
        <div style={{
          width: 140, height: 8, background: C.panel, borderRadius: 8, overflow: "hidden",
          border: `1px solid ${C.accent}20`,
        }}>
          <div style={{
            width: `${(round / TOTAL) * 100}%`, height: "100%",
            background: `linear-gradient(90deg, ${C.accent}, ${C.red})`,
            borderRadius: 8, transition: "width 0.3s",
          }} />
        </div>
        <span style={{ color: C.muted, fontFamily: "'Russo One', sans-serif", fontSize: 12 }}>
          {round + 1}/{TOTAL}
        </span>
      </div>

      {combo >= 3 && (
        <div style={{
          color: C.accent, fontFamily: "'Russo One', sans-serif", fontSize: 14, letterSpacing: 3,
          textShadow: `0 0 10px ${C.accent}60`, animation: "fadeUp 0.3s ease-out",
        }}>🔥 {combo}x COMBO!</div>
      )}

      {/* Hear word */}
      <div style={{
        background: C.panel, borderRadius: 20, padding: "16px 28px",
        border: `2px solid ${C.accent}30`, textAlign: "center",
        boxShadow: `0 0 25px ${C.accent}10`,
      }}>
        <div style={{ color: C.muted, fontSize: 11, fontFamily: "'Russo One', sans-serif", letterSpacing: 3, marginBottom: 8 }}>
          🔊 FIND THE WORD
        </div>
        <button onClick={() => speak(target)} style={{
          background: `linear-gradient(135deg, ${C.accent}, ${C.red})`,
          border: "none", borderRadius: 14, padding: "10px 28px", cursor: "pointer",
          fontSize: 17, fontWeight: 800, color: C.bg,
          fontFamily: "'Russo One', sans-serif", letterSpacing: 3,
          boxShadow: `0 4px 15px ${C.accent}40`,
        }}>🔊 HEAR AGAIN</button>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 320 }}>
        {options.map(w => {
          const correct = feedback === "correct" && w === target;
          const wrong = shakeWord === w;
          return (
            <button key={w} onClick={() => handlePick(w)} style={{
              background: correct ? C.green : wrong ? C.red : C.panel,
              border: `2px solid ${correct ? C.green : wrong ? C.red : C.accent + "25"}`,
              borderRadius: 16, padding: "18px 14px", cursor: "pointer",
              fontSize: 26, fontWeight: 800, fontFamily: "'Russo One', sans-serif",
              color: C.text, letterSpacing: 3,
              boxShadow: correct ? `0 0 20px ${C.green}50` : `0 4px 12px rgba(0,0,0,0.3)`,
              transition: "all 0.15s",
              animation: wrong ? "shake 0.4s ease" : correct ? "correctPop 0.3s ease" : "none",
            }}>{w}</button>
          );
        })}
      </div>

      {feedback === "correct" && (
        <div style={{
          fontSize: 20, fontFamily: "'Russo One', sans-serif", color: C.green,
          animation: "fadeUp 0.3s", letterSpacing: 3,
          textShadow: `0 0 12px ${C.green}60`,
        }}>
          {["⚡ HEROIC!", "💥 BOOM!", "🔥 SUPER!", "⭐ AMAZING!"][Math.floor(Math.random() * 4)]}
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS TRACKER ──────────────────────────────────────
function ProgressTracker({ progress, kidName }) {
  const masteredCount = Object.keys(progress.mastered).length;
  const learningCount = Object.keys(progress.learning).length;
  const pct = Math.round((masteredCount / ALL_WORDS.length) * 100);
  const accuracy = progress.totalAttempts > 0
    ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100) : 0;
  const ws = progress.wordStats || {};

  // Find words needing review (mastered but approaching 7-day limit)
  const now = Date.now();
  const reviewWarningCutoff = now - 5 * 24 * 60 * 60 * 1000; // warn at 5 days
  const needsReview = Object.keys(progress.mastered).filter(w => {
    const stat = ws[w];
    const lastSeen = stat ? stat.lastSeen : progress.mastered[w];
    return lastSeen && lastSeen < reviewWarningCutoff;
  });

  // Find struggling words (attempted 3+ times with < 60% accuracy)
  const strugglingWords = ALL_WORDS.filter(w => {
    const stat = ws[w];
    if (!stat || stat.attempts < 3) return false;
    return (stat.correct / stat.attempts) < 0.6;
  }).sort((a, b) => {
    const aAcc = ws[a].correct / ws[a].attempts;
    const bAcc = ws[b].correct / ws[b].attempts;
    return aAcc - bAcc;
  });

  // Rank system
  const rank = masteredCount >= 60 ? "LEGENDARY HERO" :
    masteredCount >= 40 ? "SUPER HERO" :
    masteredCount >= 20 ? "RISING HERO" :
    masteredCount >= 5 ? "HERO IN TRAINING" : "NEW RECRUIT";

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      {/* Hero rank */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>
          {masteredCount >= 60 ? "👑" : masteredCount >= 40 ? "🦸" : masteredCount >= 20 ? "⚡" : "🛡️"}
        </div>
        <div style={{
          fontFamily: "'Russo One', sans-serif", fontSize: 20, color: C.accent, letterSpacing: 3,
          textShadow: `0 0 15px ${C.accent}40`,
        }}>{rank}</div>
        <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, color: C.muted, letterSpacing: 2 }}>
          {kidName.toUpperCase()}'S HERO PROFILE
        </div>
      </div>

      {/* Needs Review Alert */}
      {needsReview.length > 0 && (
        <div style={{
          background: `${C.red}15`, borderRadius: 14, padding: 14, marginBottom: 16,
          border: `2px solid ${C.red}40`, animation: "fadeUp 0.4s",
        }}>
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 13, color: C.red, letterSpacing: 2, marginBottom: 8 }}>
            THESE WORDS NEED REVIEW
          </div>
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>
            Practice these soon or they'll lose mastery!
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {needsReview.map(w => {
              const stat = ws[w];
              const daysAgo = stat ? Math.floor((now - stat.lastSeen) / (24 * 60 * 60 * 1000)) : "?";
              return (
                <span key={w} style={{
                  padding: "3px 8px", borderRadius: 8, fontSize: 12,
                  fontWeight: 700, fontFamily: "'Russo One', sans-serif", letterSpacing: 1,
                  background: C.red + "20", color: C.red,
                  border: `1px solid ${C.red}35`,
                }}>
                  {w} <span style={{ fontSize: 9, opacity: 0.7 }}>{daysAgo}d</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Struggling Words Alert */}
      {strugglingWords.length > 0 && (
        <div style={{
          background: `${C.accent}10`, borderRadius: 14, padding: 14, marginBottom: 16,
          border: `2px solid ${C.accent}30`,
        }}>
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 13, color: C.accent, letterSpacing: 2, marginBottom: 8 }}>
            TOUGH WORDS
          </div>
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>
            These words need extra practice
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {strugglingWords.slice(0, 10).map(w => {
              const stat = ws[w];
              const wordAcc = Math.round((stat.correct / stat.attempts) * 100);
              return (
                <span key={w} style={{
                  padding: "3px 8px", borderRadius: 8, fontSize: 12,
                  fontWeight: 700, fontFamily: "'Russo One', sans-serif", letterSpacing: 1,
                  background: C.accent + "15", color: C.accent,
                  border: `1px solid ${C.accent}25`,
                }}>
                  {w} <span style={{ fontSize: 9, opacity: 0.7 }}>{wordAcc}% ({stat.attempts}x)</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "MASTERED", value: masteredCount, color: C.green, icon: "🛡️" },
          { label: "LEARNING", value: learningCount, color: C.accent, icon: "⚡" },
          { label: "ACCURACY", value: `${accuracy}%`, color: C.blue, icon: "🎯" },
          { label: "SESSIONS", value: progress.sessions || 0, color: C.purple, icon: "📅" },
        ].map(s => (
          <div key={s.label} style={{
            background: C.panel, borderRadius: 14, padding: "12px 16px",
            textAlign: "center", border: `1px solid ${s.color}25`,
            boxShadow: `0 0 15px ${s.color}10`, minWidth: 75,
          }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontFamily: "'Russo One', sans-serif", color: s.color, letterSpacing: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: "'Russo One', sans-serif", letterSpacing: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Power bar */}
      <div style={{ maxWidth: 380, margin: "0 auto 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: C.muted, fontFamily: "'Russo One', sans-serif", fontSize: 11, letterSpacing: 2 }}>HERO POWER</span>
          <span style={{ color: C.accent, fontFamily: "'Russo One', sans-serif", fontSize: 11 }}>{masteredCount}/{ALL_WORDS.length}</span>
        </div>
        <div style={{
          height: 12, background: C.panel, borderRadius: 8, overflow: "hidden",
          border: `1px solid ${C.accent}20`,
        }}>
          <div style={{
            width: `${pct}%`, height: "100%",
            background: `linear-gradient(90deg, ${C.blue}, ${C.accent}, ${C.red})`,
            borderRadius: 8, transition: "width 0.6s",
            boxShadow: `0 0 12px ${C.accent}40`,
          }} />
        </div>
      </div>

      {/* Word groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {GROUP_NAMES.map(gn => {
          const words = WORD_GROUPS[gn];
          const gm = words.filter(w => progress.mastered[w]).length;
          return (
            <div key={gn} style={{
              background: C.panel, borderRadius: 14, padding: 14,
              border: `1px solid ${C.accent}15`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Russo One', sans-serif", color: C.text, fontSize: 14, letterSpacing: 1 }}>{gn}</span>
                <span style={{ fontFamily: "'Russo One', sans-serif", color: gm === words.length ? C.green : C.accent, fontSize: 12 }}>
                  {gm === words.length ? "✓ COMPLETE" : `${gm}/${words.length}`}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {words.map(w => {
                  const stat = ws[w];
                  const hasStats = stat && stat.attempts > 0;
                  const wordAcc = hasStats ? Math.round((stat.correct / stat.attempts) * 100) : null;
                  const sessionsLeft = hasStats ? Math.max(0, MASTERY_SESSIONS - (stat.sessionsCorrect || 0)) : MASTERY_SESSIONS;
                  return (
                    <span key={w} style={{
                      padding: "3px 8px", borderRadius: 8, fontSize: 12,
                      fontWeight: 700, fontFamily: "'Russo One', sans-serif", letterSpacing: 1,
                      background: progress.mastered[w] ? C.green + "20" :
                                 progress.learning[w] ? C.accent + "15" : C.bg,
                      color: progress.mastered[w] ? C.green :
                             progress.learning[w] ? C.accent : C.muted + "80",
                      border: `1px solid ${progress.mastered[w] ? C.green + "35" :
                               progress.learning[w] ? C.accent + "25" : C.muted + "15"}`,
                      position: "relative",
                    }} title={hasStats ? `${wordAcc}% accuracy, ${stat.attempts} attempts, ${sessionsLeft} sessions to mastery` : "Not practiced yet"}>
                      {progress.mastered[w] && "★ "}{w}
                      {hasStats && !progress.mastered[w] && (
                        <span style={{ fontSize: 8, opacity: 0.6, marginLeft: 2 }}>{wordAcc}%</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────
export default function WordHeroApp() {
  const [profiles, setProfiles] = useState(null);
  const [activeKid, setActiveKid] = useState(null);
  const [mode, setMode] = useState("flash");
  const [findItGroup, setFindItGroup] = useState(0);
  const [progress, dispatch] = useReducer(progressReducer, null, initProgress);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  // Load profiles on mount
  useEffect(() => {
    const p = loadProfiles();
    setProfiles(p || []);
    setLoaded(true);
  }, []);

  // Load kid progress when selected
  useEffect(() => {
    if (!activeKid) return;
    const p = loadKidProgress(activeKid.id);
    dispatch({ type: "LOAD", data: p });
    dispatch({ type: "NEW_SESSION" });
    // Check for 7-day mastery decay after loading
    setTimeout(() => dispatch({ type: "CHECK_REVIEW_DECAY" }), 100);
  }, [activeKid]);

  // Auto-save progress on changes (debounced)
  useEffect(() => {
    if (!activeKid) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveKidProgress(activeKid.id, progress);
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [progress, activeKid]);

  const addKid = (kid) => {
    const next = [...(profiles || []), kid];
    setProfiles(next);
    saveProfiles(next);
  };

  const deleteKid = (id) => {
    const next = profiles.filter(k => k.id !== id);
    setProfiles(next);
    saveProfiles(next);
    try { localStorage.removeItem(`word-hero-progress-${id}`); } catch {}
  };

  const selectKid = (kid) => {
    setActiveKid(kid);
    setMode("flash");
  };

  if (!loaded) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: C.accent, fontFamily: "'Russo One', sans-serif", fontSize: 24, letterSpacing: 4, animation: "starPulse 1.5s ease-in-out infinite" }}>
          ⚡ LOADING... ⚡
        </div>
      </div>
    );
  }

  if (!activeKid) {
    return <KidSelector profiles={profiles} onSelect={selectKid} onAdd={addKid} onDelete={deleteKid} />;
  }

  const modes = [
    { key: "flash", label: "FLASH", icon: "⚡" },
    { key: "find", label: "FIND IT", icon: "🔍" },
    { key: "stats", label: "STATS", icon: "🛡️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet" />
      <StarField />

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 8px", position: "relative", zIndex: 1,
      }}>
        <button onClick={() => { setActiveKid(null); }} style={{
          background: C.panel, border: `1px solid ${C.muted}30`, borderRadius: 10,
          padding: "6px 12px", cursor: "pointer", color: C.muted,
          fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: 1,
        }}>← SWITCH</button>

        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 22, fontFamily: "'Russo One', sans-serif", color: C.accent,
            letterSpacing: 4, textShadow: `0 0 15px ${C.accent}40, 1px 1px 0 ${C.red}`,
          }}>⚡ WORD HERO ⚡</div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 6, background: C.panel,
          borderRadius: 10, padding: "4px 10px", border: `1px solid ${C.accent}20`,
        }}>
          <span style={{ fontSize: 20 }}>{activeKid.avatar}</span>
          <span style={{ fontFamily: "'Russo One', sans-serif", color: C.text, fontSize: 13, letterSpacing: 1 }}>
            {activeKid.name}
          </span>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 6, padding: "8px 16px 4px",
        position: "relative", zIndex: 1,
      }}>
        {modes.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)} style={{
            background: mode === m.key
              ? `linear-gradient(135deg, ${C.accent}, ${C.red})`
              : C.panel,
            color: mode === m.key ? C.bg : C.muted,
            border: `2px solid ${mode === m.key ? C.accent : "transparent"}`,
            borderRadius: 12, padding: "8px 16px", cursor: "pointer",
            fontWeight: 800, fontSize: 12, fontFamily: "'Russo One', sans-serif",
            letterSpacing: 2, transition: "all 0.2s",
            boxShadow: mode === m.key ? `0 4px 12px ${C.accent}35` : "none",
          }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
        {mode === "flash" && <FlashcardMode progress={progress} dispatch={dispatch} onAdvanceToFindIt={(g) => { setFindItGroup(g); setMode("find"); }} />}
        {mode === "find" && <FindItGame progress={progress} dispatch={dispatch} initialGroup={findItGroup} />}
        {mode === "stats" && <ProgressTracker progress={progress} kidName={activeKid.name} />}
      </div>

      {/* Reset */}
      <div style={{ textAlign: "center", padding: "16px 0 40px", position: "relative", zIndex: 1 }}>
        <button onClick={() => { if (confirm(`Reset ${activeKid.name}'s progress?`)) dispatch({ type: "RESET" }); }}
          style={{
            background: "transparent", border: `1px solid ${C.muted}30`,
            color: C.muted, borderRadius: 8, padding: "5px 14px",
            fontSize: 10, cursor: "pointer", fontFamily: "'Russo One', sans-serif", letterSpacing: 2,
          }}>RESET PROGRESS</button>
      </div>

      <style>{`
        @keyframes starPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes cardEnter {
          0% { opacity: 0; transform: scale(0.88) translateY(28px); }
          65% { opacity: 1; transform: scale(1.02) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pushRight {
          0% { transform: translateX(0) rotate(0deg) scale(1); opacity: 1; }
          18% { transform: translateX(-8px) rotate(-1.5deg) scale(0.97); opacity: 1; }
          100% { transform: translateX(320px) rotate(22deg) scale(0.82); opacity: 0; }
        }
        @keyframes pushLeft {
          0% { transform: translateX(0) rotate(0deg) scale(1); opacity: 1; }
          18% { transform: translateX(8px) rotate(1.5deg) scale(0.97); opacity: 1; }
          100% { transform: translateX(-320px) rotate(-22deg) scale(0.82); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes correctPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:active { transform: scale(0.96) !important; }
        input::placeholder { color: ${C.muted}80; }
      `}</style>
    </div>
  );
}
