import { C, FONT, RADIUS, ALL_WORDS } from "../constants";
import { getStreak, getHeroStats, STREAK_DAYS } from "../utils/progress";
import DailyReminderSettings from "./DailyReminderSettings";

export default function ProfileScreen({ kid, progress, dispatch, onSwitchProfile }) {
  const { masteredCount, learningCount, accuracy, level, rank, rankIcon } =
    getHeroStats(progress);
  const pct = Math.round((masteredCount / ALL_WORDS.length) * 100);
  const streak = getStreak(progress);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.secondary} 0%, #E0F2FE 50%, ${C.green} 100%)`,
        paddingBottom: 90,
      }}
    >
      <div
        style={{
          maxWidth: 400,
          margin: "0 auto",
          padding: "20px 16px",
          paddingTop: "max(20px, env(safe-area-inset-top))",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            marginBottom: 20,
          }}
        >
          👤 Profile
        </div>

        {/* Hero card */}
        <div
          className="toy-block"
          style={{
            padding: "20px",
            textAlign: "center",
            marginBottom: 16,
            borderWidth: "3px",
            boxShadow: `4px 6px 0px ${C.ink}`,
          }}
        >
          <div
            style={{
              fontSize: 48,
              lineHeight: 1,
              background: C.surface,
              width: 84,
              height: 84,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `4px 6px 0px ${C.ink}`,
              border: `4px solid ${C.ink}`,
              margin: "0 auto 8px",
            }}
          >
            {kid.avatar}
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 20,
              color: C.text,
              fontWeight: 700,
            }}
          >
            {kid.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 16 }}>{rankIcon}</span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 14,
                color: C.accent,
                fontWeight: 700,
              }}
            >
              {rank}
            </span>
            <span
              style={{
                background: C.accent,
                color: "white",
                borderRadius: RADIUS.button,
                padding: "2px 10px",
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Lvl {level}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
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
              className="toy-block"
              style={{
                background: C.surface,
                padding: "12px",
                textAlign: "center",
                borderWidth: "3px",
                boxShadow: `2px 3px 0 ${C.ink}`,
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div
                style={{
                  fontSize: 22,
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

        {/* Hero Power progress bar */}
        <div
          className="toy-block"
          style={{
            padding: "14px 16px",
            marginBottom: 16,
            borderWidth: "3px",
            boxShadow: `3px 4px 0px ${C.ink}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                color: C.text,
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              🌟 Hero Power
            </span>
            <span
              style={{
                color: C.accent,
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {masteredCount}/{ALL_WORDS.length} ({pct}%)
            </span>
          </div>
          <div
            style={{
              height: 14,
              background: C.panel,
              borderRadius: RADIUS.button,
              overflow: "hidden",
              border: `3px solid ${C.ink}`,
              boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1)`,
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${C.accent}, ${C.sun})`,
                borderRadius: RADIUS.button,
                transition: "width 0.6s",
              }}
            />
          </div>
        </div>

        {/* Daily Streak */}
        <div
          className="toy-block"
          style={{
            padding: "14px 16px",
            marginBottom: 16,
            borderWidth: "3px",
            boxShadow: `3px 4px 0px ${C.ink}`,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: C.text,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            🔥 Daily Streak
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
            {STREAK_DAYS.map((day, i) => {
              const state = streak[i];
              return (
                <div
                  key={day}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 10,
                      color: C.muted,
                      fontWeight: 600,
                    }}
                  >
                    {day}
                  </div>
                  <div
                    style={{
                      width: 32,
                      height: 32,
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
                      color: state === "done" ? "white" : state === "today" ? C.ink : C.muted,
                      fontSize: state === "done" ? 14 : 12,
                      fontWeight: 700,
                      border: state === "today" ? `3px solid ${C.ink}` : `2px solid ${C.ink}20`,
                      boxShadow: state === "today" ? `2px 2px 0px ${C.ink}` : "none",
                    }}
                  >
                    {state === "done" ? "✓" : state === "today" ? "!" : "·"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings section */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: C.text,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          ⚙️ Settings
        </div>

        <DailyReminderSettings />

        {/* Action buttons */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            className="toy-block toy-pressable"
            onClick={onSwitchProfile}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              background: C.surface,
              borderWidth: "3px",
              boxShadow: `3px 4px 0px ${C.ink}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            🔄 Switch Profile
          </button>

          <button
            className="toy-pressable"
            onClick={() => {
              if (confirm(`Reset ${kid.name}'s progress?`))
                dispatch({ type: "RESET" });
            }}
            style={{
              width: "100%",
              background: "transparent",
              border: `3px solid ${C.ink}40`,
              color: `${C.ink}80`,
              borderRadius: RADIUS.button,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
