import { useState, useEffect, useCallback } from "react";
import { ALL_WORDS, C, FONT, RADIUS } from "../constants";
import Btn from "./Btn";
import VictoryScreen from "./VictoryScreen";
import { speak } from "../utils/speech";
import { selectPracticeWords } from "../utils/roundWords";
import { shuffle } from "../utils/shuffle";

function FindItGame({ progress, dispatch }) {
  const [target, setTarget] = useState("");
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [shakeWord, setShakeWord] = useState(null);
  const [combo, setCombo] = useState(0);
  const [targets, setTargets] = useState(() => selectPracticeWords(progress));
  const TOTAL = 10;

  const genRound = useCallback(() => {
    const t = targets[round] || targets[0];
    const others = shuffle(ALL_WORDS.filter((w) => w !== t)).slice(0, 3);
    setTarget(t);
    setOptions(shuffle([...others, t]));
    setFeedback(null);
    setShakeWord(null);
    speak(t);
  }, [targets, round]);

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
    setTargets(selectPracticeWords(progress));
    setRound(0);
    setScore(0);
    setCombo(0);
    setFeedback(null);
  };

  if (feedback === "done") {
    return (
      <VictoryScreen
        score={score}
        total={TOTAL}
        onRetry={restart}
        onContinue={restart}
      />
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
      {/* Score + Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            color: C.accent,
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {score}
        </span>
        <div
          style={{
            width: 140,
            height: 10,
            background: "white",
            borderRadius: RADIUS.button,
            overflow: "hidden",
            border: `2px solid ${C.border}`,
          }}
        >
          <div
            style={{
              width: `${(round / TOTAL) * 100}%`,
              height: "100%",
              background: C.accent,
              borderRadius: RADIUS.button,
              transition: "width 0.3s",
            }}
          />
        </div>
        <span
          style={{
            color: C.muted,
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {round + 1}/{TOTAL}
        </span>
      </div>

      {combo >= 3 && (
        <div
          style={{
            color: C.accent,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            animation: "fadeUp 0.3s ease-out",
          }}
        >
          {combo}x Combo!
        </div>
      )}

      {/* Hear word */}
      <div
        style={{
          background: "white",
          borderRadius: RADIUS.card,
          padding: "16px 28px",
          border: `3px solid ${C.accent}30`,
          textAlign: "center",
          boxShadow: `0 4px 16px ${C.shadow}`,
        }}
      >
        <div
          style={{
            color: C.muted,
            fontSize: 12,
            fontFamily: FONT,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Find the word
        </div>
        <button
          onClick={() => speak(target)}
          style={{
            background: C.accent,
            border: "none",
            borderBottom: `4px solid ${C.accent}cc`,
            borderRadius: RADIUS.button,
            padding: "10px 28px",
            cursor: "pointer",
            fontSize: 17,
            fontWeight: 700,
            color: C.textLight,
            fontFamily: FONT,
            boxShadow: `0 4px 12px ${C.accent}30`,
          }}
        >
          Hear Again
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
                background: correct ? C.green : wrong ? C.heart : "white",
                border: correct
                  ? `3px solid ${C.green}`
                  : wrong
                    ? `3px solid ${C.heart}`
                    : `3px solid ${C.border}`,
                borderBottom: correct
                  ? `5px solid ${C.green}cc`
                  : wrong
                    ? `5px solid ${C.heart}cc`
                    : `4px solid ${C.border}`,
                borderRadius: RADIUS.card,
                padding: "18px 14px",
                cursor: "pointer",
                fontSize: 26,
                fontWeight: 700,
                fontFamily: FONT,
                color: correct || wrong ? "white" : C.text,
                letterSpacing: 3,
                boxShadow: `0 4px 12px ${C.shadow}`,
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
            fontFamily: FONT,
            color: C.green,
            animation: "fadeUp 0.3s",
            fontWeight: 700,
          }}
        >
          {
            ["Heroic!", "Boom!", "Super!", "Amazing!"][
              Math.floor(Math.random() * 4)
            ]
          }
        </div>
      )}
    </div>
  );
}

export default FindItGame;
