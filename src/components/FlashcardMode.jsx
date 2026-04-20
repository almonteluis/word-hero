import { useState, useEffect, useCallback } from "react";
import { C, FONT, RADIUS } from "../constants";
import CountdownTimer from "./CountdownTimer";
import Btn from "./Btn";
import VictoryScreen from "./VictoryScreen";
import { speak } from "../utils/speech";
import { useSpeechRecognition, wordMatch } from "../utils/speechRecognition";
import { getPronunciationFeedback } from "../utils/pronunciationFeedback";
import { selectPracticeWords } from "../utils/roundWords";

function FlashcardMode({ progress, dispatch, onAdvanceToFindIt, onExitFocused, focusedWord, lang = "en" }) {
  const pickWords = () =>
    selectPracticeWords(progress, undefined, lang, focusedWord);

  const [idx, setIdx] = useState(0);
  const [exitAnim, setExitAnim] = useState(null);
  const [shuffled, setShuffled] = useState(pickWords);
  const [round, setRound] = useState(1);
  const [roundScores, setRoundScores] = useState({
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
  });
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [micResult, setMicResult] = useState(null);
  const [micFeedback, setMicFeedback] = useState(null);
  const [waitingForMic, setWaitingForMic] = useState(false);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [micReady, setMicReady] = useState(false);

  const { listening, result, startListening, stopListening, supported } =
    useSpeechRecognition(lang);

  const word = shuffled[idx];
  const timerSeconds = round === 2 ? 10 : round === 3 ? 5 : 0;

  const getWordsForRound = useCallback(
    () => selectPracticeWords(progress, undefined, lang, focusedWord),
    [progress, focusedWord, lang],
  );

  useEffect(() => {
    if (round !== 1) return;
    const t = setTimeout(() => speak(word, lang), 50);
    return () => clearTimeout(t);
  }, [word]);

  useEffect(() => {
    if (round >= 2 && micReady && !micResult && !timerExpired) {
      setMicResult(null);
      setWaitingForMic(true);
      startListening();
    }
  }, [word, micReady]);

  useEffect(() => {
    if (!result || !waitingForMic) return;
    const matched = wordMatch(result, word);
    setMicResult(matched ? "correct" : "wrong");
    setWaitingForMic(false);
    if (matched) {
      setMicFeedback(null);
      dispatch({ type: "MARK_CORRECT", word });
      setRoundScores((s) => ({
        ...s,
        [round]: { correct: s[round].correct + 1, total: s[round].total + 1 },
      }));
    } else {
      setMicFeedback(getPronunciationFeedback(result, word, lang));
    }
  }, [result]);

  const handleTimerExpire = () => {
    setTimerExpired(true);
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
    setMicFeedback(null);
    setWaitingForMic(false);
    setTimeout(() => {
      setExitAnim(null);
      if (idx + 1 >= shuffled.length) {
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

  const handleSayIt = () => {
    setMicResult(null);
    setMicFeedback(null);
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
    dispatch({ type: "RECORD_RETRY", word });
    setRoundScores((s) => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 },
    }));
    setMicResult(null);
    setMicFeedback(null);
    setWaitingForMic(false);
  };

  const startNextRound = () => {
    const nextRound = round + 1;
    setRound(nextRound);
    setShuffled(getWordsForRound());
    setIdx(0);
    setShowRoundSummary(false);
    setTimerExpired(false);
    setMicResult(null);
    setShowMicPrompt(true);
    setMicReady(false);
  };

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
            fontFamily: FONT,
            fontSize: 24,
            color: C.accent,
            fontWeight: 700,
          }}
        >
          Round {round} Complete!
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 36,
            color: pct >= 80 ? C.green : C.accent,
            fontWeight: 700,
          }}
        >
          {rs.correct}/{rs.total} ({pct}%)
        </div>
        <div
          style={{
            color: C.muted,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 500,
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          {round === 1
            ? "Next: Read the word aloud (10s timer)"
            : "Next: Speed round (5s timer)"}
        </div>
        <Btn onClick={startNextRound} color={C.primary}>
          Start Round {round + 1}
        </Btn>
      </div>
    );
  }

  // ─── FINAL SUMMARY SCREEN ────────────────────────────────
  if (showFinalSummary) {
    return (
      <VictoryScreen
        score={totalCorrect}
        total={totalAttempts}
        onRetry={() => {
          setRound(1);
          setRoundScores({
            1: { correct: 0, total: 0 },
            2: { correct: 0, total: 0 },
            3: { correct: 0, total: 0 },
          });
          setShuffled(getWordsForRound());
          setIdx(0);
          setShowFinalSummary(false);
        }}
        onContinue={
          focusedWord
            ? () => onExitFocused?.()
            : passed
              ? () => onAdvanceToFindIt()
              : undefined
        }
        continueLabel={focusedWord ? "Done →" : "Continue →"}
      />
    );
  }

  // ─── MIC PROMPT MODAL ──
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
            fontFamily: FONT,
            fontSize: 22,
            color: C.accent,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {isSpeedRound ? "Speed Round!" : "Time to Speak!"}
        </div>
        <div
          style={{
            background: "white",
            borderRadius: RADIUS.card,
            padding: "16px 20px",
            maxWidth: 300,
            border: `3px solid ${C.secondary}30`,
            boxShadow: `0 4px 16px ${C.shadow}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: C.text,
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 500,
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
          color={C.primary}
        >
          I'm Ready!
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
      {/* Round indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {[1, 2, 3].map((r) => (
          <div
            key={r}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                r === round
                  ? C.accent
                  : r < round
                    ? C.green
                    : "white",
              color: r <= round ? C.textLight : C.muted,
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              border: `3px solid ${r === round ? C.accent : r < round ? C.green : C.border}`,
              boxShadow: r === round ? `0 0 12px ${C.accent}50` : `0 2px 6px ${C.shadow}`,
            }}
          >
            {r}
          </div>
        ))}
        <span
          style={{
            color: C.muted,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 500,
            marginLeft: 4,
          }}
        >
          {round === 1
            ? "Listen & Learn"
            : round === 2
              ? "Say It (10s)"
              : "Speed (5s)"}
        </span>
      </div>

      <div
        style={{
          color: C.muted,
          fontSize: 13,
          fontFamily: FONT,
          fontWeight: 500,
        }}
      >
        Word {idx + 1} of {shuffled.length}
        {round >= 2 && Object.keys(progress.mastered).length > 0 && (
          <span style={{ color: C.green, marginLeft: 8, fontSize: 11 }}>
            ({Object.keys(progress.mastered).length} mastered)
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
        className="toy-block"
        style={{
          width: 300,
          height: 210,
          background: micResult === "correct"
            ? C.green
            : micResult === "wrong" || timerExpired
              ? "#FFE4E6"
              : "white",
          borderRadius: RADIUS.card,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.3s",
          animation: exitAnim
            ? `${exitAnim} 0.5s cubic-bezier(0.4, 0, 1, 1) forwards`
            : micResult === "correct"
              ? "boing 0.45s ease-out"
              : micResult === "wrong"
                ? "wobble 0.4s ease-out"
                : "cardEnter 0.35s ease-out",
        }}
      >
          <div
            style={{
              fontSize: 64,
              fontFamily: FONT,
              color: C.ink,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {word}
          </div>
          <div
            style={{
              background: C.accent,
              border: `3px solid ${C.ink}`,
              borderRadius: 50,
              padding: "4px 14px",
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 700,
              color: C.ink,
              marginTop: 8,
            }}
          >
            {micResult === "correct" ? "✓ Correct" : timerExpired ? "Time's up" : `Round ${round} of 3`}
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
        {round === 1 && !micResult && (
          <>
            <button
              className="toy-block toy-pressable"
              onClick={() => speak(word, lang)}
              style={{
                background: C.surface,
                padding: "8px 16px",
                color: C.text,
                fontWeight: 600,
                fontSize: 13,
                fontFamily: FONT,
              }}
            >
              🔊 Hear It
            </button>
            <div style={{ display: "flex", gap: 14 }}>
              <Btn onClick={() => markRound1(false)} color="#FFE4E6">
                ✗ Learning
              </Btn>
              <Btn onClick={() => markRound1(true)} color={C.green}>
                ✓ Got It!
              </Btn>
            </div>
          </>
        )}

        {listening && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: C.secondary,
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: C.heart,
                animation: "starPulse 0.8s ease-in-out infinite",
              }}
            />
            Listening...
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
                fontFamily: FONT,
                fontSize: 20,
                color: C.green,
                fontWeight: 700,
              }}
            >
              Perfect!
            </div>
            <Btn onClick={advanceCard} color={C.green} small>
              Next →
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
                fontFamily: FONT,
                fontSize: 16,
                color: C.heart,
                fontWeight: 600,
              }}
            >
              Not quite — try again!
            </div>
            {micFeedback && (
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 14,
                  color: C.muted,
                  textAlign: "center",
                  maxWidth: 280,
                  lineHeight: 1.4,
                }}
              >
                <div>
                  I heard <strong>"{micFeedback.heard}"</strong>
                </div>
                <div style={{ marginTop: 4, color: C.accent, fontWeight: 500 }}>
                  {micFeedback.tip}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn
                onClick={() => {
                  handleMicWrong_TryAgain();
                  setTimeout(handleSayIt, 100);
                }}
                color={C.secondary}
                small
              >
                Retry
              </Btn>
              <Btn onClick={handleSkipWord} color={C.heart} small>
                Skip →
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
                fontFamily: FONT,
                fontSize: 16,
                color: C.heart,
                fontWeight: 600,
              }}
            >
              Time's up!
            </div>
            <Btn onClick={advanceCard} color={C.accent} small>
              Next →
            </Btn>
          </div>
        )}

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
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Mic not available — mark manually
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
                color={C.heart}
                small
              >
                Learning
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
                Got It!
              </Btn>
            </div>
          </div>
        )}
      </div>

      {roundScores[round].total > 0 && (
        <div
          style={{
            color: C.muted,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Round {round}: {roundScores[round].correct}/{roundScores[round].total}{" "}
          correct
        </div>
      )}
    </div>
  );
}

export default FlashcardMode;
