import { useEffect } from "react";
import { C, FONT, RADIUS, WORD_GROUPS } from "../../constants";
import { getWordStats } from "../../utils/progress";
import { speak } from "../../utils/speech";

function findWordGroup(word) {
  for (const [name, words] of Object.entries(WORD_GROUPS)) {
    if (words.includes(word)) return name;
  }
  return null;
}

function formatDate(ms) {
  if (!ms) return null;
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WordDetailModal({ word, progress, onClose, onPractice }) {
  useEffect(() => {
    if (!word) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [word, onClose]);

  if (!word) return null;

  const ws = getWordStats(progress, word);
  const mastered = progress.mastered?.[word];
  const accuracy =
    ws.attempts > 0 ? Math.round((ws.correct / ws.attempts) * 100) : null;
  const group = findWordGroup(word);

  const stats = [
    {
      label: "Accuracy",
      value: accuracy !== null ? `${accuracy}%` : "—",
    },
    { label: "Attempts", value: ws.attempts || 0 },
    {
      label: "Sessions",
      value: `${Math.min(ws.sessionsCorrect || 0, 3)}/3`,
    },
    {
      label: mastered ? "Mastered" : "Status",
      value: mastered ? formatDate(mastered) : ws.attempts > 0 ? "Learning" : "New",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${word} details`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "wd-fade-in 0.18s ease-out",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.5)",
        }}
      />
      <div
        className="toy-block"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 320,
          background: C.surface,
          padding: 24,
          borderWidth: 3,
          boxShadow: `4px 6px 0 ${C.ink}`,
          animation: "wd-pop-in 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: `2px solid ${C.ink}`,
            background: C.surface,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            color: C.text,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 36,
              fontWeight: 700,
              color: C.text,
              letterSpacing: 2,
              lineHeight: 1.1,
            }}
          >
            {word}
          </div>
          {group && (
            <div
              style={{
                fontFamily: FONT,
                fontSize: 11,
                color: C.muted,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {group}
            </div>
          )}
        </div>

        <button
          onClick={() => speak(word)}
          className="toy-block toy-pressable"
          style={{
            width: "100%",
            background: C.secondary,
            border: `3px solid ${C.ink}`,
            boxShadow: `3px 3px 0 ${C.ink}`,
            borderRadius: RADIUS.button,
            padding: "10px 16px",
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            color: C.ink,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          🔊 Hear it
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 18,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: C.panel,
                border: `2px solid ${C.ink}`,
                borderRadius: 12,
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.muted,
                  letterSpacing: 0.5,
                }}
              >
                {s.label.toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  marginTop: 2,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onPractice?.(word)}
          className="toy-block toy-pressable"
          style={{
            width: "100%",
            background: C.primary,
            border: `3px solid ${C.ink}`,
            boxShadow: `3px 4px 0 ${C.ink}`,
            borderRadius: RADIUS.button,
            padding: "12px 16px",
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 700,
            color: C.textLight,
            cursor: "pointer",
          }}
        >
          🎯 Practice this word
        </button>
      </div>

      <style>{`
        @keyframes wd-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wd-pop-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
