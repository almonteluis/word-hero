import { useState, useEffect, useCallback, useReducer, useRef } from "react";
import { WORD_GROUPS, ALL_WORDS, GROUP_NAMES, C } from "./constants";
import {
  loadProfiles,
  saveProfiles,
  loadKidProgress,
  saveKidProgress,
  loadNotificationPrefs,
  saveNotificationPrefs,
} from "./utils/storage";
import {
  MASTERY_SESSIONS,
  initProgress,
  progressReducer,
  weightedShuffle,
} from "./utils/progress";
import { speak } from "./utils/speech";
import { shuffle } from "./utils/shuffle";
import { useSpeechRecognition, wordMatch } from "./utils/speechRecognition";
import StarField from "./components/StarField";
import GroupSelector from "./components/GroupSelector";
import Btn from "./components/Btn";
import HomeBackground from "./components/HomeBackground";
import CountdownTimer from "./components/CountdownTimer";
import DailyReminderSettings from "./components/DailyReminderSettings";
import GlobalStyles from "./styles/animations.jsx";

// ─── KID SELECTOR SCREEN ───────────────────────────────────
const AVATARS = [
  "🦸",
  "🦸‍♀️",
  "🦹",
  "🦹‍♀️",
  "🧑‍🚀",
  "👨‍🚀",
  "🦊",
  "🐉",
  "🦁",
  "🐺",
  "🦅",
  "🐲",
];

function KidSelector({ profiles, onSelect, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      id: Date.now().toString(),
      name: name.trim(),
      avatar: AVATARS[avatar],
    });
    setName("");
    setAvatar(0);
    setAdding(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#0c1130 0%,#0a0e27 55%,#0c1530 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <HomeBackground />

      <style>{`
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        {/* ── Title ── */}
        <div
          style={{
            animation: "titleGlow 3.5s ease-in-out infinite",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: "clamp(50px, 14vw, 74px)",
              color: "#f6c619",
              letterSpacing: "0.03em",
              lineHeight: 1.0,
              textShadow:
                "3px 3px 0 #c4900a, 6px 6px 0 #7a5800, 0 0 40px rgba(246,198,25,0.4)",
            }}
          >
            ⚡ WORD
          </div>
          <div
            style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: "clamp(50px, 14vw, 74px)",
              color: "#f6c619",
              letterSpacing: "0.03em",
              lineHeight: 1.0,
              textShadow:
                "3px 3px 0 #c4900a, 6px 6px 0 #7a5800, 0 0 40px rgba(246,198,25,0.4)",
              marginBottom: 8,
            }}
          >
            HERO ⚡ ⚡
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#7ab8d4",
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 6,
            marginBottom: 44,
            textTransform: "uppercase",
          }}
        >
          TRAINING ACADEMY
        </div>

        {/* ── Who's training label ── */}
        <div
          style={{
            fontSize: 15,
            color: "#f0f0f0",
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 3,
            marginBottom: 18,
            fontWeight: 800,
          }}
        >
          WHO'S TRAINING TODAY?
        </div>

        {/* ── Profile cards ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {profiles.map((kid, idx) => (
            <div
              key={kid.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                animation: `cardSlideIn 0.4s ease-out ${idx * 0.08}s both`,
              }}
            >
              <button
                className="ks-hero-card"
                onClick={() => onSelect(kid)}
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg,rgba(91,184,212,0.16) 0%,rgba(58,152,176,0.10) 100%)",
                  border: "2.5px solid rgba(246,198,25,0.32)",
                  borderRadius: 20,
                  padding: "15px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "border-color 0.22s, box-shadow 0.22s",
                  backdropFilter: "blur(6px)",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 42, lineHeight: 1, flexShrink: 0 }}>
                  {kid.avatar}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: "clamp(20px, 5.5vw, 26px)",
                      color: "#f0f0f0",
                      letterSpacing: 1,
                    }}
                  >
                    {kid.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: 10,
                      color: "#7ab8d4",
                      letterSpacing: 2.5,
                      marginTop: 3,
                    }}
                  >
                    TAP TO START TRAINING
                  </div>
                </div>
              </button>

              <button
                className="ks-delete-btn"
                onClick={() => {
                  if (confirm(`Remove ${kid.name}'s profile?`))
                    onDelete(kid.id);
                }}
                style={{
                  background: "rgba(232,69,69,0.22)",
                  border: "2px solid rgba(232,69,69,0.38)",
                  borderRadius: 14,
                  padding: "11px 13px",
                  cursor: "pointer",
                  color: "#e84545",
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1,
                  transition: "background 0.18s, border-color 0.18s",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
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
              background:
                "linear-gradient(135deg,#2e6fd4 0%,#4a90ff 60%,#5ca8ff 100%)",
              border: "none",
              borderRadius: 50,
              padding: "18px 28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 22px rgba(74,144,255,0.38)",
              transition: "transform 0.22s, box-shadow 0.22s",
              animation: "addBtnPop 0.5s ease-out 0.25s both",
            }}
          >
            <span
              style={{
                fontSize: 22,
                color: "#f6c619",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              +
            </span>
            <span
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: 16,
                color: "white",
                letterSpacing: 3,
                fontWeight: 800,
              }}
            >
              ADD A HERO
            </span>
          </button>
        ) : (
          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(24,38,76,0.97) 0%,rgba(17,22,56,0.97) 100%)",
              borderRadius: 24,
              padding: 22,
              border: "2px solid rgba(74,144,255,0.38)",
              backdropFilter: "blur(12px)",
              animation: "cardSlideIn 0.3s ease-out both",
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hero name..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{
                width: "100%",
                background: "rgba(10,14,39,0.85)",
                border: "2px solid rgba(74,144,255,0.45)",
                borderRadius: 14,
                padding: "13px 16px",
                color: "#f0f0f0",
                fontSize: 18,
                fontFamily: "'Russo One', sans-serif",
                letterSpacing: 2,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 14,
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {AVATARS.map((a, i) => (
                <button
                  key={i}
                  onClick={() => setAvatar(i)}
                  style={{
                    fontSize: 28,
                    background:
                      i === avatar ? "rgba(74,144,255,0.22)" : "transparent",
                    border: `2px solid ${i === avatar ? "#4a90ff" : "transparent"}`,
                    borderRadius: 12,
                    padding: 5,
                    cursor: "pointer",
                    lineHeight: 1,
                    transition: "all 0.15s",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn
                onClick={() => setAdding(false)}
                color={C.panel}
                small
                style={{
                  border: "1px solid rgba(122,130,166,0.35)",
                  color: C.muted,
                }}
              >
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

// ─── FLASHCARD MODE (3-ROUND PROGRESSION) ──────────────────
function FlashcardMode({ progress, dispatch, onAdvanceToFindIt }) {
  const [group, setGroup] = useState(0);
  const [idx, setIdx] = useState(0);
  const [exitAnim, setExitAnim] = useState(null);
  const [shuffled, setShuffled] = useState(() =>
    shuffle(WORD_GROUPS[GROUP_NAMES[0]]),
  );
  const [round, setRound] = useState(1); // 1, 2, or 3
  const [roundScores, setRoundScores] = useState({
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
  });
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [micResult, setMicResult] = useState(null); // "correct" | "wrong" | null
  const [waitingForMic, setWaitingForMic] = useState(false);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [micReady, setMicReady] = useState(false);

  const { listening, result, startListening, stopListening, supported } =
    useSpeechRecognition();

  const word = shuffled[idx];
  const timerSeconds = round === 2 ? 10 : round === 3 ? 5 : 0;

  // Build word lists: round 1 gets all words, rounds 2&3 exclude mastered
  const getWordsForRound = useCallback(
    (r) => {
      const allGroupWords = WORD_GROUPS[GROUP_NAMES[group]];
      const words =
        r >= 2
          ? allGroupWords.filter((w) => !progress.mastered[w])
          : allGroupWords;
      // If all words are mastered in rounds 2/3, fall back to all words
      const pool = words.length > 0 ? words : allGroupWords;
      return weightedShuffle(
        pool,
        progress.wordStats || {},
        progress.mastered || {},
      );
    },
    [group, progress.mastered, progress.wordStats],
  );

  // Reset when group changes
  useEffect(() => {
    setShuffled(getWordsForRound(1));
    setIdx(0);
    setRound(1);
    setRoundScores({
      1: { correct: 0, total: 0 },
      2: { correct: 0, total: 0 },
      3: { correct: 0, total: 0 },
    });
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
      setRoundScores((s) => ({
        ...s,
        [round]: { correct: s[round].correct + 1, total: s[round].total + 1 },
      }));
    }
    // If wrong, don't auto-advance — let them try again or skip
  }, [result]);

  const handleTimerExpire = () => {
    setTimerExpired(true);
    // Auto-mark as wrong if timer runs out
    dispatch({ type: "MARK_WRONG", word });
    setRoundScores((s) => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 },
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
        setIdx((i) => i + 1);
      }
    }, 400);
  };

  // Round 1 manual marking
  const markRound1 = (correct) => {
    dispatch({ type: correct ? "MARK_CORRECT" : "MARK_WRONG", word });
    setRoundScores((s) => ({
      ...s,
      1: { correct: s[1].correct + (correct ? 1 : 0), total: s[1].total + 1 },
    }));
    setExitAnim(correct ? "pushRight" : "pushLeft");
    setTimerExpired(false);
    setMicResult(null);
    setTimeout(() => {
      setExitAnim(null);
      if (idx + 1 >= shuffled.length) {
        setShowRoundSummary(true);
      } else {
        setIdx((i) => i + 1);
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
    setRoundScores((s) => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 },
    }));
    advanceCard();
  };

  const handleMicWrong_TryAgain = () => {
    // Record the failed attempt for this word (tracks retries)
    dispatch({ type: "RECORD_RETRY", word });
    setRoundScores((s) => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 },
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
  const totalCorrect =
    roundScores[1].correct + roundScores[2].correct + roundScores[3].correct;
  const totalAttempts =
    roundScores[1].total + roundScores[2].total + roundScores[3].total;
  const overallPct =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const passed = overallPct >= 80;

  // ─── ROUND SUMMARY SCREEN ────────────────────────────────
  if (showRoundSummary) {
    const rs = roundScores[round];
    const pct = rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "32px 16px",
          animation: "fadeUp 0.4s",
        }}
      >
        <div style={{ fontSize: 56 }}>
          {pct >= 80 ? "💪" : pct >= 50 ? "👊" : "🛡️"}
        </div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 24,
            color: C.accent,
            letterSpacing: 3,
          }}
        >
          ROUND {round} COMPLETE
        </div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 36,
            color: pct >= 80 ? C.green : C.accent,
          }}
        >
          {rs.correct}/{rs.total} ({pct}%)
        </div>
        <div
          style={{
            color: C.muted,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 13,
            letterSpacing: 2,
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          {round === 1
            ? "NEXT: READ THE WORD ALOUD (10s TIMER)"
            : "NEXT: SPEED ROUND (5s TIMER)"}
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "24px 16px",
          animation: "fadeUp 0.4s",
        }}
      >
        <div style={{ fontSize: 64 }}>{passed ? "🏆" : "💪"}</div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 22,
            color: C.accent,
            letterSpacing: 3,
          }}
        >
          ALL 3 ROUNDS DONE
        </div>

        {/* Per-round breakdown */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[1, 2, 3].map((r) => {
            const rs = roundScores[r];
            const p =
              rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0;
            return (
              <div
                key={r}
                style={{
                  background: C.panel,
                  borderRadius: 14,
                  padding: "12px 18px",
                  textAlign: "center",
                  border: `1px solid ${p >= 80 ? C.green : C.accent}30`,
                  minWidth: 85,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: 2,
                  }}
                >
                  ROUND {r}
                </div>
                <div
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    fontSize: 22,
                    color: p >= 80 ? C.green : C.accent,
                  }}
                >
                  {p}%
                </div>
                <div
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    fontSize: 10,
                    color: C.muted,
                  }}
                >
                  {rs.correct}/{rs.total}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 32,
            color: passed ? C.green : C.accent,
            textShadow: passed ? `0 0 20px ${C.green}60` : "none",
            letterSpacing: 3,
          }}
        >
          {overallPct}% OVERALL
        </div>

        {passed ? (
          <>
            <div
              style={{
                color: C.green,
                fontFamily: "'Russo One', sans-serif",
                fontSize: 14,
                letterSpacing: 2,
                textAlign: "center",
              }}
            >
              ⚡ YOU CRUSHED IT! TIME FOR FIND IT! ⚡
            </div>
            <Btn onClick={() => onAdvanceToFindIt(group)} color={C.green}>
              🔍 GO TO FIND IT
            </Btn>
          </>
        ) : (
          <>
            <div
              style={{
                color: C.muted,
                fontFamily: "'Russo One', sans-serif",
                fontSize: 13,
                letterSpacing: 2,
                textAlign: "center",
              }}
            >
              NEED 80% TO UNLOCK FIND IT — KEEP TRAINING!
            </div>
            <Btn
              onClick={() => {
                setRound(1);
                setRoundScores({
                  1: { correct: 0, total: 0 },
                  2: { correct: 0, total: 0 },
                  3: { correct: 0, total: 0 },
                });
                setShuffled(getWordsForRound(1));
                setIdx(0);
                setShowFinalSummary(false);
              }}
            >
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "40px 24px",
          animation: "fadeUp 0.4s",
        }}
      >
        <div style={{ fontSize: 64 }}>🎤</div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 22,
            color: C.accent,
            letterSpacing: 3,
            textAlign: "center",
          }}
        >
          {isSpeedRound ? "SPEED ROUND!" : "TIME TO SPEAK!"}
        </div>
        <div
          style={{
            background: C.panel,
            borderRadius: 16,
            padding: "16px 20px",
            maxWidth: 300,
            border: `2px solid ${C.blue}40`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: C.text,
              fontFamily: "'Russo One', sans-serif",
              fontSize: 13,
              letterSpacing: 1,
              lineHeight: 1.7,
            }}
          >
            This round will listen to you! Say each word out loud when the card
            flips.
            {isSpeedRound
              ? " You only have 5 seconds!"
              : " You have 10 seconds!"}
          </div>
        </div>
        <Btn
          onClick={() => {
            setShowMicPrompt(false);
            setMicReady(true);
          }}
          color={C.green}
        >
          🎤 I'M READY — LET'S GO!
        </Btn>
      </div>
    );
  }

  // ─── CARD VIEW ────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: "16px 16px 24px",
      }}
    >
      <GroupSelector
        selected={group}
        onChange={(i) => {
          setGroup(i);
        }}
      />

      {/* Round indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {[1, 2, 3].map((r) => (
          <div
            key={r}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                r === round
                  ? `linear-gradient(135deg, ${C.accent}, ${C.red})`
                  : r < round
                    ? C.green
                    : C.panel,
              color: r <= round ? C.bg : C.muted,
              fontFamily: "'Russo One', sans-serif",
              fontSize: 14,
              fontWeight: 800,
              border: `2px solid ${r === round ? C.accent : r < round ? C.green : C.muted + "30"}`,
              boxShadow: r === round ? `0 0 12px ${C.accent}50` : "none",
            }}
          >
            {r}
          </div>
        ))}
        <span
          style={{
            color: C.muted,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 11,
            letterSpacing: 2,
            marginLeft: 4,
          }}
        >
          {round === 1
            ? "LISTEN & LEARN"
            : round === 2
              ? "SAY IT (10s)"
              : "SPEED (5s)"}
        </span>
      </div>

      <div
        style={{
          color: C.muted,
          fontSize: 12,
          fontFamily: "'Russo One', sans-serif",
          letterSpacing: 2,
        }}
      >
        WORD {idx + 1} OF {shuffled.length}
        {round >= 2 &&
          Object.keys(progress.mastered).filter((w) =>
            WORD_GROUPS[GROUP_NAMES[group]].includes(w),
          ).length > 0 && (
            <span style={{ color: C.green, marginLeft: 8, fontSize: 10 }}>
              (
              {
                Object.keys(progress.mastered).filter((w) =>
                  WORD_GROUPS[GROUP_NAMES[group]].includes(w),
                ).length
              }{" "}
              mastered)
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
      <div
        style={{
          width: 300,
          height: 210,
          animation: exitAnim
            ? `${exitAnim} 0.5s cubic-bezier(0.4, 0, 1, 1) forwards`
            : "cardEnter 0.35s ease-out",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: timerExpired
              ? `linear-gradient(135deg, ${C.red}, #8b0000)`
              : micResult === "correct"
                ? `linear-gradient(135deg, ${C.green}, #1a8a4a)`
                : micResult === "wrong"
                  ? `linear-gradient(135deg, ${C.red}, #8b0000)`
                  : `linear-gradient(135deg, ${C.accent}, ${C.red})`,
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 40px ${C.accent}40, 0 8px 32px rgba(0,0,0,0.4)`,
            transition: "background 0.3s",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontFamily: "'Russo One', sans-serif",
              color: C.bg,
              textShadow: "2px 2px 0 rgba(255,255,255,0.2)",
              letterSpacing: 4,
            }}
          >
            {word}
          </div>
          {round === 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(word);
              }}
              style={{
                marginTop: 8,
                background: "rgba(0,0,0,0.2)",
                border: "2px solid rgba(0,0,0,0.3)",
                borderRadius: 20,
                padding: "4px 16px",
                color: C.bg,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'Russo One', sans-serif",
              }}
            >
              🔊 HEAR IT
            </button>
          )}
        </div>
      </div>

      {/* Controls based on round */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* ROUND 1: Manual got-it / learning + voice plays */}
        {round === 1 && !micResult && (
          <div style={{ display: "flex", gap: 14 }}>
            <Btn onClick={() => markRound1(false)} color={C.red}>
              ✗ LEARNING
            </Btn>
            <Btn onClick={() => markRound1(true)} color={C.green}>
              ⚡ GOT IT!
            </Btn>
          </div>
        )}

        {listening && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: C.blue,
              fontFamily: "'Russo One', sans-serif",
              fontSize: 15,
              letterSpacing: 2,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: C.red,
                animation: "starPulse 0.8s ease-in-out infinite",
              }}
            />
            LISTENING...
          </div>
        )}

        {micResult === "correct" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: 20,
                color: C.green,
                letterSpacing: 3,
                textShadow: `0 0 12px ${C.green}60`,
              }}
            >
              ⚡ PERFECT! ⚡
            </div>
            <Btn onClick={advanceCard} color={C.green} small>
              NEXT →
            </Btn>
          </div>
        )}

        {micResult === "wrong" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: 16,
                color: C.red,
                letterSpacing: 2,
              }}
            >
              NOT QUITE — TRY AGAIN!
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn
                onClick={() => {
                  handleMicWrong_TryAgain();
                  setTimeout(handleSayIt, 100);
                }}
                color={C.blue}
                small
              >
                🎤 RETRY
              </Btn>
              <Btn onClick={handleSkipWord} color={C.red} small>
                SKIP →
              </Btn>
            </div>
          </div>
        )}

        {timerExpired && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: 16,
                color: C.red,
                letterSpacing: 2,
              }}
            >
              ⏱️ TIME'S UP!
            </div>
            <Btn onClick={advanceCard} color={C.accent} small>
              NEXT →
            </Btn>
          </div>
        )}

        {/* Fallback if mic not supported (rounds 2 & 3) */}
        {round >= 2 && !supported && !timerExpired && !micResult && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                color: C.muted,
                fontFamily: "'Russo One', sans-serif",
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              MIC NOT AVAILABLE — MARK MANUALLY
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <Btn
                onClick={() => {
                  dispatch({ type: "MARK_WRONG", word });
                  setRoundScores((s) => ({
                    ...s,
                    [round]: { ...s[round], total: s[round].total + 1 },
                  }));
                  advanceCard();
                }}
                color={C.red}
                small
              >
                ✗ LEARNING
              </Btn>
              <Btn
                onClick={() => {
                  dispatch({ type: "MARK_CORRECT", word });
                  setRoundScores((s) => ({
                    ...s,
                    [round]: {
                      correct: s[round].correct + 1,
                      total: s[round].total + 1,
                    },
                  }));
                  advanceCard();
                }}
                color={C.green}
                small
              >
                ⚡ GOT IT!
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* Round score so far */}
      {roundScores[round].total > 0 && (
        <div
          style={{
            color: C.muted,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 11,
            letterSpacing: 2,
          }}
        >
          ROUND {round}: {roundScores[round].correct}/{roundScores[round].total}{" "}
          CORRECT
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
    const weighted = weightedShuffle(
      words,
      progress.wordStats || {},
      progress.mastered || {},
    );
    const t = weighted[0]; // Pick the highest-weighted word as target
    const others = words
      .filter((w) => w !== t)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setTarget(t);
    setOptions([...others, t].sort(() => Math.random() - 0.5));
    setFeedback(null);
    setShakeWord(null);
    speak(t);
  }, [group, progress.wordStats, progress.mastered]);

  useEffect(() => {
    genRound();
  }, [genRound, round]);

  const handlePick = (w) => {
    if (feedback) return;
    if (w === target) {
      setFeedback("correct");
      setCombo((c) => c + 1);
      dispatch({ type: "MARK_CORRECT", word: target });
      setScore((s) => s + 1);
      setTimeout(() => {
        if (round + 1 < TOTAL) setRound((r) => r + 1);
        else setFeedback("done");
      }, 1000);
    } else {
      setFeedback("wrong");
      setShakeWord(w);
      setCombo(0);
      dispatch({ type: "MARK_WRONG", word: target });
      setTimeout(() => {
        setFeedback(null);
        setShakeWord(null);
      }, 800);
    }
  };

  const restart = () => {
    setRound(0);
    setScore(0);
    setCombo(0);
    setFeedback(null);
  };

  if (feedback === "done") {
    const msg =
      score >= 9
        ? "LEGENDARY HERO!"
        : score >= 7
          ? "SUPER HERO!"
          : score >= 5
            ? "HERO IN TRAINING!"
            : "KEEP GOING, HERO!";
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 16px",
          animation: "fadeUp 0.4s ease-out",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 8 }}>🏆</div>
        <div
          style={{
            fontSize: 40,
            fontFamily: "'Russo One', sans-serif",
            color: C.accent,
            textShadow: `0 0 25px ${C.accent}60`,
            letterSpacing: 4,
          }}
        >
          {score}/{TOTAL}
        </div>
        <div
          style={{
            color: C.green,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 22,
            letterSpacing: 3,
            margin: "8px 0 24px",
          }}
        >
          {msg}
        </div>
        <Btn onClick={restart}>⚡ PLAY AGAIN</Btn>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        padding: "16px 16px 24px",
      }}
    >
      <GroupSelector
        selected={group}
        onChange={(i) => {
          setGroup(i);
          restart();
        }}
      />

      {/* Score + Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            color: C.accent,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 16,
            letterSpacing: 2,
          }}
        >
          ⚡ {score}
        </span>
        <div
          style={{
            width: 140,
            height: 8,
            background: C.panel,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${C.accent}20`,
          }}
        >
          <div
            style={{
              width: `${(round / TOTAL) * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${C.accent}, ${C.red})`,
              borderRadius: 8,
              transition: "width 0.3s",
            }}
          />
        </div>
        <span
          style={{
            color: C.muted,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 12,
          }}
        >
          {round + 1}/{TOTAL}
        </span>
      </div>

      {combo >= 3 && (
        <div
          style={{
            color: C.accent,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 14,
            letterSpacing: 3,
            textShadow: `0 0 10px ${C.accent}60`,
            animation: "fadeUp 0.3s ease-out",
          }}
        >
          🔥 {combo}x COMBO!
        </div>
      )}

      {/* Hear word */}
      <div
        style={{
          background: C.panel,
          borderRadius: 20,
          padding: "16px 28px",
          border: `2px solid ${C.accent}30`,
          textAlign: "center",
          boxShadow: `0 0 25px ${C.accent}10`,
        }}
      >
        <div
          style={{
            color: C.muted,
            fontSize: 11,
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          🔊 FIND THE WORD
        </div>
        <button
          onClick={() => speak(target)}
          style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.red})`,
            border: "none",
            borderRadius: 14,
            padding: "10px 28px",
            cursor: "pointer",
            fontSize: 17,
            fontWeight: 800,
            color: C.bg,
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 3,
            boxShadow: `0 4px 15px ${C.accent}40`,
          }}
        >
          🔊 HEAR AGAIN
        </button>
      </div>

      {/* Options */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          width: "100%",
          maxWidth: 320,
        }}
      >
        {options.map((w) => {
          const correct = feedback === "correct" && w === target;
          const wrong = shakeWord === w;
          return (
            <button
              key={w}
              onClick={() => handlePick(w)}
              style={{
                background: correct ? C.green : wrong ? C.red : C.panel,
                border: `2px solid ${correct ? C.green : wrong ? C.red : C.accent + "25"}`,
                borderRadius: 16,
                padding: "18px 14px",
                cursor: "pointer",
                fontSize: 26,
                fontWeight: 800,
                fontFamily: "'Russo One', sans-serif",
                color: C.text,
                letterSpacing: 3,
                boxShadow: correct
                  ? `0 0 20px ${C.green}50`
                  : `0 4px 12px rgba(0,0,0,0.3)`,
                transition: "all 0.15s",
                animation: wrong
                  ? "shake 0.4s ease"
                  : correct
                    ? "correctPop 0.3s ease"
                    : "none",
              }}
            >
              {w}
            </button>
          );
        })}
      </div>

      {feedback === "correct" && (
        <div
          style={{
            fontSize: 20,
            fontFamily: "'Russo One', sans-serif",
            color: C.green,
            animation: "fadeUp 0.3s",
            letterSpacing: 3,
            textShadow: `0 0 12px ${C.green}60`,
          }}
        >
          {
            ["⚡ HEROIC!", "💥 BOOM!", "🔥 SUPER!", "⭐ AMAZING!"][
              Math.floor(Math.random() * 4)
            ]
          }
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
  const accuracy =
    progress.totalAttempts > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
      : 0;
  const ws = progress.wordStats || {};

  // Find words needing review (mastered but approaching 7-day limit)
  const now = Date.now();
  const reviewWarningCutoff = now - 5 * 24 * 60 * 60 * 1000; // warn at 5 days
  const needsReview = Object.keys(progress.mastered).filter((w) => {
    const stat = ws[w];
    const lastSeen = stat ? stat.lastSeen : progress.mastered[w];
    return lastSeen && lastSeen < reviewWarningCutoff;
  });

  // Find struggling words (attempted 3+ times with < 60% accuracy)
  const strugglingWords = ALL_WORDS.filter((w) => {
    const stat = ws[w];
    if (!stat || stat.attempts < 3) return false;
    return stat.correct / stat.attempts < 0.6;
  }).sort((a, b) => {
    const aAcc = ws[a].correct / ws[a].attempts;
    const bAcc = ws[b].correct / ws[b].attempts;
    return aAcc - bAcc;
  });

  // Rank system
  const rank =
    masteredCount >= 60
      ? "LEGENDARY HERO"
      : masteredCount >= 40
        ? "SUPER HERO"
        : masteredCount >= 20
          ? "RISING HERO"
          : masteredCount >= 5
            ? "HERO IN TRAINING"
            : "NEW RECRUIT";

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      {/* Hero rank */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>
          {masteredCount >= 60
            ? "👑"
            : masteredCount >= 40
              ? "🦸"
              : masteredCount >= 20
                ? "⚡"
                : "🛡️"}
        </div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 20,
            color: C.accent,
            letterSpacing: 3,
            textShadow: `0 0 15px ${C.accent}40`,
          }}
        >
          {rank}
        </div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 12,
            color: C.muted,
            letterSpacing: 2,
          }}
        >
          {kidName.toUpperCase()}'S HERO PROFILE
        </div>
      </div>

      {/* Needs Review Alert */}
      {needsReview.length > 0 && (
        <div
          style={{
            background: `${C.red}15`,
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            border: `2px solid ${C.red}40`,
            animation: "fadeUp 0.4s",
          }}
        >
          <div
            style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: 13,
              color: C.red,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            THESE WORDS NEED REVIEW
          </div>
          <div
            style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: 11,
              color: C.muted,
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            Practice these soon or they'll lose mastery!
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {needsReview.map((w) => {
              const stat = ws[w];
              const daysAgo = stat
                ? Math.floor((now - stat.lastSeen) / (24 * 60 * 60 * 1000))
                : "?";
              return (
                <span
                  key={w}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Russo One', sans-serif",
                    letterSpacing: 1,
                    background: C.red + "20",
                    color: C.red,
                    border: `1px solid ${C.red}35`,
                  }}
                >
                  {w}{" "}
                  <span style={{ fontSize: 9, opacity: 0.7 }}>{daysAgo}d</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Struggling Words Alert */}
      {strugglingWords.length > 0 && (
        <div
          style={{
            background: `${C.accent}10`,
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            border: `2px solid ${C.accent}30`,
          }}
        >
          <div
            style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: 13,
              color: C.accent,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            TOUGH WORDS
          </div>
          <div
            style={{
              fontFamily: "'Russo One', sans-serif",
              fontSize: 11,
              color: C.muted,
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            These words need extra practice
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {strugglingWords.slice(0, 10).map((w) => {
              const stat = ws[w];
              const wordAcc = Math.round((stat.correct / stat.attempts) * 100);
              return (
                <span
                  key={w}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Russo One', sans-serif",
                    letterSpacing: 1,
                    background: C.accent + "15",
                    color: C.accent,
                    border: `1px solid ${C.accent}25`,
                  }}
                >
                  {w}{" "}
                  <span style={{ fontSize: 9, opacity: 0.7 }}>
                    {wordAcc}% ({stat.attempts}x)
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "MASTERED",
            value: masteredCount,
            color: C.green,
            icon: "🛡️",
          },
          {
            label: "LEARNING",
            value: learningCount,
            color: C.accent,
            icon: "⚡",
          },
          {
            label: "ACCURACY",
            value: `${accuracy}%`,
            color: C.blue,
            icon: "🎯",
          },
          {
            label: "SESSIONS",
            value: progress.sessions || 0,
            color: C.purple,
            icon: "📅",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: C.panel,
              borderRadius: 14,
              padding: "12px 16px",
              textAlign: "center",
              border: `1px solid ${s.color}25`,
              boxShadow: `0 0 15px ${s.color}10`,
              minWidth: 75,
            }}
          >
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div
              style={{
                fontSize: 26,
                fontFamily: "'Russo One', sans-serif",
                color: s.color,
                letterSpacing: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 9,
                color: C.muted,
                fontFamily: "'Russo One', sans-serif",
                letterSpacing: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Power bar */}
      <div style={{ maxWidth: 380, margin: "0 auto 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              color: C.muted,
              fontFamily: "'Russo One', sans-serif",
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            HERO POWER
          </span>
          <span
            style={{
              color: C.accent,
              fontFamily: "'Russo One', sans-serif",
              fontSize: 11,
            }}
          >
            {masteredCount}/{ALL_WORDS.length}
          </span>
        </div>
        <div
          style={{
            height: 12,
            background: C.panel,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${C.accent}20`,
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${C.blue}, ${C.accent}, ${C.red})`,
              borderRadius: 8,
              transition: "width 0.6s",
              boxShadow: `0 0 12px ${C.accent}40`,
            }}
          />
        </div>
      </div>

      {/* Word groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {GROUP_NAMES.map((gn) => {
          const words = WORD_GROUPS[gn];
          const gm = words.filter((w) => progress.mastered[w]).length;
          return (
            <div
              key={gn}
              style={{
                background: C.panel,
                borderRadius: 14,
                padding: 14,
                border: `1px solid ${C.accent}15`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    color: C.text,
                    fontSize: 14,
                    letterSpacing: 1,
                  }}
                >
                  {gn}
                </span>
                <span
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    color: gm === words.length ? C.green : C.accent,
                    fontSize: 12,
                  }}
                >
                  {gm === words.length ? "✓ COMPLETE" : `${gm}/${words.length}`}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {words.map((w) => {
                  const stat = ws[w];
                  const hasStats = stat && stat.attempts > 0;
                  const wordAcc = hasStats
                    ? Math.round((stat.correct / stat.attempts) * 100)
                    : null;
                  const sessionsLeft = hasStats
                    ? Math.max(
                        0,
                        MASTERY_SESSIONS - (stat.sessionsCorrect || 0),
                      )
                    : MASTERY_SESSIONS;
                  return (
                    <span
                      key={w}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Russo One', sans-serif",
                        letterSpacing: 1,
                        background: progress.mastered[w]
                          ? C.green + "20"
                          : progress.learning[w]
                            ? C.accent + "15"
                            : C.bg,
                        color: progress.mastered[w]
                          ? C.green
                          : progress.learning[w]
                            ? C.accent
                            : C.muted + "80",
                        border: `1px solid ${
                          progress.mastered[w]
                            ? C.green + "35"
                            : progress.learning[w]
                              ? C.accent + "25"
                              : C.muted + "15"
                        }`,
                        position: "relative",
                      }}
                      title={
                        hasStats
                          ? `${wordAcc}% accuracy, ${stat.attempts} attempts, ${sessionsLeft} sessions to mastery`
                          : "Not practiced yet"
                      }
                    >
                      {progress.mastered[w] && "★ "}
                      {w}
                      {hasStats && !progress.mastered[w] && (
                        <span
                          style={{ fontSize: 8, opacity: 0.6, marginLeft: 2 }}
                        >
                          {wordAcc}%
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <DailyReminderSettings />
    </div>
  );
}

// ─── MODE SELECTION SCREEN ──────────────────────────────────
function ModeSelectScreen({ kid, progress, onSelectMode, onBack }) {
  const [transitioning, setTransitioning] = useState(null);

  const handleSelect = (key) => {
    if (transitioning) return;
    setTransitioning(key);
    setTimeout(() => onSelectMode(key), 550);
  };

  const findItUnlocked = (progress?.sessions || 0) > 0;

  const missions = [
    {
      key: "flash",
      icon: "⚡",
      label: "FLASH TRAINING",
      desc: "Learn your words",
      color: C.accent,
      gradient: "linear-gradient(135deg, rgba(246,198,25,0.18) 0%, rgba(200,160,10,0.08) 100%)",
      glowColor: "rgba(246,198,25,0.35)",
    },
    {
      key: "find",
      icon: "🔍",
      label: "FIND IT",
      desc: "Word recognition",
      color: C.blue,
      gradient: "linear-gradient(135deg, rgba(74,144,255,0.18) 0%, rgba(50,100,200,0.08) 100%)",
      glowColor: "rgba(74,144,255,0.35)",
      badge: !findItUnlocked ? "Complete Flash first" : null,
    },
    {
      key: "stats",
      icon: "🛡️",
      label: "HERO STATS",
      desc: "Check your progress",
      color: C.green,
      gradient: "linear-gradient(135deg, rgba(46,204,113,0.18) 0%, rgba(30,150,80,0.08) 100%)",
      glowColor: "rgba(46,204,113,0.35)",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0c1130 0%,#0a0e27 55%,#0c1530 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <HomeBackground />

      <style>{`
        @keyframes heroZoomIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes heroGlowBurst {
          0% { transform: scale(0); opacity: 0.9; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes missionTitleReveal {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes missionCardSlideUp {
          0% { opacity: 0; transform: translateY(24px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes missionCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes portalExpand {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(3); opacity: 0; }
        }
        .mission-card:hover {
          transform: translateY(-3px) !important;
          filter: brightness(1.1);
        }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          padding: "24px 20px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Back button */}
        <div style={{ width: "100%", marginBottom: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: C.panel,
              border: `1px solid ${C.muted}30`,
              borderRadius: 10,
              padding: "6px 12px",
              cursor: "pointer",
              color: C.muted,
              fontFamily: "'Russo One', sans-serif",
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            ← BACK
          </button>
        </div>

        {/* Hero avatar + name */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {/* Glow burst behind avatar */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${C.accent}60 0%, transparent 70%)`,
              transform: "translate(-50%, -50%)",
              animation: "heroGlowBurst 0.8s ease-out forwards",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontSize: 56,
              lineHeight: 1,
              animation: "heroZoomIn 0.6s ease-out both",
              position: "relative",
            }}
          >
            {kid.avatar}
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 20,
            color: C.text,
            letterSpacing: 2,
            animation: "heroZoomIn 0.6s ease-out 0.1s both",
          }}
        >
          {kid.name}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: "clamp(16px, 5vw, 20px)",
            color: C.accent,
            letterSpacing: 4,
            marginTop: 24,
            marginBottom: 28,
            textShadow: `0 0 18px ${C.accent}50`,
            animation: "missionTitleReveal 0.5s ease-out 0.3s both",
          }}
        >
          CHOOSE YOUR MISSION
        </div>

        {/* Mission cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "100%",
          }}
        >
          {missions.map((m, i) => {
            const isTransitioning = transitioning === m.key;
            return (
              <button
                key={m.key}
                className="mission-card"
                onClick={() => handleSelect(m.key)}
                style={{
                  width: "100%",
                  background: m.gradient,
                  border: `2.5px solid ${m.color}55`,
                  borderRadius: 20,
                  padding: "20px 22px",
                  cursor: transitioning ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  backdropFilter: "blur(6px)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.22s, border-color 0.22s, box-shadow 0.22s",
                  boxShadow: isTransitioning
                    ? `0 0 40px ${m.color}80`
                    : `0 0 14px ${m.color}15`,
                  animation: `missionCardSlideUp 0.4s ease-out ${0.4 + i * 0.12}s both${
                    !isTransitioning ? `, missionCardFloat ${3 + i * 0.5}s ease-in-out ${i * 1.2}s infinite` : ""
                  }`,
                  ...(isTransitioning
                    ? {
                        animation: `portalExpand 0.5s ease-in forwards`,
                        borderColor: m.color,
                      }
                    : {}),
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: 36,
                    lineHeight: 1,
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 14,
                    background: `${m.color}20`,
                    border: `1px solid ${m.color}30`,
                  }}
                >
                  {m.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: 17,
                      color: m.color,
                      letterSpacing: 2,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 13,
                      color: C.muted,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    {m.desc}
                  </div>
                  {/* Soft badge for Find It */}
                  {m.badge && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "2px 8px",
                        background: `${m.color}15`,
                        borderRadius: 6,
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 10,
                        color: m.color,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        display: "inline-block",
                      }}
                    >
                      {m.badge}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div
                  style={{
                    color: m.color,
                    fontSize: 20,
                    opacity: 0.6,
                  }}
                >
                  →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────
export default function WordHeroApp() {
  const [profiles, setProfiles] = useState(null);
  const [activeKid, setActiveKid] = useState(null);
  const [mode, setMode] = useState("menu");
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

  // Check and fire daily reminder notification on app open
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;
    const prefs = loadNotificationPrefs();
    if (!prefs.enabled) return;
    const today = new Date().toDateString();
    if (prefs.lastSentDate === today) return;
    const [h, m] = prefs.time.split(":").map(Number);
    const now = new Date();
    if (now.getHours() < h || (now.getHours() === h && now.getMinutes() < m))
      return;
    new Notification("⚡ Word Hero Daily Challenge!", {
      body: "Time to train! Your daily sight words are ready. Keep your hero power up!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
    saveNotificationPrefs({ ...prefs, lastSentDate: today });
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
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [progress, activeKid]);

  const addKid = (kid) => {
    const next = [...(profiles || []), kid];
    setProfiles(next);
    saveProfiles(next);
  };

  const deleteKid = (id) => {
    const next = profiles.filter((k) => k.id !== id);
    setProfiles(next);
    saveProfiles(next);
    try {
      localStorage.removeItem(`word-hero-progress-${id}`);
    } catch {}
  };

  const selectKid = (kid) => {
    setActiveKid(kid);
    setMode("menu");
  };

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: C.accent,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 24,
            letterSpacing: 4,
            animation: "starPulse 1.5s ease-in-out infinite",
          }}
        >
          ⚡ LOADING... ⚡
        </div>
      </div>
    );
  }

  if (!activeKid) {
    return (
      <KidSelector
        profiles={profiles}
        onSelect={selectKid}
        onAdd={addKid}
        onDelete={deleteKid}
      />
    );
  }

  const modes = [
    { key: "flash", label: "FLASH", icon: "⚡" },
    { key: "find", label: "FIND IT", icon: "🔍" },
    { key: "stats", label: "STATS", icon: "🛡️" },
  ];

  // Mode selection screen has its own full layout
  if (mode === "menu") {
    return (
      <ModeSelectScreen
        kid={activeKid}
        progress={progress}
        onSelectMode={(m) => setMode(m)}
        onBack={() => setActiveKid(null)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Russo+One&family=Nunito:wght@700;800;900&display=swap"
        rel="stylesheet"
      />
      <StarField />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          onClick={() => {
            setActiveKid(null);
          }}
          style={{
            background: C.panel,
            border: `1px solid ${C.muted}30`,
            borderRadius: 10,
            padding: "6px 12px",
            cursor: "pointer",
            color: C.muted,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          ← SWITCH
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 22,
              fontFamily: "'Russo One', sans-serif",
              color: C.accent,
              letterSpacing: 4,
              textShadow: `0 0 15px ${C.accent}40, 1px 1px 0 ${C.red}`,
            }}
          >
            ⚡ WORD HERO ⚡
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: C.panel,
            borderRadius: 10,
            padding: "4px 10px",
            border: `1px solid ${C.accent}20`,
          }}
        >
          <span style={{ fontSize: 20 }}>{activeKid.avatar}</span>
          <span
            style={{
              fontFamily: "'Russo One', sans-serif",
              color: C.text,
              fontSize: 13,
              letterSpacing: 1,
            }}
          >
            {activeKid.name}
          </span>
        </div>
      </div>

      {/* Mode tabs */}
      {mode !== "menu" && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          padding: "8px 16px 4px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            style={{
              background:
                mode === m.key
                  ? `linear-gradient(135deg, ${C.accent}, ${C.red})`
                  : C.panel,
              color: mode === m.key ? C.bg : C.muted,
              border: `2px solid ${mode === m.key ? C.accent : "transparent"}`,
              borderRadius: 12,
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 12,
              fontFamily: "'Russo One', sans-serif",
              letterSpacing: 2,
              transition: "all 0.2s",
              boxShadow: mode === m.key ? `0 4px 12px ${C.accent}35` : "none",
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        {mode === "flash" && (
          <FlashcardMode
            progress={progress}
            dispatch={dispatch}
            onAdvanceToFindIt={(g) => {
              setFindItGroup(g);
              setMode("find");
            }}
          />
        )}
        {mode === "find" && (
          <FindItGame
            progress={progress}
            dispatch={dispatch}
            initialGroup={findItGroup}
          />
        )}
        {mode === "stats" && (
          <ProgressTracker progress={progress} kidName={activeKid.name} />
        )}
      </div>

      {/* Reset */}
      <div
        style={{
          textAlign: "center",
          padding: "16px 0 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          onClick={() => {
            if (confirm(`Reset ${activeKid.name}'s progress?`))
              dispatch({ type: "RESET" });
          }}
          style={{
            background: "transparent",
            border: `1px solid ${C.muted}30`,
            color: C.muted,
            borderRadius: 8,
            padding: "5px 14px",
            fontSize: 10,
            cursor: "pointer",
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 2,
          }}
        >
          RESET PROGRESS
        </button>
      </div>

      <GlobalStyles />
    </div>
  );
}
