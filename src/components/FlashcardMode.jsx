import { useState, useEffect, useCallback } from "react";
import { C, WORD_GROUPS, GROUP_NAMES } from "../constants";
import { speak, shuffle, wordMatch } from "../utils";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { GroupSelector } from "./GroupSelector";
import { Btn } from "./Btn";
import { CountdownTimer } from "./CountdownTimer";

const INIT_ROUND_SCORES = () => ({
  1: { correct: 0, total: 0 },
  2: { correct: 0, total: 0 },
  3: { correct: 0, total: 0 },
});

export default function FlashcardMode({ progress, dispatch, onAdvanceToFindIt }) {
  const [group, setGroup] = useState(0);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [exitAnim, setExitAnim] = useState(null);
  const [shuffled, setShuffled] = useState(() => shuffle(WORD_GROUPS[GROUP_NAMES[0]]));
  const [round, setRound] = useState(1);
  const [roundScores, setRoundScores] = useState(INIT_ROUND_SCORES);
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [micResult, setMicResult] = useState(null);
  const [waitingForMic, setWaitingForMic] = useState(false);

  const { listening, result, startListening, supported } = useSpeechRecognition();

  const word = shuffled[idx];
  const timerSeconds = round === 2 ? 10 : round === 3 ? 5 : 0;

  useEffect(() => {
    setShuffled(shuffle(WORD_GROUPS[GROUP_NAMES[group]]));
    setIdx(0);
    setFlipped(false);
    setRound(1);
    setRoundScores(INIT_ROUND_SCORES());
    setShowRoundSummary(false);
    setShowFinalSummary(false);
    setTimerExpired(false);
    setMicResult(null);
    setWaitingForMic(false);
  }, [group]);

  useEffect(() => {
    if (flipped && round === 1) {
      speak(word);
    }
  }, [flipped, round, word]);

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
  }, [result, waitingForMic, word, round, dispatch]);

  const handleTimerExpire = useCallback(() => {
    setTimerExpired(true);
    dispatch({ type: "MARK_WRONG", word });
    setRoundScores((s) => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 },
    }));
  }, [dispatch, word, round]);

  const advanceCard = useCallback(() => {
    setExitAnim("swooshRight");
    setTimerExpired(false);
    setMicResult(null);
    setWaitingForMic(false);
    setTimeout(() => {
      setFlipped(false);
      setExitAnim(null);
      setIdx((i) => {
        if (i + 1 >= shuffled.length) {
          if (round < 3) setShowRoundSummary(true);
          else setShowFinalSummary(true);
          return i;
        }
        return i + 1;
      });
    }, 400);
  }, [shuffled.length, round]);

  const markRound1 = useCallback(
    (correct) => {
      dispatch({ type: correct ? "MARK_CORRECT" : "MARK_WRONG", word });
      setRoundScores((s) => ({
        ...s,
        1: { correct: s[1].correct + (correct ? 1 : 0), total: s[1].total + 1 },
      }));
      setExitAnim(correct ? "swooshRight" : "swooshLeft");
      setTimerExpired(false);
      setMicResult(null);
      setTimeout(() => {
        setFlipped(false);
        setExitAnim(null);
        setIdx((i) => {
          if (i + 1 >= shuffled.length) {
            setShowRoundSummary(true);
            return i;
          }
          return i + 1;
        });
      }, 400);
    },
    [dispatch, word, shuffled.length]
  );

  const handleSayIt = useCallback(() => {
    setMicResult(null);
    setWaitingForMic(true);
    startListening();
  }, [startListening]);

  const handleSkipWord = useCallback(() => {
    dispatch({ type: "MARK_WRONG", word });
    setRoundScores((s) => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 },
    }));
    advanceCard();
  }, [dispatch, word, round, advanceCard]);

  const handleMicWrongTryAgain = useCallback(() => {
    setMicResult(null);
    setWaitingForMic(false);
  }, []);

  const startNextRound = useCallback(() => {
    setRound((r) => r + 1);
    setShuffled(shuffle(WORD_GROUPS[GROUP_NAMES[group]]));
    setIdx(0);
    setFlipped(false);
    setShowRoundSummary(false);
    setTimerExpired(false);
    setMicResult(null);
    setWaitingForMic(false);
  }, [group]);

  const totalCorrect = roundScores[1].correct + roundScores[2].correct + roundScores[3].correct;
  const totalAttempts = roundScores[1].total + roundScores[2].total + roundScores[3].total;
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const passed = overallPct >= 80;

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
        <div style={{ fontSize: 56 }}>{pct >= 80 ? "💪" : pct >= 50 ? "👊" : "🛡️"}</div>
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

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {[1, 2, 3].map((r) => {
            const rs = roundScores[r];
            const p = rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0;
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
                setRoundScores(INIT_ROUND_SCORES());
                setShuffled(shuffle(WORD_GROUPS[GROUP_NAMES[group]]));
                setIdx(0);
                setFlipped(false);
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
      <GroupSelector selected={group} onChange={setGroup} />

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
          {round === 1 ? "LISTEN & LEARN" : round === 2 ? "SAY IT (10s)" : "SPEED (5s)"}
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
      </div>

      {round >= 2 && flipped && !timerExpired && !micResult && (
        <CountdownTimer
          key={`${round}-${idx}`}
          seconds={timerSeconds}
          onExpire={handleTimerExpire}
          paused={listening}
        />
      )}

      <div
        onClick={() => {
          if (!flipped) setFlipped(true);
        }}
        style={{
          width: 300,
          height: 210,
          perspective: 1000,
          cursor: flipped ? "default" : "pointer",
          animation: exitAnim
            ? `${exitAnim} 0.4s ease-in forwards`
            : "cardEnter 0.3s ease-out",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s ease",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: `linear-gradient(135deg, #1a1f4e, #2d1b69)`,
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `3px solid ${C.accent}40`,
              boxShadow: `0 0 30px ${C.accent}15, 0 8px 32px rgba(0,0,0,0.4)`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: C.accent,
                fontFamily: "'Russo One', sans-serif",
                letterSpacing: 3,
                marginBottom: 8,
              }}
            >
              ⚡ TAP TO REVEAL ⚡
            </div>
            <div
              style={{
                fontSize: 60,
                fontFamily: "'Russo One', sans-serif",
                color: C.text,
                textShadow: `0 0 20px ${C.blue}60`,
              }}
            >
              ?
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
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
              transform: "rotateY(180deg)",
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
      </div>

      {flipped && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            animation: "fadeUp 0.3s",
          }}
        >
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

          {round >= 2 && !timerExpired && !micResult && !listening && (
            <Btn onClick={handleSayIt} color={C.blue}>
              🎤 SAY THE WORD
            </Btn>
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
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
                <Btn onClick={handleMicWrongTryAgain} color={C.blue} small>
                  🎤 RETRY
                </Btn>
                <Btn onClick={handleSkipWord} color={C.red} small>
                  SKIP →
                </Btn>
              </div>
            </div>
          )}

          {timerExpired && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
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

          {round >= 2 && !supported && !timerExpired && !micResult && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
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
                      [round]: { correct: s[round].correct + 1, total: s[round].total + 1 },
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
      )}

      {roundScores[round].total > 0 && (
        <div
          style={{
            color: C.muted,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 11,
            letterSpacing: 2,
          }}
        >
          ROUND {round}: {roundScores[round].correct}/{roundScores[round].total} CORRECT
        </div>
      )}
    </div>
  );
}
