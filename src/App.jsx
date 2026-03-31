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
function initProgress() {
  return { mastered: {}, learning: {}, streaks: {}, totalCorrect: 0, totalAttempts: 0, sessions: 0 };
}

function progressReducer(state, action) {
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
        return { ...state, mastered, learning, streaks, totalCorrect, totalAttempts };
      }
      return { ...state, learning: { ...state.learning, [w]: true }, streaks, totalCorrect, totalAttempts };
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
      minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24, position: "relative",
    }}>
      <StarField />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{
          fontSize: 42, fontFamily: "'Russo One', sans-serif", color: C.accent, letterSpacing: 6,
          textShadow: `0 0 30px ${C.accent}50, 2px 2px 0 ${C.red}`,
          marginBottom: 4,
        }}>
          ⚡ WORD HERO ⚡
        </div>
        <div style={{ fontSize: 14, color: C.muted, fontFamily: "'Russo One', sans-serif", letterSpacing: 4, marginBottom: 36 }}>
          TRAINING ACADEMY
        </div>

        <div style={{ fontSize: 15, color: C.text, fontFamily: "'Russo One', sans-serif", letterSpacing: 3, marginBottom: 16 }}>
          WHO'S TRAINING TODAY?
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {profiles.map(kid => (
            <div key={kid.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => onSelect(kid)} style={{
                flex: 1, background: C.panel, border: `2px solid ${C.accent}30`, borderRadius: 16,
                padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 20px ${C.accent}30`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.accent + "30"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ fontSize: 36 }}>{kid.avatar}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 22, color: C.text, letterSpacing: 2 }}>
                    {kid.name}
                  </div>
                  <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 11, color: C.muted, letterSpacing: 2 }}>
                    TAP TO START TRAINING
                  </div>
                </div>
              </button>
              <button onClick={() => { if (confirm(`Remove ${kid.name}'s profile?`)) onDelete(kid.id); }}
                style={{
                  background: "transparent", border: `1px solid ${C.muted}30`, borderRadius: 10,
                  padding: "8px 10px", cursor: "pointer", color: C.muted, fontSize: 14,
                  fontFamily: "'Russo One', sans-serif",
                }}>✕</button>
            </div>
          ))}
        </div>

        {!adding ? (
          <Btn onClick={() => setAdding(true)} color={C.blue} style={{ width: "100%" }}>
            + ADD A HERO
          </Btn>
        ) : (
          <div style={{
            background: C.panel, borderRadius: 20, padding: 20,
            border: `2px solid ${C.blue}40`,
          }}>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Hero name..."
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              style={{
                width: "100%", background: C.bg, border: `2px solid ${C.blue}40`,
                borderRadius: 12, padding: "12px 16px", color: C.text,
                fontSize: 18, fontFamily: "'Russo One', sans-serif", letterSpacing: 2,
                outline: "none", boxSizing: "border-box", marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 14 }}>
              {AVATARS.map((a, i) => (
                <button key={i} onClick={() => setAvatar(i)} style={{
                  fontSize: 28, background: i === avatar ? C.blue + "30" : "transparent",
                  border: `2px solid ${i === avatar ? C.blue : "transparent"}`,
                  borderRadius: 12, padding: 4, cursor: "pointer", lineHeight: 1,
                }}>{a}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={() => setAdding(false)} color={C.panel} small style={{ border: `1px solid ${C.muted}40`, color: C.muted }}>
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

  // Reset when group changes
  useEffect(() => {
    setShuffled(shuffle(WORD_GROUPS[GROUP_NAMES[group]]));
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
    setMicResult(null);
    setWaitingForMic(false);
  };

  // Start next round
  const startNextRound = () => {
    setRound(r => r + 1);
    setShuffled(shuffle(WORD_GROUPS[GROUP_NAMES[group]]));
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
              setShuffled(shuffle(WORD_GROUPS[GROUP_NAMES[group]]));
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
                <Btn onClick={handleSayIt} color={C.blue} small>🎤 RETRY</Btn>
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
    const t = words[Math.floor(Math.random() * words.length)];
    const others = words.filter(w => w !== t).sort(() => Math.random() - 0.5).slice(0, 3);
    setTarget(t);
    setOptions([...others, t].sort(() => Math.random() - 0.5));
    setFeedback(null);
    setShakeWord(null);
    speak(t);
  }, [group]);

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
                {words.map(w => (
                  <span key={w} style={{
                    padding: "3px 8px", borderRadius: 8, fontSize: 12,
                    fontWeight: 700, fontFamily: "'Russo One', sans-serif", letterSpacing: 1,
                    background: progress.mastered[w] ? C.green + "20" :
                               progress.learning[w] ? C.accent + "15" : C.bg,
                    color: progress.mastered[w] ? C.green :
                           progress.learning[w] ? C.accent : C.muted + "80",
                    border: `1px solid ${progress.mastered[w] ? C.green + "35" :
                             progress.learning[w] ? C.accent + "25" : C.muted + "15"}`,
                  }}>
                    {progress.mastered[w] && "★ "}{w}
                  </span>
                ))}
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
