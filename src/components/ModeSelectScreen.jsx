import { useState } from "react";
import { C, FONT, RADIUS, ALL_WORDS } from "../constants";
import { getStreak, getHeroStats, STREAK_DAYS } from "../utils/progress";

function ModeSelectScreen({ kid, progress, onSelectMode, onBack }) {
  const [transitioning, setTransitioning] = useState(null);

  const handleSelect = (key) => {
    if (transitioning) return;
    setTransitioning(key);
    setTimeout(() => onSelectMode(key), 400);
  };

  const { masteredCount, learningCount, accuracy, level, rank, rankIcon } =
    getHeroStats(progress);
  const pct = Math.round((masteredCount / ALL_WORDS.length) * 100);
  const streak = getStreak(progress);

  const activities = [
    {
      key: "flash",
      icon: "⚡",
      label: "Flash Training",
      desc: "Learn your words",
      color: C.accent,
      bg: `${C.accent}15`,
      borderColor: `${C.accent}40`,
    },
    {
      key: "find",
      icon: "🔍",
      label: "Find It",
      desc: "Word recognition",
      color: C.secondary,
      bg: `${C.secondary}15`,
      borderColor: `${C.secondary}40`,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.secondary} 0%, #E0F2FE 50%, ${C.green} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes heroZoomIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes portalExpand {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .activity-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 28px ${C.shadow} !important;
        }
      `}</style>

      {/* Decorative clouds */}
      <div style={{ position: "absolute", top: "8%", right: "5%", opacity: 0.35, pointerEvents: "none" }}>
        <div style={{ width: 70, height: 26, background: "white", borderRadius: 16 }} />
        <div style={{ width: 45, height: 20, background: "white", borderRadius: 12, marginLeft: 16, marginTop: -10 }} />
      </div>
      <div style={{ position: "absolute", top: "14%", left: "8%", opacity: 0.2, pointerEvents: "none" }}>
        <div style={{ width: 50, height: 18, background: "white", borderRadius: 12 }} />
        <div style={{ width: 35, height: 14, background: "white", borderRadius: 10, marginLeft: 10, marginTop: -8 }} />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          padding: "24px 20px 40px",
          paddingTop: "max(24px, env(safe-area-inset-top))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <button
            className="toy-block toy-pressable"
            onClick={onBack}
            style={{
              padding: "8px 16px",
              color: C.text,
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 700,
              background: C.surface,
              borderWidth: "3px", // thin block mode
              boxShadow: `3px 4px 0px ${C.ink}`,
              borderRadius: "16px",
            }}
          >
            ← Switch
          </button>
          <div
            style={{
              fontSize: 18,
              fontFamily: FONT,
              color: C.text,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Word Hero
          </div>
          <div style={{ width: 70 }} />
        </div>

        {/* Hero avatar + greeting */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 20,
            animation: "heroZoomIn 0.5s ease-out both",
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
              marginTop: 8,
            }}
          >
            {kid.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
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

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            marginBottom: 16,
            animation: "fadeSlideUp 0.4s ease-out 0.15s both",
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
                padding: "8px 6px",
                textAlign: "center",
                borderWidth: "3px",
                boxShadow: `2px 3px 0 ${C.ink}`,
                borderRadius: "16px",
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

        {/* Hero Power progress bar */}
        <div
          style={{
            width: "100%",
            maxWidth: 340,
            marginBottom: 20,
            animation: "fadeSlideUp 0.4s ease-out 0.25s both",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                color: C.text,
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
                fontWeight: 700,
              }}
            >
              {masteredCount}/{ALL_WORDS.length}
            </span>
          </div>
          <div
            style={{
              height: 12,
              background: C.surface,
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
            width: "100%",
            background: C.surface,
            padding: "14px 16px",
            marginBottom: 20,
            borderWidth: "3px",
            boxShadow: `3px 4px 0px ${C.ink}`,
            animation: "fadeSlideUp 0.4s ease-out 0.3s both",
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

        {/* Activity cards */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: C.text,
              fontWeight: 600,
              marginBottom: 2,
              animation: "fadeSlideUp 0.4s ease-out 0.4s both",
            }}
          >
            Start Training
          </div>
          {activities.map((m, i) => {
            const isTransitioning = transitioning === m.key;
            return (
              <button
                key={m.key}
                className="toy-block toy-pressable"
                onClick={() => handleSelect(m.key)}
                style={{
                  width: "100%",
                  background: m.key === "flash" ? C.primary : C.secondary,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden",
                  animation: `fadeSlideUp 0.4s ease-out ${0.45 + i * 0.08}s both`,
                  ...(isTransitioning
                    ? {
                        animation: `portalExpand 0.4s ease-in forwards`,
                      }
                    : {}),
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    lineHeight: 1,
                    flexShrink: 0,
                    width: 52,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 16,
                    background: C.surface,
                    border: `3px solid ${C.ink}`,
                    boxShadow: `2px 3px 0 ${C.ink}`,
                  }}
                >
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 16,
                      color: m.color,
                      fontWeight: 700,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 12,
                      color: C.muted,
                      fontWeight: 500,
                      marginTop: 1,
                    }}
                  >
                    {m.desc}
                  </div>
                </div>
                <div style={{ color: C.ink, fontSize: 24, fontWeight: "bold" }}>→</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ModeSelectScreen;
