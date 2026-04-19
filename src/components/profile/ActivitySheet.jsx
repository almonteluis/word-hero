import { C, FONT } from "../../constants";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildWeeks(daily, weeksBack) {
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setHours(0, 0, 0, 0);
  thisMonday.setDate(today.getDate() - todayIdx);

  const todayKey = dayKey(today);

  const weeks = [];
  for (let w = weeksBack - 1; w >= 0; w--) {
    const monday = new Date(thisMonday);
    monday.setDate(thisMonday.getDate() - w * 7);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = dayKey(d);
      days.push({
        label: WEEKDAY_LABELS[i],
        date: d.getDate(),
        month: d.getMonth(),
        done: !!daily[key],
        isToday: key === todayKey,
        isFuture: d > today,
      });
    }
    weeks.push({
      label: `${MONTH_SHORT[monday.getMonth()]} ${monday.getDate()}`,
      days,
    });
  }
  return weeks;
}

function computeTotals(daily) {
  const keys = Object.keys(daily).filter((k) => daily[k]).sort();
  const activeDays = keys.length;
  let longest = 0;
  let current = 0;
  let prev = null;
  for (const k of keys) {
    if (prev) {
      const [py, pm, pd] = prev.split("-").map(Number);
      const [y, m, d] = k.split("-").map(Number);
      const prevDate = new Date(py, pm - 1, pd);
      const curDate = new Date(y, m - 1, d);
      const diff = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));
      current = diff === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    if (current > longest) longest = current;
    prev = k;
  }
  return { activeDays, longestStreak: longest };
}

export default function ActivitySheet({ progress }) {
  const daily = progress.dailyActivity || {};
  const weeks = buildWeeks(daily, 4);
  const { activeDays, longestStreak } = computeTotals(daily);
  const totalSessions = progress.sessions || 0;

  const statCards = [
    { label: "SESSIONS", value: totalSessions, bg: C.secondary },
    { label: "ACTIVE DAYS", value: activeDays, bg: C.green },
    { label: "LONGEST STREAK", value: longestStreak, bg: C.accent },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {statCards.map((s) => (
          <div
            key={s.label}
            className="toy-block"
            style={{
              padding: "10px 6px",
              textAlign: "center",
              borderWidth: 3,
              boxShadow: `2px 3px 0 ${C.ink}`,
              background: s.bg,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 24,
                fontWeight: 700,
                color: C.ink,
                lineHeight: 1,
              }}
            >
              {s.value}
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
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 700,
            color: C.text,
            marginBottom: 10,
          }}
        >
          Last 4 weeks
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {weeks.map((w, wi) => (
            <div key={wi} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 52,
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.muted,
                  flexShrink: 0,
                }}
              >
                {w.label}
              </div>
              <div
                style={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 4,
                }}
              >
                {w.days.map((d, i) => {
                  const bg = d.isFuture
                    ? "transparent"
                    : d.isToday
                      ? C.accent
                      : d.done
                        ? C.green
                        : C.panel;
                  const border = d.isToday
                    ? `2px solid ${C.ink}`
                    : d.done
                      ? `2px solid ${C.ink}`
                      : `1.5px solid ${C.muted}55`;
                  return (
                    <div
                      key={i}
                      title={`${d.label} ${d.date}${d.done ? " · active" : ""}`}
                      style={{
                        aspectRatio: "1 / 1",
                        borderRadius: 8,
                        background: bg,
                        border,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: FONT,
                        fontSize: 11,
                        fontWeight: 700,
                        color: d.isFuture ? C.muted : C.ink,
                      }}
                    >
                      {d.done && !d.isToday ? "✓" : d.date}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          fontFamily: FONT,
          fontSize: 11,
          color: C.muted,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        A session counts each time {`you open the app and start practicing`}.
      </div>
    </div>
  );
}
