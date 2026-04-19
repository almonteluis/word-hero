import { C, FONT, ALL_WORDS } from "../constants";
import { MASTERY_SESSIONS, getHeroStats } from "../utils/progress";
import { cardStyle } from "../utils/styles";

function getAchievements(progress, masteredCount) {
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

function AchievementsList({ progress }) {
  const { masteredCount } = getHeroStats(progress);
  const achievements = getAchievements(progress, masteredCount);

  return (
    <div
      className="toy-block"
      style={{
        ...cardStyle(),
        padding: 16,
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
                borderBottom: `1px solid ${C.ink}15`,
                opacity: isComplete ? 1 : 0.85,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: isComplete ? `${C.green}18` : C.surface,
                  border: `2px solid ${C.ink}20`,
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
                <div
                  style={{
                    height: 5,
                    background: C.surface,
                    borderRadius: 3,
                    marginTop: 4,
                    overflow: "hidden",
                    border: `1px solid ${C.ink}15`,
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
  );
}

export default AchievementsList;
