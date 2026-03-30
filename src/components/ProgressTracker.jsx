import { useMemo } from "react";
import { C, ALL_WORDS, GROUP_NAMES, WORD_GROUPS } from "../constants";

export default function ProgressTracker({ progress, kidName }) {
  const masteredCount = Object.keys(progress.mastered).length;
  const learningCount = Object.keys(progress.learning).length;
  const pct = Math.round((masteredCount / ALL_WORDS.length) * 100);
  const accuracy =
    progress.totalAttempts > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
      : 0;

  const rank = useMemo(() => {
    if (masteredCount >= 60) return "LEGENDARY HERO";
    if (masteredCount >= 40) return "SUPER HERO";
    if (masteredCount >= 20) return "RISING HERO";
    if (masteredCount >= 5) return "HERO IN TRAINING";
    return "NEW RECRUIT";
  }, [masteredCount]);

  const rankEmoji = useMemo(() => {
    if (masteredCount >= 60) return "👑";
    if (masteredCount >= 40) return "🦸";
    if (masteredCount >= 20) return "⚡";
    return "🛡️";
  }, [masteredCount]);

  const stats = [
    { label: "MASTERED", value: masteredCount, color: C.green, icon: "🛡️" },
    { label: "LEARNING", value: learningCount, color: C.accent, icon: "⚡" },
    { label: "ACCURACY", value: `${accuracy}%`, color: C.blue, icon: "🎯" },
    { label: "SESSIONS", value: progress.sessions || 0, color: C.purple, icon: "📅" },
  ];

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>{rankEmoji}</div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 20,
            color: C.accent,
            letterSpacing: 3,
            textShadow: `0 0 15px ${C.accent}40`,
          }}
        >
          {rank}
        </div>
        <div
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 12,
            color: C.muted,
            letterSpacing: 2,
          }}
        >
          {kidName.toUpperCase()}'S HERO PROFILE
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: C.panel,
              borderRadius: 14,
              padding: "12px 16px",
              textAlign: "center",
              border: `1px solid ${s.color}25`,
              boxShadow: `0 0 15px ${s.color}10`,
              minWidth: 75,
            }}
          >
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div
              style={{
                fontSize: 26,
                fontFamily: "'Russo One', sans-serif",
                color: s.color,
                letterSpacing: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 9,
                color: C.muted,
                fontFamily: "'Russo One', sans-serif",
                letterSpacing: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 380, margin: "0 auto 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              color: C.muted,
              fontFamily: "'Russo One', sans-serif",
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            HERO POWER
          </span>
          <span
            style={{
              color: C.accent,
              fontFamily: "'Russo One', sans-serif",
              fontSize: 11,
            }}
          >
            {masteredCount}/{ALL_WORDS.length}
          </span>
        </div>
        <div
          style={{
            height: 12,
            background: C.panel,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${C.accent}20`,
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${C.blue}, ${C.accent}, ${C.red})`,
              borderRadius: 8,
              transition: "width 0.6s",
              boxShadow: `0 0 12px ${C.accent}40`,
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {GROUP_NAMES.map((gn) => {
          const words = WORD_GROUPS[gn];
          const gm = words.filter((w) => progress.mastered[w]).length;
          const complete = gm === words.length;
          return (
            <div
              key={gn}
              style={{
                background: C.panel,
                borderRadius: 14,
                padding: 14,
                border: `1px solid ${C.accent}15`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    color: C.text,
                    fontSize: 14,
                    letterSpacing: 1,
                  }}
                >
                  {gn}
                </span>
                <span
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    color: complete ? C.green : C.accent,
                    fontSize: 12,
                  }}
                >
                  {complete ? "✓ COMPLETE" : `${gm}/${words.length}`}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {words.map((w) => {
                  const isMastered = progress.mastered[w];
                  const isLearning = progress.learning[w];
                  return (
                    <span
                      key={w}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Russo One', sans-serif",
                        letterSpacing: 1,
                        background: isMastered
                          ? C.green + "20"
                          : isLearning
                            ? C.accent + "15"
                            : C.bg,
                        color: isMastered
                          ? C.green
                          : isLearning
                            ? C.accent
                            : C.muted + "80",
                        border: `1px solid ${
                          isMastered
                            ? C.green + "35"
                            : isLearning
                              ? C.accent + "25"
                              : C.muted + "15"
                        }`,
                      }}
                    >
                      {isMastered && "★ "}
                      {w}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
