import { useState, useEffect, useCallback, useRef } from "react";
import { C, FONT, RADIUS, SHADOW, EASE } from "../constants";
import Btn from "./Btn";
import VictoryScreen from "./VictoryScreen";
import { speak } from "../utils/speech";
import {
  useSpeechRecognition,
  wordMatchLevel,
} from "../utils/speechRecognition";
import { getPronunciationFeedback } from "../utils/pronunciationFeedback";
import {
  selectPracticeWords,
  selectStrugglingWords,
} from "../utils/roundWords";

const CHECKING_MS = 450;

function ListeningBars() {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        alignItems: "center",
        height: 24,
        padding: "0 4px",
      }}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 24,
            background: C.heart,
            borderRadius: 3,
            transformOrigin: "center",
            animation: `barWave 0.9s ease-in-out ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function FlashcardMode({
  progress,
  dispatch,
  onAdvanceToFindIt,
  onExitFocused,
  onHome,
  focusedWord,
  lang = "en",
}) {
  const initialDeck = () =>
    selectPracticeWords(progress, undefined, lang, focusedWord);

  const [idx, setIdx] = useState(0);
  const [shuffled, setShuffled] = useState(initialDeck);
  const [round, setRound] = useState(1);
  const [roundScores, setRoundScores] = useState({
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
  });
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [sessionMisses, setSessionMisses] = useState(() => new Set());

  // Speech state machine for the current card.
  // phase: 'idle' | 'recording' | 'checking' | 'feedback'
  const [phase, setPhase] = useState("idle");
  const [feedback, setFeedback] = useState(null); // { level, heard, tip }
  const checkingTimerRef = useRef(null);
  const wasListeningRef = useRef(false);

  const { listening, result, startListening, stopListening, supported } =
    useSpeechRecognition(lang);

  const word = shuffled[idx];

  const addSessionMiss = useCallback((w) => {
    setSessionMisses((prev) => {
      if (!w || prev.has(w)) return prev;
      const next = new Set(prev);
      next.add(w);
      return next;
    });
  }, []);

  const resetCardState = useCallback(() => {
    if (checkingTimerRef.current) {
      clearTimeout(checkingTimerRef.current);
      checkingTimerRef.current = null;
    }
    setPhase("idle");
    setFeedback(null);
  }, []);

  // Play the model audio whenever a new card surfaces.
  useEffect(() => {
    if (!word) return;
    const t = setTimeout(() => speak(word, lang), 60);
    return () => clearTimeout(t);
  }, [word, lang]);

  useEffect(() => {
    resetCardState();
  }, [idx, round, resetCardState]);

  useEffect(() => () => {
    if (checkingTimerRef.current) clearTimeout(checkingTimerRef.current);
  }, []);

  // When the recognizer stops, decide where to go next:
  //   • result present → brief 'checking' tease → 'feedback'
  //   • result empty   → straight to a friendly 'miss' so the kid isn't stuck
  useEffect(() => {
    const wasListening = wasListeningRef.current;
    wasListeningRef.current = listening;
    if (!wasListening || listening || phase !== "recording") return;
    if (result) {
      setPhase("checking");
    } else {
      setFeedback({
        level: "miss",
        heard: null,
        tip: "I didn't catch that — try again?",
      });
      setPhase("feedback");
      addSessionMiss(word);
    }
  }, [listening, result, phase, word, addSessionMiss]);

  // Brief "Checking…" beat between recognition result and feedback.
  useEffect(() => {
    if (phase !== "checking" || !result) return;
    const level = wordMatchLevel(result, word);
    const heardObj =
      level === "correct" ? null : getPronunciationFeedback(result, word, lang);
    checkingTimerRef.current = setTimeout(() => {
      setFeedback({
        level,
        heard: heardObj?.heard ?? null,
        tip: heardObj?.tip ?? null,
      });
      setPhase("feedback");
      if (level !== "correct") addSessionMiss(word);
    }, CHECKING_MS);
    return () => {
      if (checkingTimerRef.current) clearTimeout(checkingTimerRef.current);
    };
  }, [phase, result, word, lang, addSessionMiss]);

  const handleSayIt = () => {
    setFeedback(null);
    setPhase("recording");
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
    setPhase("idle");
  };

  const handleReplay = () => speak(word, lang);

  const advanceCard = () => {
    if (listening) stopListening();
    if (idx + 1 >= shuffled.length) {
      if (round < 3) setShowRoundSummary(true);
      else setShowFinalSummary(true);
    } else {
      setIdx((i) => i + 1);
    }
  };

  const markGotIt = () => {
    dispatch({ type: "MARK_CORRECT", word });
    setRoundScores((s) => ({
      ...s,
      [round]: { correct: s[round].correct + 1, total: s[round].total + 1 },
    }));
    advanceCard();
  };

  const markTricky = () => {
    dispatch({ type: "MARK_WRONG", word });
    setRoundScores((s) => ({
      ...s,
      [round]: { ...s[round], total: s[round].total + 1 },
    }));
    addSessionMiss(word);
    advanceCard();
  };

  const startNextRound = () => {
    const nextRound = round + 1;
    const nextDeck = selectStrugglingWords(
      progress,
      shuffled,
      [...sessionMisses],
      lang,
    );
    setRound(nextRound);
    setShuffled(nextDeck);
    setIdx(0);
    setShowRoundSummary(false);
    setShowMicPrompt(true);
  };

  const totalCorrect =
    roundScores[1].correct + roundScores[2].correct + roundScores[3].correct;
  const totalAttempts =
    roundScores[1].total + roundScores[2].total + roundScores[3].total;
  const overallPct =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const passed = overallPct >= 80;

  const roundColors = [C.secondary, C.accent, C.primary];
  const roundLabels = ["Listen", "Say It", "Quick"];

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
          <div style={{ fontFamily: FONT, fontSize: 36, color: C.ink, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{rs.correct}/{rs.total} ({pct}%)</div>
        </div>
        <div style={{ color: C.muted, fontFamily: FONT, fontSize: 14, fontWeight: 500, textAlign: "center", maxWidth: 280 }}>
          {round === 1
            ? "Next: Say each word out loud — practice the tricky ones!"
            : "Next: Quick round — focus on the words you missed."}
        </div>
        <Btn onClick={startNextRound} color={roundColors[round]} style={{ color: C.ink }}>Start Round {round + 1}</Btn>
      </div>
    );
  }

  if (showFinalSummary) {
    return (
      <VictoryScreen
        score={totalCorrect}
        total={totalAttempts}
        onRetry={() => {
          setRound(1);
          setRoundScores({ 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 } });
          setShuffled(initialDeck());
          setSessionMisses(new Set());
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
        continueLabel={focusedWord ? "Done →" : "Play Find It →"}
        onHome={onHome}
      />
    );
  }

  if (showMicPrompt) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "40px 24px", animation: "fadeRise 0.4s ease-out" }}>
        <div style={{ fontSize: 64 }}>🎤</div>
        <div style={{ fontFamily: FONT, fontSize: 22, color: roundColors[round], fontWeight: 700, textAlign: "center" }}>
          Practice Out Loud
        </div>
        <div
          className="toy-block"
          style={{
            background: C.surface,
            padding: "16px 20px",
            maxWidth: 320,
            borderWidth: 3,
            boxShadow: SHADOW.toySm,
            textAlign: "center",
          }}
        >
          <div style={{ color: C.text, fontFamily: FONT, fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
            Tap <strong>🎤 Say It</strong> when you're ready to read the word out loud.
            You can also tap <strong>🔊 Hear it again</strong> any time.
            <div style={{ marginTop: 6, color: C.muted, fontWeight: 600 }}>
              No timer — skipping is totally fine!
            </div>
          </div>
        </div>
        <Btn onClick={() => setShowMicPrompt(false)} color={C.primary}>I'm Ready!</Btn>
      </div>
    );
  }

  const isListening = listening || phase === "checking";
  const correctFlash = feedback?.level === "correct";
  const closeFlash = feedback?.level === "close";
  const missFlash = feedback?.level === "miss";

  const cardBg = correctFlash
    ? C.green
    : closeFlash
      ? "#FFF6CC"
      : missFlash
        ? "#F1F5F9"
        : C.surface;
  const cardAnim = correctFlash
    ? "boing 0.45s ease-out"
    : closeFlash || missFlash
      ? "fadeRise 0.3s ease-out"
      : "fadeRise 0.3s ease-out";
  const subLabel =
    round === 1
      ? "Listen and learn"
      : round === 2
        ? "Say it out loud!"
        : "Quick round — focus on tricky words";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 16px 24px", WebkitFontSmoothing: "antialiased" }}>

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
                transition: `background 0.2s ${EASE.out}, box-shadow 0.2s ${EASE.out}, opacity 0.2s ${EASE.out}`,
                opacity: isDone ? 0.6 : 1,
              }}
            >
              {roundLabels[r - 1]}
            </div>
          );
        })}
      </div>

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
                transition: `background 0.2s ${EASE.out}, box-shadow 0.2s ${EASE.out}`,
              }}
            />
          );
        })}
      </div>

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
            {correctFlash ? "✓ Nice!" : subLabel}
          </div>
        </div>
      </div>

      {/* ─── Listening / checking state ───────────────── */}
      {isListening && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            animation: "fadeRise 0.25s ease-out",
          }}
        >
          {listening && <ListeningBars />}
          <div
            style={{
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              color: phase === "checking" ? C.muted : C.heart,
            }}
          >
            {phase === "checking" ? "Checking…" : "I'm listening…"}
          </div>
          {listening && (
            <Btn onClick={handleStopListening} color={C.panel} small>
              Stop
            </Btn>
          )}
        </div>
      )}

      {/* ─── Feedback banner (after speech result) ───── */}
      {phase === "feedback" && feedback && (
        <div
          className="toy-block"
          style={{
            background:
              feedback.level === "correct"
                ? C.green
                : feedback.level === "close"
                  ? C.accent
                  : C.surface,
            padding: "12px 18px",
            maxWidth: 320,
            borderWidth: 3,
            boxShadow: SHADOW.toyXs,
            textAlign: "center",
            animation: "fadeRise 0.3s ease-out",
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.ink }}>
            {feedback.level === "correct"
              ? `Nice! "${word}"`
              : feedback.level === "close"
                ? "So close — want to try again?"
                : "Hmm, let's try once more"}
          </div>
          {feedback.level !== "correct" && feedback.heard && (
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.muted, marginTop: 4 }}>
              I heard <strong>"{feedback.heard}"</strong>
            </div>
          )}
          {feedback.tip && feedback.level !== "correct" && (
            <div style={{ fontFamily: FONT, fontSize: 13, color: C.text, marginTop: 4, lineHeight: 1.4 }}>
              {feedback.tip}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
            {feedback.level === "correct" ? (
              <Btn onClick={markGotIt} color={C.green} small>
                Next →
              </Btn>
            ) : (
              <>
                <Btn onClick={handleSayIt} color={C.secondary} small>
                  🎤 Try Again
                </Btn>
                <Btn onClick={handleReplay} color={C.panel} small>
                  🔊 Hear it
                </Btn>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Practice row: replay + mic (idle only) ───── */}
      {phase === "idle" && (
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            padding: "0 4px",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Btn
            onClick={handleReplay}
            color={C.panel}
            style={{ flex: 1, fontSize: 15, padding: "12px", color: C.text }}
          >
            🔊 Hear it again
          </Btn>
          {supported && (
            <Btn
              onClick={handleSayIt}
              color={C.secondary}
              style={{ flex: 1, fontSize: 15, padding: "12px", color: C.ink }}
            >
              🎤 Say It
            </Btn>
          )}
        </div>
      )}

      {/* ─── Self-eval (source of truth for progress) ─── */}
      {(phase === "idle" ||
        (phase === "feedback" && feedback?.level !== "correct")) && (
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            padding: "0 4px",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Btn
            onClick={markTricky}
            color="#FFE4E6"
            style={{ flex: 1, fontSize: 16, padding: "14px", color: C.heart }}
          >
            ✗ Tricky one
          </Btn>
          <Btn
            onClick={markGotIt}
            color={C.green}
            style={{ flex: 1, fontSize: 16, padding: "14px", color: C.ink }}
          >
            ✓ Got it
          </Btn>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 4, fontFamily: FONT, fontSize: 13, color: C.muted, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
        Word {idx + 1} of {shuffled.length} · Round {round}/3
      </div>

      {roundScores[round].total > 0 && (
        <div style={{ fontFamily: FONT, fontSize: 12, color: C.muted, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
          Round {round}: {roundScores[round].correct}/{roundScores[round].total} correct
        </div>
      )}
    </div>
  );
}

export default FlashcardMode;
