import { C, FONT } from "../constants";
import { getStreak, STREAK_DAYS } from "../utils/progress";
import { cardStyle } from "../utils/styles";

function DailyStreak({ progress }) {
  const streak = getStreak(progress);

  return (
    <div
      className="toy-block"
      style={{
        ...cardStyle(),
        padding: 14,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 15,
          color: C.text,
          fontWeight: 700,
          marginBottom: 10,
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
                  color:
                    state === "done"
                      ? "white"
                      : state === "today"
                        ? C.ink
                        : C.muted,
                  fontSize: state === "done" ? 14 : 12,
                  fontWeight: 700,
                  border:
                    state === "today"
                      ? `3px solid ${C.ink}`
                      : `2px solid ${C.ink}20`,
                  boxShadow:
                    state === "today" ? `2px 2px 0px ${C.ink}` : "none",
                }}
              >
                {state === "done" ? "✓" : state === "today" ? "!" : "·"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DailyStreak;
