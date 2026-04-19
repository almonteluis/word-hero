import { C, FONT } from "../constants";
import { getHeroStats } from "../utils/progress";
import { cardStyle } from "../utils/styles";

function StatsRow({ progress }) {
  const { masteredCount, learningCount, accuracy } = getHeroStats(progress);

  const stats = [
    { label: "Mastered", value: masteredCount, color: C.green, icon: "🛡️" },
    { label: "Learning", value: learningCount, color: C.accent, icon: "⚡" },
    { label: "Accuracy", value: `${accuracy}%`, color: C.secondary, icon: "🎯" },
    { label: "Sessions", value: progress.sessions || 0, color: C.purple, icon: "📅" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="toy-block"
          style={{
            ...cardStyle(),
            padding: "8px 6px",
            textAlign: "center",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: 16 }}>{s.icon}</div>
          <div
            style={{
              fontSize: 18,
              fontFamily: FONT,
              color: s.color,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: 9,
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
  );
}

export default StatsRow;
