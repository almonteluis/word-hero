import { useMemo } from "react";
import { C, FONT, RADIUS, getWordBank } from "../constants";
import { checkMastery, getWordStats } from "../utils/progress";
import { speak } from "../utils/speech";

const GROUP_DEFS = [
  { key: "mastered", label: "Mastered", emoji: "✅", color: C.green },
  { key: "learning", label: "Learning", emoji: "📝", color: C.accent },
  { key: "new", label: "Not Started", emoji: "🆕", color: C.panel },
];

export default function DictionaryScreen({ progress, lang = "en" }) {
  const { ALL_WORDS } = getWordBank(lang);

  const { groups, counts } = useMemo(() => {
    const buckets = { mastered: [], learning: [], new: [] };

    ALL_WORDS.forEach((w) => {
      const word = typeof w === "object" ? w.word : w;
      if (progress.mastered?.[word]) {
        buckets.mastered.push(word);
      } else {
        const ws = getWordStats(progress, word);
        if (checkMastery(ws)) {
          buckets.mastered.push(word);
        } else if (progress.learning?.[word]) {
          buckets.learning.push(word);
        } else {
          buckets.new.push(word);
        }
      }
    });

    return {
      groups: GROUP_DEFS.map((def) => ({ ...def, words: buckets[def.key] })),
      counts: {
        total: ALL_WORDS.length,
        mastered: buckets.mastered.length,
        learning: buckets.learning.length,
      },
    };
  }, [ALL_WORDS, progress]);

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9F0", paddingBottom: 90, WebkitFontSmoothing: "antialiased" }}>
      <div
        style={{
          background: "linear-gradient(180deg, #FFF5E4 0%, #FFF9F0 100%)",
          padding: "max(24px, env(safe-area-inset-top)) 14px 14px",
          maxWidth: 420,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            letterSpacing: -0.5,
            marginBottom: 14,
            textWrap: "balance",
            animation: "fadeRise 0.4s ease-out both",
          }}
        >
          📖 My Words
        </div>

        <div
          className="toy-block"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 0,
            borderWidth: 3,
            boxShadow: `3px 4px 0 ${C.ink}`,
            background: C.surface,
            marginBottom: 18,
            overflow: "hidden",
            animation: "fadeRise 0.4s ease-out 0.06s both",
          }}
        >
          <StatCell value={counts.total} label="TOTAL" />
          <StatCell value={counts.mastered} label="MASTERED" bg={C.green} />
          <StatCell value={counts.learning} label="LEARNING" bg={C.accent} />
        </div>

        {groups.map((group, i) => (
          <div
            key={group.key}
            className="toy-block"
            style={{
              background: C.surface,
              borderWidth: 3,
              boxShadow: `3px 4px 0 ${C.ink}`,
              padding: 16,
              marginBottom: 14,
              animation: `fadeRise 0.4s ease-out ${0.14 + i * 0.08}s both`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: group.words.length ? 12 : 0,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: group.color,
                  border: `2px solid ${C.ink}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {group.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.text,
                  }}
                >
                  {group.label}
                </span>
              </div>
              <div
                style={{
                  background: group.color,
                  borderRadius: RADIUS.pill,
                  padding: "2px 10px",
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.ink,
                  border: `2px solid ${C.ink}`,
                }}
              >
                {group.words.length}
              </div>
            </div>

            {group.words.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {group.words.map((w) => (
                  <button
                    key={w}
                    onClick={() => speak(w, lang)}
                    aria-label={`Hear ${w}`}
                    className="toy-pressable"
                    style={{
                      background: group.color,
                      border: `2px solid ${C.ink}`,
                      borderRadius: RADIUS.pill,
                      padding: "8px 18px",
                      minHeight: 44,
                      minWidth: 44,
                      fontFamily: FONT,
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.ink,
                      boxShadow: `2px 3px 0 ${C.ink}`,
                      cursor: "pointer",
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  color: C.muted,
                  fontWeight: 500,
                  padding: "8px 0 4px",
                }}
              >
                {group.key === "mastered"
                  ? "No words mastered yet. Keep practicing!"
                  : group.key === "learning"
                    ? "Nothing in progress yet. Start a round!"
                    : "All words started — great job!"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCell({ value, label, bg }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "12px 6px",
        background: bg || "transparent",
        borderLeft: bg ? `2px solid ${C.ink}` : "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 700,
          color: C.ink,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 9,
          fontWeight: 700,
          color: C.ink,
          marginTop: 4,
          letterSpacing: 0.6,
        }}
      >
        {label}
      </div>
    </div>
  );
}
