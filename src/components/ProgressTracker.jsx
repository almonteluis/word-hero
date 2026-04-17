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

  const now = Date.now();
  const reviewWarningCutoff = now - 5 * 24 * 60 * 60 * 1000;
  const needsReview = Object.keys(progress.mastered).filter((w) => {
    const stat = ws[w];
    const lastSeen = stat ? stat.lastSeen : progress.mastered[w];
    return lastSeen && lastSeen < reviewWarningCutoff;
  });

  const strugglingWords = ALL_WORDS.filter((w) => {
    const stat = ws[w];
    if (!stat || stat.attempts < 3) return false;
    return stat.correct / stat.attempts < 0.6;
  }).sort((a, b) => {
    const aAcc = ws[a].correct / ws[a].attempts;
    const bAcc = ws[b].correct / ws[b].attempts;
    return aAcc - bAcc;
  });

  const rank =
    masteredCount >= 60
      ? "Legendary Hero"
      : masteredCount >= 40
        ? "Super Hero"
        : masteredCount >= 20
          ? "Rising Hero"
          : masteredCount >= 5
            ? "Hero in Training"
            : "New Recruit";

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
            fontWeight: 700,
          }}
        >
          {rank}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: C.muted,
            fontWeight: 500,
          }}
        >
          {kidName}'s Hero Profile
        </div>
      </div>

      {/* Needs Review Alert */}
      {needsReview.length > 0 && (
        <div
          style={{
            background: `${C.heart}10`,
            borderRadius: RADIUS.card,
            padding: 14,
            marginBottom: 16,
            border: `3px solid ${C.heart}30`,
            animation: "fadeUp 0.4s",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: C.heart,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            These words need review
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: C.muted,
              fontWeight: 500,
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
                    fontWeight: 600,
                    fontFamily: FONT,
                    background: `${C.heart}18`,
                    color: C.heart,
                    border: `2px solid ${C.heart}30`,
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
            borderRadius: RADIUS.card,
            padding: 14,
            marginBottom: 16,
            border: `3px solid ${C.accent}30`,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: C.accent,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Tough Words
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: C.muted,
              fontWeight: 500,
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
                    fontWeight: 600,
                    fontFamily: FONT,
                    background: `${C.accent}15`,
                    color: C.accent,
                    border: `2px solid ${C.accent}25`,
                  }}
                >
                  {w}{" "}
                  <span style={{ fontSize: 9, opacity: 0.6 }}>
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
          { label: "Mastered", value: masteredCount, color: C.green, icon: "🛡️" },
          { label: "Learning", value: learningCount, color: C.accent, icon: "⚡" },
          { label: "Accuracy", value: `${accuracy}%`, color: C.secondary, icon: "🎯" },
          { label: "Sessions", value: progress.sessions || 0, color: C.purple, icon: "📅" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              borderRadius: RADIUS.card,
              padding: "12px 16px",
              textAlign: "center",
              border: `3px solid ${s.color}25`,
              boxShadow: `0 4px 12px ${C.shadow}`,
              minWidth: 75,
            }}
          >
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div
              style={{
                fontSize: 26,
                fontFamily: FONT,
                color: s.color,
                fontWeight: 700,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                fontFamily: FONT,
                fontWeight: 600,
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
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Hero Power
          </span>
          <span
            style={{
              color: C.accent,
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {masteredCount}/{ALL_WORDS.length}
          </span>
        </div>
        <div
          style={{
            height: 12,
            background: "white",
            borderRadius: RADIUS.button,
            overflow: "hidden",
            border: `2px solid ${C.border}`,
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: C.accent,
              borderRadius: RADIUS.button,
              transition: "width 0.6s",
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
                background: "white",
                borderRadius: RADIUS.card,
                padding: 14,
                border: `3px solid ${C.border}`,
                boxShadow: `0 4px 12px ${C.shadow}`,
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
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  {gn}
                </span>
                <span
                  style={{
                    fontFamily: FONT,
                    color: gm === words.length ? C.green : C.accent,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {gm === words.length ? "✓ Complete" : `${gm}/${words.length}`}
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
                        fontWeight: 600,
                        fontFamily: FONT,
                        background: progress.mastered[w]
                          ? `${C.green}18`
                          : progress.learning[w]
                            ? `${C.accent}12`
                            : C.surface,
                        color: progress.mastered[w]
                          ? C.green
                          : progress.learning[w]
                            ? C.accent
                            : `${C.text}80`,
                        border: `2px solid ${
                          progress.mastered[w]
                            ? `${C.green}30`
                            : progress.learning[w]
                              ? `${C.accent}25`
                              : C.border
                        }`,
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
