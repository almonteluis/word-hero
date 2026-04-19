import { useState } from "react";
import { C, FONT } from "../constants";

function ModeSelectScreen({ kid, progress, onSelectMode }) {
  const [transitioning, setTransitioning] = useState(null);

  const handleSelect = (key) => {
    if (transitioning) return;
    setTransitioning(key);
    setTimeout(() => onSelectMode(key), 400);
  };

  const activities = [
    {
      key: "flash",
      icon: "⚡",
      label: "Flash Training",
      desc: "Learn your words",
      color: C.accent,
    },
    {
      key: "find",
      icon: "🔍",
      label: "Find It",
      desc: "Word recognition",
      color: C.secondary,
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
        paddingBottom: 90,
      }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes portalExpand {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1.15); opacity: 0; }
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
        {/* Title */}
        <div
          style={{
            fontSize: 22,
            fontFamily: FONT,
            color: C.text,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 24,
            animation: "fadeSlideUp 0.4s ease-out both",
          }}
        >
          ⚡ Word Hero
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
              animation: "fadeSlideUp 0.4s ease-out 0.1s both",
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
                  animation: `fadeSlideUp 0.4s ease-out ${0.15 + i * 0.08}s both`,
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
