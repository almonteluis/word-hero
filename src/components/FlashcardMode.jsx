import { useState, useEffect, useCallback } from "react";
import { C, FONT, RADIUS, SHADOW, EASE } from "../constants";
import CountdownTimer from "./CountdownTimer";
import Btn from "./Btn";
import VictoryScreen from "./VictoryScreen";
import { speak } from "../utils/speech";
import { useSpeechRecognition, wordMatch } from "../utils/speechRecognition";
import { getPronunciationFeedback } from "../utils/pronunciationFeedback";
import { selectPracticeWords } from "../utils/roundWords";

function FlashcardMode({ progress, dispatch, onAdvanceToFindIt, onExitFocused, focusedWord, lang = "en" }) {
  const pickWords = () =>
    focusedWord ? [focusedWord] : selectPracticeWords(progress, undefined, lang);

  const [idx, setIdx] = useState(0);
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
    () => (focusedWord ? [focusedWord] : selectPracticeWords(progress, undefined, lang)),
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
    setTimerExpired(false);
    setMicResult(null);
    setMicFeedback(null);
    setWaitingForMic(false);
    if (idx + 1 >= shuffled.length) {
      if (round < 3) {
        setShowRoundSummary(true);
      } else {
        setShowFinalSummary(true);
      }
    } else {
      setIdx((i) => i + 1);
    }
  };

  const markRound1 = (correct) => {
    dispatch({ type: correct ? "MARK_CORRECT" : "MARK_WRONG", word });
    setRoundScores((s) => ({
      ...s,
      1: { correct: s[1].correct + (correct ? 1 : 0), total: s[1].total + 1 },
    }));
    setMicResult(correct ? "correct" : "wrong");
    setTimeout(() => {
      setMicResult(null);
      if (idx + 1 >= shuffled.length) {
        setShowRoundSummary(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, 700);
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

  // Round colors matching the design
  const roundColors = [C.secondary, C.accent, C.primary];
  const roundColor = roundColors[(round - 1) % 3];
  const roundLabels = ["Listen", "Say It", "Speed"];

  // ─── ROUND SUMMARY SCREEN ────────────────────────────────
  if (showRoundSummary) {
    const rs = roundScores[round];
    const pct = rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 16px", animation: "fadeRise 0.4s ease-out" }}>
        <div style={{ fontSize: 56 }}>{pct >= 80 ? "💪" : pct >= 50 ? "👊" : "🛡️"}</div>
        <div style={{ fontFamily: FONT, fontSize: 24, color: C.ink, fontWeight: 700 }}>Round {round} Complete!</div>
        <div
          className="toy-block"
          style={{
            background: pct >= 80 ? C.green : C.accent,
            padding: "12px 28px",
            textAlign: "center",
            borderWidth: 3,
            boxShadow: SHADOW.toySm,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 36, color: C.ink, fontWeight: 700 }}>{rs.correct}/{rs.total} ({pct}%)</div>
        </div>
        <div style={{ color: C.muted, fontFamily: FONT, fontSize: 14, fontWeight: 500, textAlign: "center", maxWidth: 280 }}>
          {round === 1 ? "Next: Read the word aloud (10s timer)" : "Next: Speed round (5s timer)"}
        </div>
        <Btn onClick={startNextRound} color={roundColors[round]} style={{ color: C.ink }}>Start Round {round + 1}</Btn>
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
          setRoundScores({ 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 } });
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "40px 24px", animation: "fadeRise 0.4s ease-out" }}>
        <div style={{ fontSize: 64 }}>🎤</div>
        <div style={{ fontFamily: FONT, fontSize: 22, color: roundColors[round], fontWeight: 700, textAlign: "center" }}>
          {isSpeedRound ? "Speed Round!" : "Time to Speak!"}
        </div>
        <div
          className="toy-block"
          style={{
            background: C.surface,
            padding: "16px 20px",
            maxWidth: 300,
            borderWidth: 3,
            boxShadow: SHADOW.toySm,
            textAlign: "center",
          }}
        >
          <div style={{ color: C.text, fontFamily: FONT, fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
            This round will listen to you! Say each word out loud when the card flips.
            {isSpeedRound ? " You only have 5 seconds!" : " You have 10 seconds!"}
          </div>
        </div>
        <Btn onClick={() => { setShowMicPrompt(false); setMicReady(true); }} color={C.primary}>I'm Ready!</Btn>
      </div>
    );
  }

  // ─── FLASHCARD VIEW ──────────────────────────────────────
  const cardBg = micResult === "correct"
    ? C.green
    : micResult === "wrong" || timerExpired
      ? "#FFE4E6"
      : C.surface;
  const cardAnim = micResult === "correct"
    ? "boing 0.45s ease-out"
    : micResult === "wrong"
      ? "wobble 0.4s ease-out"
      : "fadeRise 0.3s ease-out";
  const subLabel = round === 1
    ? "Listen and learn"
    : round === 2
      ? "Say it out loud!"
      : "Speed round — quick!";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 16px 24px" }}>

      {/* ─── Round Tabs (pill style) ─── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "4px 0" }}>
        {[1, 2, 3].map((r) => {
          const isActive = r === round;
          const isDone = r < round;
          const bg = isActive ? roundColors[(r - 1) % 3] : C.surface;
          return (
            <div
              key={r}
              style={{
                padding: "7px 18px",
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
                borderRadius: RADIUS.pill,
                border: `3px solid ${C.ink}`,
                boxShadow: isActive ? SHADOW.toySm : "none",
                background: bg,
                color: C.text,
                transition: `all 0.2s ${EASE.out}`,
                opacity: isDone ? 0.6 : 1,
              }}
            >
              {roundLabels[r - 1]}
            </div>
          );
        })}
      </div>

      {/* ─── Progress Dots ─── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "4px 0" }}>
        {shuffled.map((_, i) => {
          const isDone = i < idx;
          const isCurrent = i === idx;
          return (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: isDone ? C.green : isCurrent ? C.accent : C.panel,
                border: `2px solid ${C.ink}`,
                boxShadow: isCurrent ? "1px 2px 0 " + C.ink : "none",
                transition: `all 0.2s ${EASE.out}`,
              }}
            />
          );
        })}
      </div>

      {/* ─── Timer for rounds 2 & 3 ─── */}
      {round >= 2 && !timerExpired && !micResult && (
        <CountdownTimer
          key={`${round}-${idx}`}
          seconds={timerSeconds}
          onExpire={handleTimerExpire}
        />
      )}

      {/* ─── Flashcard ─── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
        <div
          key={`${round}-${idx}`}
          className="toy-block"
          style={{
            background: cardBg,
            padding: "40px 60px",
            textAlign: "center",
            borderWidth: 3,
            boxShadow: SHADOW.toy,
            minWidth: 280,
            transition: "background 0.2s",
            animation: cardAnim,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 64, fontWeight: 700, color: C.ink, letterSpacing: 2 }}>
            {word}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 12, color: C.muted, fontWeight: 600, marginTop: 8 }}>
            {micResult === "correct" ? "✓ Correct!" : timerExpired ? "Time's up" : subLabel}
          </div>
        </div>
      </div>

      {/* ─── Action Buttons ─── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "0 4px", width: "100%", maxWidth: 400 }}>
        {/* Round 1: Miss / Got It */}
        {round === 1 && !micResult && (
          <>
            <Btn onClick={() => markRound1(false)} color="#FFE4E6" style={{ flex: 1, fontSize: 16, padding: "14px", color: C.heart }}>
              ✗ Miss
            </Btn>
            <Btn onClick={() => markRound1(true)} color={C.green} style={{ flex: 1, fontSize: 16, padding: "14px", color: C.ink }}>
              ✓ Got It
            </Btn>
          </>
        )}

        {/* Rounds 2-3: Say It / Miss */}
        {round >= 2 && !micResult && !timerExpired && supported && !waitingForMic && (
          <>
            <Btn onClick={handleSayIt} color={C.secondary} style={{ flex: 1, fontSize: 16, padding: "14px", color: C.ink }}>
              🎤 Say It
            </Btn>
            <Btn onClick={handleSkipWord} color="#FFE4E6" style={{ fontSize: 16, padding: "14px", color: C.heart }}>
              ✗
            </Btn>
          </>
        )}

        {/* Rounds 2-3: Mic not supported fallback */}
        {round >= 2 && !supported && !timerExpired && !micResult && (
          <>
            <Btn
              onClick={() => {
                dispatch({ type: "MARK_WRONG", word });
                setRoundScores((s) => ({ ...s, [round]: { ...s[round], total: s[round].total + 1 } }));
                advanceCard();
              }}
              color="#FFE4E6"
              style={{ flex: 1, fontSize: 16, padding: "14px", color: C.heart }}
            >
              ✗ Miss
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
              style={{ flex: 1, fontSize: 16, padding: "14px", color: C.ink }}
            >
              ✓ Got It
            </Btn>
          </>
        )}
      </div>

      {/* ─── Listening indicator ─── */}
      {listening && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.secondary, fontFamily: FONT, fontSize: 15, fontWeight: 600 }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.heart, animation: "starPulse 0.8s ease-in-out infinite" }} />
          Listening...
        </div>
      )}

      {/* ─── Correct result ─── */}
      {micResult === "correct" && (
        <Btn onClick={advanceCard} color={C.green} style={{ fontSize: 16, padding: "14px 28px" }}>Next →</Btn>
      )}

      {/* ─── Wrong / try again ─── */}
      {micResult === "wrong" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: FONT, fontSize: 16, color: C.heart, fontWeight: 600 }}>Not quite — try again!</div>
          {micFeedback && (
            <div style={{ fontFamily: FONT, fontSize: 14, color: C.muted, textAlign: "center", maxWidth: 280, lineHeight: 1.4 }}>
              <div>I heard <strong>"{micFeedback.heard}"</strong></div>
              <div style={{ marginTop: 4, color: C.accent, fontWeight: 500 }}>{micFeedback.tip}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => { handleMicWrong_TryAgain(); setTimeout(handleSayIt, 100); }} color={C.secondary} small>Retry</Btn>
            <Btn onClick={handleSkipWord} color={C.heart} small>Skip →</Btn>
          </div>
        </div>
      )}

      {/* ─── Timer expired ─── */}
      {timerExpired && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: FONT, fontSize: 16, color: C.heart, fontWeight: 600 }}>Time's up!</div>
          <Btn onClick={advanceCard} color={C.accent} small>Next →</Btn>
        </div>
      )}

      {/* ─── Word count footer ─── */}
      <div style={{ textAlign: "center", marginTop: 4, fontFamily: FONT, fontSize: 13, color: C.muted, fontWeight: 600 }}>
        Word {idx + 1} of {shuffled.length} · Round {round}/3
      </div>

      {/* ─── Round score indicator ─── */}
      {roundScores[round].total > 0 && (
        <div style={{ fontFamily: FONT, fontSize: 12, color: C.muted, fontWeight: 500 }}>
          Round {round}: {roundScores[round].correct}/{roundScores[round].total} correct
        </div>
      )}
    </div>
  );
}

export default FlashcardMode;
