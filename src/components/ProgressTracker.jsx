import { C, FONT, RADIUS, ALL_WORDS, WORD_GROUPS, GROUP_NAMES } from "../constants";
import { MASTERY_SESSIONS } from "../utils/progress";
import DailyReminderSettings from "./DailyReminderSettings";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Build streak from session history or simulate from sessions count
function getStreak(progress) {
  const sessions = progress.sessions || 0;
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7; // Mon=0
  const streak = [];
  for (let i = 0; i < 7; i++) {
    if (i < todayIdx) {
      // Past days — mark completed if enough sessions
      streak.push(sessions >= (todayIdx - i) ? "done" : "pending");
    } else if (i === todayIdx) {
      streak.push(sessions > 0 ? "done" : "today");
    } else {
      streak.push("pending");
    }
  }
  return streak;
}

// Achievement-style milestones
function getAchievements(progress, masteredCount) {
  const ws = progress.wordStats || {};
  const totalAttempts = progress.totalAttempts || 0;
  const accuracy =
    totalAttempts > 0
      ? Math.round(((progress.totalCorrect || 0) / totalAttempts) * 100)
      : 0;

  return [
    {
      icon: "📚",
      title: "First Steps",
      desc: "Learn 5 words",
      progress: Math.min(masteredCount, 5),
      total: 5,
    },
    {
      icon: "⚡",
      title: "Word Warrior",
      desc: "Learn 20 words",
      progress: Math.min(masteredCount, 20),
      total: 20,
    },
    {
      icon: "🛡️",
      title: "Word Shield",
      desc: "Learn 40 words",
      progress: Math.min(masteredCount, 40),
      total: 40,
    },
    {
      icon: "👑",
      title: "Word King",
      desc: "Master all words",
      progress: masteredCount,
      total: ALL_WORDS.length,
    },
    {
      icon: "🎯",
      title: "Sharp Shooter",
      desc: "80%+ accuracy",
      progress: accuracy,
      total: 100,
    },
    {
      icon: "🔥",
      title: "Streak Master",
      desc: "Train 7 days",
      progress: Math.min(progress.sessions || 0, 7),
      total: 7,
    },
  ];
}

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

  const level = Math.floor(masteredCount / 5) + 1;
  const streak = getStreak(progress);
  const achievements = getAchievements(progress, masteredCount);

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      {/* Hero profile card */}
      <div
        style={{
          background: "white",
          borderRadius: RADIUS.card,
          padding: "20px 16px",
          textAlign: "center",
          marginBottom: 16,
          boxShadow: `0 4px 16px ${C.shadow}`,
          border: `3px solid ${C.border}`,
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 4 }}>
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
            display: "inline-block",
            background: C.accent,
            color: "white",
            borderRadius: RADIUS.button,
            padding: "3px 14px",
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            marginTop: 6,
          }}
        >
          Lvl {level}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            color: C.muted,
            fontWeight: 500,
            marginTop: 4,
          }}
        >
          {kidName}'s Hero Profile
        </div>
      </div>

      {/* Daily Streak Card */}
      <div
        style={{
          background: "white",
          borderRadius: RADIUS.card,
          padding: 16,
          marginBottom: 16,
          boxShadow: `0 4px 16px ${C.shadow}`,
          border: `3px solid ${C.border}`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 15,
            color: C.text,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          🔥 Daily Streak
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          {DAYS.map((day, i) => {
            const state = streak[i];
            return (
              <div
                key={day}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    color: C.muted,
                    fontWeight: 600,
                  }}
                >
                  {day}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      state === "done"
                        ? C.green
                        : state === "today"
                          ? C.accent
                          : C.surface,
                    color: state === "done" ? "white" : state === "today" ? "white" : C.muted,
                    fontSize: state === "done" ? 16 : 14,
                    fontWeight: 700,
                    border: state === "today" ? `3px solid ${C.accent}` : "none",
                    boxShadow: state === "today" ? `0 0 12px ${C.accent}40` : "none",
                  }}
                >
                  {state === "done" ? "✓" : state === "today" ? "!" : "·"}
                </div>
              </div>
            );
          })}
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
          gap: 10,
          marginBottom: 20,
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
              padding: "10px 14px",
              textAlign: "center",
              border: `3px solid ${s.color}25`,
              boxShadow: `0 4px 12px ${C.shadow}`,
              minWidth: 72,
            }}
          >
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div
              style={{
                fontSize: 22,
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
      <div style={{ maxWidth: 380, margin: "0 auto 20px" }}>
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

      {/* Achievements card */}
      <div
        style={{
          background: "white",
          borderRadius: RADIUS.card,
          padding: 16,
          marginBottom: 16,
          boxShadow: `0 4px 16px ${C.shadow}`,
          border: `3px solid ${C.border}`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 15,
            color: C.text,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          🏆 Achievements
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {achievements.map((a) => {
            const isComplete = a.progress >= a.total;
            const progressPct = Math.round((a.progress / a.total) * 100);
            return (
              <div
                key={a.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                  opacity: isComplete ? 1 : 0.85,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: isComplete ? `${C.green}18` : C.surface,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 13,
                      color: C.text,
                      fontWeight: 600,
                    }}
                  >
                    {a.title}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 11,
                      color: C.muted,
                      fontWeight: 500,
                    }}
                  >
                    {a.desc}
                  </div>
                  {/* Mini progress bar */}
                  <div
                    style={{
                      height: 5,
                      background: C.surface,
                      borderRadius: 3,
                      marginTop: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPct}%`,
                        height: "100%",
                        background: isComplete ? C.green : C.accent,
                        borderRadius: 3,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    color: isComplete ? C.green : C.accent,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {isComplete ? "✓" : `${a.progress}/${a.total}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Word groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {GROUP_NAMES.map((gn) => {
          const words = WORD_GROUPS[gn];
          const gm = words.filter((w) => progress.mastered[w]).length;
          const groupPct = Math.round((gm / words.length) * 100);
          const isComplete = gm === words.length;
          return (
            <div
              key={gn}
              style={{
                background: "white",
                borderRadius: RADIUS.card,
                padding: 14,
                border: `3px solid ${isComplete ? `${C.green}40` : C.border}`,
                boxShadow: `0 4px 12px ${C.shadow}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT,
                    color: C.text,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {gn}
                </span>
                <span
                  style={{
                    fontFamily: FONT,
                    color: isComplete ? C.green : C.accent,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {isComplete ? "✓ Complete" : `${gm}/${words.length}`}
                </span>
              </div>
              {/* Group progress bar */}
              <div
                style={{
                  height: 6,
                  background: C.surface,
                  borderRadius: 3,
                  marginBottom: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${groupPct}%`,
                    height: "100%",
                    background: isComplete ? C.green : C.accent,
                    borderRadius: 3,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
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
