import { useState, useEffect, useCallback, useRef } from "react";
import { C, FONT, RADIUS, SHADOW } from "../constants";
import Btn from "./Btn";
import { isValidWord, isSightWord } from "../data/dictionary";
import { generateLetterSet } from "../utils/letterGenerator";

const ROUND_SECONDS = 180;
const TILE_AVAILABLE = "available";
const TILE_USED = "used";

function WordMania({ progress, dispatch, lang = "en", onHome }) {
  const [phase, setPhase] = useState("start");
  const [letters, setLetters] = useState([]);
  const [tileStates, setTileStates] = useState([]);
  const [composition, setComposition] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [score, setScore] = useState(0);
  const [sightBonusCount, setSightBonusCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [successFlash, setSuccessFlash] = useState(false);
  const timerRef = useRef(null);
  const foundWordsRef = useRef(null);

  // Timer
  useEffect(() => {
    if (phase !== "play") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Clear feedback after timeout
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 1200);
    return () => clearTimeout(t);
  }, [feedback]);

  const startRound = () => {
    const newLetters = generateLetterSet(lang);
    setLetters(newLetters);
    setTileStates(newLetters.map(() => TILE_AVAILABLE));
    setComposition([]);
    setFoundWords([]);
    setScore(0);
    setSightBonusCount(0);
    setFeedback(null);
    setTimeLeft(ROUND_SECONDS);
    setSuccessFlash(false);
    setPhase("play");
  };

  const tapTile = (index) => {
    if (phase !== "play" || feedback) return;
    if (tileStates[index] !== TILE_AVAILABLE) return;
    setComposition((prev) => [...prev, { letter: letters[index], tileIndex: index }]);
    setTileStates((prev) => {
      const next = [...prev];
      next[index] = TILE_USED;
      return next;
    });
  };

  const tapCompositionLetter = (compIndex) => {
    if (phase !== "play" || feedback) return;
    const removed = composition[compIndex];
    setComposition((prev) => prev.filter((_, i) => i !== compIndex));
    setTileStates((prev) => {
      const next = [...prev];
      next[removed.tileIndex] = TILE_AVAILABLE;
      return next;
    });
  };

  const clearComposition = () => {
    if (phase !== "play" || feedback) return;
    setTileStates(letters.map(() => TILE_AVAILABLE));
    setComposition([]);
  };

  const submitWord = useCallback(() => {
    if (phase !== "play" || feedback) return;
    const word = composition.map((c) => c.letter).join("").toLowerCase();

    if (word.length < 2) {
      setFeedback({ type: "error", message: "Try a longer word!" });
      return;
    }

    if (foundWords.some((fw) => fw.word === word)) {
      setFeedback({ type: "error", message: "You already found that word!" });
      clearComposition();
      return;
    }

    if (!isValidWord(word, lang)) {
      setFeedback({ type: "error", message: "Not a recognized word — keep trying!" });
      return;
    }

    // Word accepted
    const isSight = isSightWord(word, lang);
    const wordScore = word.length + (isSight ? 5 : 0);

    setFoundWords((prev) => [
      ...prev,
      { word, score: wordScore, isSightWord: isSight, submittedAt: Date.now() },
    ]);
    setScore((prev) => prev + wordScore);
    if (isSight) {
      setSightBonusCount((prev) => prev + 1);
      dispatch({ type: "MARK_CORRECT", word });
    }
    setFeedback({ type: "success", message: `+${wordScore}${isSight ? " SIGHT BONUS!" : ""}` });
    setSuccessFlash(true);
    setTimeout(() => setSuccessFlash(false), 400);

    // Reset composition
    setTileStates(letters.map(() => TILE_AVAILABLE));
    setComposition([]);

    // Scroll found words to bottom
    setTimeout(() => {
      if (foundWordsRef.current) {
        foundWordsRef.current.scrollTop = foundWordsRef.current.scrollHeight;
      }
    }, 50);
  }, [phase, feedback, composition, foundWords, letters, lang, dispatch]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ─── PRE-START CARD ────────────────────────────────────────
  if (phase === "start") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(180deg, #FFF5E4 0%, #FFF9F0 50%, ${C.green} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 360,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ fontSize: 56, animation: "fadeRise 0.4s ease-out both" }}>
            🎯
          </div>
          <div
            className="toy-block"
            style={{
              background: C.surface,
              padding: "28px 24px",
              width: "100%",
              textAlign: "center",
              borderWidth: 3,
              boxShadow: SHADOW.toy,
              animation: "fadeRise 0.4s ease-out 0.06s both",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 32,
                fontWeight: 700,
                color: C.ink,
                letterSpacing: 1,
                marginBottom: 16,
              }}
            >
              Word Mania
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                { icon: "🔤", text: "15 letters to build words" },
                { icon: "⏱️", text: "3 minutes on the clock" },
                { icon: "⭐", text: "Sight words earn bonus points" },
              ].map((rule) => (
                <div
                  key={rule.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: FONT,
                    fontSize: 14,
                    color: C.text,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{rule.icon}</span>
                  {rule.text}
                </div>
              ))}
            </div>
            <Btn onClick={startRound} color={C.primary} style={{ width: "100%", fontSize: 18, padding: "16px" }}>
              Start Round
            </Btn>
          </div>
          <button
            className="toy-block toy-pressable"
            onClick={onHome}
            style={{
              background: C.surface,
              color: C.text,
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 20px",
              animation: "fadeRise 0.4s ease-out 0.12s both",
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ─── END SCREEN ────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(180deg, ${C.sun} 0%, ${C.accent} 35%, #FFF5CC 70%, ${C.bg} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          animation: "fadeRise 0.5s ease-out",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 12, animation: "boing 0.6s ease-out" }}>🎉</div>
        <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
          Great Job!
        </div>
        <div
          className="toy-block"
          style={{
            background: C.surface,
            padding: "20px 28px",
            textAlign: "center",
            borderWidth: 3,
            boxShadow: SHADOW.toy,
            marginBottom: 16,
            width: "100%",
            maxWidth: 320,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 18, color: C.text, fontWeight: 500, lineHeight: 1.6 }}>
            You found <strong>{foundWords.length}</strong> words
            <br />
            Total score: <strong style={{ color: C.primary }}>{score}</strong>
            {sightBonusCount > 0 && (
              <>
                <br />
                <span style={{ color: C.accent }}>Sight-word bonuses: {sightBonusCount}</span>
              </>
            )}
          </div>
        </div>

        {foundWords.length > 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: 320,
              maxHeight: 200,
              overflowY: "auto",
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {foundWords.map((fw, i) => (
              <div
                key={fw.word}
                className="toy-block"
                style={{
                  background: i % 2 === 0 ? C.surface : `${C.secondary}33`,
                  padding: "6px 12px",
                  borderWidth: 2,
                  boxShadow: SHADOW.toyXs,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.ink }}>
                    {fw.word.toUpperCase()}
                  </span>
                  {fw.isSightWord && (
                    <span
                      style={{
                        background: C.accent,
                        color: C.ink,
                        fontFamily: FONT,
                        fontSize: 8,
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: 50,
                        border: `2px solid ${C.ink}`,
                      }}
                    >
                      SIGHT +5
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.primary, fontVariantNumeric: "tabular-nums" }}>
                  +{fw.score}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            className="toy-block toy-pressable"
            onClick={startRound}
            style={{
              background: C.primary,
              color: C.ink,
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 700,
              padding: "14px 28px",
              cursor: "pointer",
            }}
          >
            Play Again
          </button>
          <button
            className="toy-block toy-pressable"
            onClick={onHome}
            style={{
              background: C.surface,
              color: C.ink,
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 600,
              padding: "14px 28px",
              cursor: "pointer",
            }}
          >
            🏠 Home
          </button>
        </div>
      </div>
    );
  }

  // ─── PLAY SCREEN ───────────────────────────────────────────
  const timerPct = (timeLeft / ROUND_SECONDS) * 100;
  const compositionWord = composition.map((c) => c.letter).join("");

  return (
    <div style={{ padding: "0 16px 24px", WebkitFontSmoothing: "antialiased" }}>
      {/* Timer + Score bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          marginTop: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: 700,
            color: timeLeft <= 30 ? C.heart : C.ink,
            fontVariantNumeric: "tabular-nums",
            animation: timeLeft <= 10 && timeLeft > 0 ? "starPulse 1s ease-in-out infinite" : "none",
          }}
        >
          {formatTime(timeLeft)}
        </div>
        <div
          className="toy-block"
          style={{
            background: C.surface,
            padding: "6px 16px",
            borderWidth: 2,
            boxShadow: SHADOW.toyXs,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.muted }}>
            Score{" "}
          </span>
          <span
            style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: C.ink, fontVariantNumeric: "tabular-nums" }}
          >
            {score}
          </span>
        </div>
      </div>

      {/* Timer progress bar */}
      <div
        style={{
          background: `${C.ink}20`,
          borderRadius: RADIUS.pill,
          height: 8,
          marginBottom: 16,
          border: `2px solid ${C.ink}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: timeLeft <= 30 ? C.heart : C.primary,
            borderRadius: RADIUS.pill,
            width: `${timerPct}%`,
            transition: "width 1s linear",
          }}
        />
      </div>

      {/* Composition area */}
      <div
        className="toy-block"
        style={{
          background: successFlash ? C.green : `${C.primary}22`,
          padding: "16px 20px",
          textAlign: "center",
          marginBottom: 12,
          borderWidth: 3,
          boxShadow: SHADOW.toySm,
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          flexWrap: "wrap",
          transition: "background 0.2s",
          animation: successFlash ? "boing 0.45s ease-out" : "none",
        }}
      >
        {composition.length === 0 ? (
          <div style={{ fontFamily: FONT, fontSize: 14, color: C.muted, fontWeight: 500 }}>
            Tap letters below to build a word
          </div>
        ) : (
          composition.map((c, i) => (
            <span
              key={i}
              onClick={() => tapCompositionLetter(i)}
              style={{
                fontFamily: FONT,
                fontSize: 32,
                fontWeight: 700,
                color: C.ink,
                cursor: "pointer",
                letterSpacing: 2,
                borderBottom: `3px solid ${C.primary}`,
                transition: "opacity 0.15s",
              }}
            >
              {c.letter.toUpperCase()}
            </span>
          ))
        )}
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          style={{
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 600,
            color: feedback.type === "success" ? C.green : C.heart,
            marginBottom: 8,
            animation: "fadeRise 0.3s ease-out",
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Submit / Clear buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Btn
          onClick={submitWord}
          color={composition.length >= 2 ? C.primary : C.panel}
          style={{
            flex: 1,
            fontSize: 16,
            padding: "12px",
            color: composition.length >= 2 ? C.ink : C.muted,
          }}
        >
          Submit
        </Btn>
        <Btn
          onClick={clearComposition}
          color={C.surface}
          style={{ fontSize: 16, padding: "12px 20px", color: C.ink }}
        >
          Clear
        </Btn>
      </div>

      {/* Letter grid (5x3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {letters.map((letter, i) => {
          const used = tileStates[i] === TILE_USED;
          return (
            <button
              key={`${letter}-${i}`}
              className="toy-block toy-pressable"
              onClick={() => tapTile(i)}
              style={{
                padding: "12px 4px",
                textAlign: "center",
                background: used ? C.panel : C.surface,
                borderWidth: 3,
                cursor: used ? "default" : "pointer",
                opacity: used ? 0.4 : 1,
                transition: "opacity 0.15s, background 0.15s",
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                {letter.toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Found Words list */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 700,
            color: C.muted,
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          FOUND WORDS ({foundWords.length})
        </div>
        {foundWords.length === 0 ? (
          <div
            style={{
              fontFamily: FONT,
              fontSize: 13,
              color: C.muted,
              fontWeight: 500,
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            No words yet — try tapping letters!
          </div>
        ) : (
          <div
            ref={foundWordsRef}
            style={{
              maxHeight: 160,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingRight: 4,
            }}
          >
            {foundWords.map((fw, i) => (
              <div
                key={fw.word}
                className="toy-block"
                style={{
                  background: i % 2 === 0 ? C.surface : `${C.secondary}33`,
                  padding: "8px 12px",
                  borderWidth: 2,
                  boxShadow: SHADOW.toyXs,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  animation: "fadeRise 0.3s ease-out",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: 16,
                      fontWeight: 700,
                      color: C.ink,
                      letterSpacing: 0.5,
                    }}
                  >
                    {fw.word.toUpperCase()}
                  </span>
                  {fw.isSightWord && (
                    <span
                      style={{
                        background: C.accent,
                        color: C.ink,
                        fontFamily: FONT,
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 50,
                        border: `2px solid ${C.ink}`,
                      }}
                    >
                      SIGHT +5
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.primary,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  +{fw.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WordMania;
