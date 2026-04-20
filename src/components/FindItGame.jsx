import { useState, useEffect, useCallback } from "react";
import { C, FONT, RADIUS, getWordBank } from "../constants";
import VictoryScreen from "./VictoryScreen";
import { speak } from "../utils/speech";
import { selectPracticeWords } from "../utils/roundWords";
import { shuffle } from "../utils/shuffle";

function FindItGame({ progress, dispatch, lang = "en" }) {
  const [target, setTarget] = useState("");
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [wrongWord, setWrongWord] = useState(null);
  const [targets, setTargets] = useState(() => selectPracticeWords(progress, undefined, lang));
  const TOTAL = 10;

  const genRound = useCallback(() => {
    const { ALL_WORDS } = getWordBank(lang);
    const t = targets[round] || targets[0];
    const others = shuffle(ALL_WORDS.filter((w) => w !== t)).slice(0, 3);
    setTarget(t);
    setOptions(shuffle([...others, t]));
    setFeedback(null);
    setWrongWord(null);
    speak(t, lang);
  }, [targets, round, lang]);

  useEffect(() => {
    genRound();
  }, [genRound, round]);

  const handlePick = (w) => {
    if (feedback) return;
    if (w === target) {
      setFeedback("correct");
      dispatch({ type: "MARK_CORRECT", word: target });
      setScore((s) => s + 1);
      setTimeout(() => {
        if (round + 1 < TOTAL) setRound((r) => r + 1);
        else setFeedback("done");
      }, 1000);
    } else {
      setFeedback("wrong");
      setWrongWord(w);
      dispatch({ type: "MARK_WRONG", word: target });
      setTimeout(() => {
        setFeedback(null);
        setWrongWord(null);
      }, 800);
    }
  };

  const restart = () => {
    setTargets(selectPracticeWords(progress, undefined, lang));
    setRound(0);
    setScore(0);
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
    <div style={{ padding: "0 20px 24px" }}>
      {/* Progress bar */}
      <div
        style={{
          background: `${C.ink}20`,
          borderRadius: RADIUS.pill,
          height: 10,
          marginTop: 20,
          marginBottom: 28,
          border: `2px solid ${C.ink}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: C.primary,
            borderRadius: RADIUS.pill,
            width: `${(round / TOTAL) * 100}%`,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Prompt card */}
      <div
        className="toy-block"
        style={{
          background: C.primary,
          padding: "20px 24px",
          textAlign: "center",
          marginBottom: 24,
          borderWidth: 3,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: "white",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Tap the word you hear:
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 48,
            fontWeight: 700,
            color: "white",
            letterSpacing: 2,
          }}
        >
          {target}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 12,
            color: `${C.textLight}cc`,
            marginTop: 4,
          }}
        >
          Question {round + 1} of {TOTAL}
        </div>
        <button
          onClick={() => speak(target, lang)}
          style={{
            marginTop: 10,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: RADIUS.pill,
            padding: "4px 14px",
            cursor: "pointer",
            fontSize: 16,
            fontFamily: FONT,
            color: "white",
          }}
        >
          🔊
        </button>
      </div>

      {/* Options — 2x2 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {options.map((w) => {
          const isCorrect = feedback === "correct" && w === target;
          const isWrong = wrongWord === w;
          const bg = isCorrect ? C.green : isWrong ? "#FFE4E6" : C.surface;
          const anim = isCorrect
            ? "boing 0.45s ease-out"
            : isWrong
              ? "wobble 0.4s ease-out"
              : "none";

          return (
            <button
              key={w}
              className="toy-block toy-pressable"
              onClick={() => handlePick(w)}
              style={{
                padding: "22px 16px",
                textAlign: "center",
                background: bg,
                borderWidth: 3,
                cursor: "pointer",
                animation: anim,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                {w}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FindItGame;
