import { useState, useEffect, useCallback } from "react";
import { WORD_GROUPS, GROUP_NAMES, C } from "../constants";
import GroupSelector from "./GroupSelector";
import Btn from "./Btn";
import { speak } from "../utils/speech";
import { weightedShuffle } from "../utils/progress";

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

export default FindItGame;
