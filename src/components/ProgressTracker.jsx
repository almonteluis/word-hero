import { C, FONT, RADIUS, ALL_WORDS, WORD_GROUPS, GROUP_NAMES } from "../constants";
import { MASTERY_SESSIONS } from "../utils/progress";
import DailyReminderSettings from "./DailyReminderSettings";

function ProgressTracker({ progress, kidName }) {
  const masteredCount = Object.keys(progress.mastered).length;
  const learningCount = Object.keys(progress.learning).length;
  const pct = Math.round((masteredCount / ALL_WORDS.length) * 100);
  const accuracy =
    progress.totalAttempts > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
      : 0;
  const ws = progress.wordStats || {};

  // Find words needing review (mastered but approaching 7-day limit)
  const now = Date.now();
  const reviewWarningCutoff = now - 5 * 24 * 60 * 60 * 1000; // warn at 5 days
  const needsReview = Object.keys(progress.mastered).filter((w) => {
    const stat = ws[w];
    const lastSeen = stat ? stat.lastSeen : progress.mastered[w];
    return lastSeen && lastSeen < reviewWarningCutoff;
  });

  // Find struggling words (attempted 3+ times with < 60% accuracy)
  const strugglingWords = ALL_WORDS.filter((w) => {
    const stat = ws[w];
    if (!stat || stat.attempts < 3) return false;
    return stat.correct / stat.attempts < 0.6;
  }).sort((a, b) => {
    const aAcc = ws[a].correct / ws[a].attempts;
    const bAcc = ws[b].correct / ws[b].attempts;
    return aAcc - bAcc;
  });

  // Rank system
  const rank =
    masteredCount >= 60
      ? "LEGENDARY HERO"
      : masteredCount >= 40
        ? "SUPER HERO"
        : masteredCount >= 20
          ? "RISING HERO"
          : masteredCount >= 5
            ? "HERO IN TRAINING"
            : "NEW RECRUIT";

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      {/* Hero rank */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>
          {masteredCount >= 60
            ? "👑"
            : masteredCount >= 40
              ? "🦸"
              : masteredCount >= 20
                ? "⚡"
                : "🛡️"}
        </div>
        <div
          style={{
            fontFamily: FONT,
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
            fontFamily: FONT,
            fontSize: 12,
            color: C.muted,
            letterSpacing: 2,
          }}
        >
          {kidName.toUpperCase()}'S HERO PROFILE
        </div>
      </div>

      {/* Needs Review Alert */}
      {needsReview.length > 0 && (
        <div
          style={{
            background: `${C.red}15`,
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            border: `2px solid ${C.red}40`,
            animation: "fadeUp 0.4s",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 13,
              color: C.red,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            THESE WORDS NEED REVIEW
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 11,
              color: C.muted,
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            Practice these soon or they'll lose mastery!
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {needsReview.map((w) => {
              const stat = ws[w];
              const daysAgo = stat
                ? Math.floor((now - stat.lastSeen) / (24 * 60 * 60 * 1000))
                : "?";
              return (
                <span
                  key={w}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: FONT,
                    letterSpacing: 1,
                    background: C.red + "20",
                    color: C.red,
                    border: `1px solid ${C.red}35`,
                  }}
                >
                  {w}{" "}
                  <span style={{ fontSize: 9, opacity: 0.7 }}>{daysAgo}d</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Struggling Words Alert */}
      {strugglingWords.length > 0 && (
        <div
          style={{
            background: `${C.accent}10`,
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            border: `2px solid ${C.accent}30`,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 13,
              color: C.accent,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            TOUGH WORDS
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 11,
              color: C.muted,
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            These words need extra practice
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {strugglingWords.slice(0, 10).map((w) => {
              const stat = ws[w];
              const wordAcc = Math.round((stat.correct / stat.attempts) * 100);
              return (
                <span
                  key={w}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: FONT,
                    letterSpacing: 1,
                    background: C.accent + "15",
                    color: C.accent,
                    border: `1px solid ${C.accent}25`,
                  }}
                >
                  {w}{" "}
                  <span style={{ fontSize: 9, opacity: 0.7 }}>
                    {wordAcc}% ({stat.attempts}x)
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "MASTERED",
            value: masteredCount,
            color: C.green,
            icon: "🛡️",
          },
          {
            label: "LEARNING",
            value: learningCount,
            color: C.accent,
            icon: "⚡",
          },
          {
            label: "ACCURACY",
            value: `${accuracy}%`,
            color: C.blue,
            icon: "🎯",
          },
          {
            label: "SESSIONS",
            value: progress.sessions || 0,
            color: C.purple,
            icon: "📅",
          },
        ].map((s) => (
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
                fontFamily: FONT,
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
                fontFamily: FONT,
                letterSpacing: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Power bar */}
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
              fontFamily: FONT,
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            HERO POWER
          </span>
          <span
            style={{
              color: C.accent,
              fontFamily: FONT,
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

      {/* Word groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {GROUP_NAMES.map((gn) => {
          const words = WORD_GROUPS[gn];
          const gm = words.filter((w) => progress.mastered[w]).length;
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
                    fontFamily: FONT,
                    color: C.text,
                    fontSize: 14,
                    letterSpacing: 1,
                  }}
                >
                  {gn}
                </span>
                <span
                  style={{
                    fontFamily: FONT,
                    color: gm === words.length ? C.green : C.accent,
                    fontSize: 12,
                  }}
                >
                  {gm === words.length ? "✓ COMPLETE" : `${gm}/${words.length}`}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {words.map((w) => {
                  const stat = ws[w];
                  const hasStats = stat && stat.attempts > 0;
                  const wordAcc = hasStats
                    ? Math.round((stat.correct / stat.attempts) * 100)
                    : null;
                  const sessionsLeft = hasStats
                    ? Math.max(
                        0,
                        MASTERY_SESSIONS - (stat.sessionsCorrect || 0),
                      )
                    : MASTERY_SESSIONS;
                  return (
                    <span
                      key={w}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: FONT,
                        letterSpacing: 1,
                        background: progress.mastered[w]
                          ? C.green + "20"
                          : progress.learning[w]
                            ? C.accent + "15"
                            : C.bg,
                        color: progress.mastered[w]
                          ? C.green
                          : progress.learning[w]
                            ? C.accent
                            : C.muted + "80",
                        border: `1px solid ${
                          progress.mastered[w]
                            ? C.green + "35"
                            : progress.learning[w]
                              ? C.accent + "25"
                              : C.muted + "15"
                        }`,
                        position: "relative",
                      }}
                      title={
                        hasStats
                          ? `${wordAcc}% accuracy, ${stat.attempts} attempts, ${sessionsLeft} sessions to mastery`
                          : "Not practiced yet"
                      }
                    >
                      {progress.mastered[w] && "★ "}
                      {w}
                      {hasStats && !progress.mastered[w] && (
                        <span
                          style={{ fontSize: 8, opacity: 0.6, marginLeft: 2 }}
                        >
                          {wordAcc}%
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <DailyReminderSettings />
    </div>
  );
}

export default ProgressTracker;
