import { useState, useEffect, useCallback } from "react";
import { WORD_GROUPS, GROUP_NAMES, C } from "../constants";
import GroupSelector from "./GroupSelector";
import CountdownTimer from "./CountdownTimer";
import Btn from "./Btn";
import { speak } from "../utils/speech";
import { shuffle } from "../utils/shuffle";
import { weightedShuffle } from "../utils/progress";
import { useSpeechRecognition, wordMatch } from "../utils/speechRecognition";

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

export default FlashcardMode;
