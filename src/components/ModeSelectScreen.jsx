import { useState } from "react";
import { C, FONT, RADIUS } from "../constants";

function ModeSelectScreen({ kid, progress, onSelectMode, onBack }) {
  const [transitioning, setTransitioning] = useState(null);

  const handleSelect = (key) => {
    if (transitioning) return;
    setTransitioning(key);
    setTimeout(() => onSelectMode(key), 400);
  };

  const findItUnlocked = (progress?.sessions || 0) > 0;

  const missions = [
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
      badge: !findItUnlocked ? "Complete Flash first" : null,
    },
    {
      key: "stats",
      icon: "🛡️",
      label: "Hero Stats",
      desc: "Check your progress",
      color: C.green,
      bg: `${C.green}15`,
      borderColor: `${C.green}40`,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.bg} 0%, #A8D44E 40%, #C9F0E2 100%)`,
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
        @keyframes missionTitleReveal {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes missionCardSlideUp {
          0% { opacity: 0; transform: translateY(24px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes portalExpand {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .mission-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 28px ${C.shadow} !important;
        }
      `}</style>

      {/* Decorative clouds */}
      <div style={{ position: "absolute", top: "8%", right: "5%", opacity: 0.35, pointerEvents: "none" }}>
        <div style={{ width: 70, height: 26, background: "white", borderRadius: 16 }} />
        <div style={{ width: 45, height: 20, background: "white", borderRadius: 12, marginLeft: 16, marginTop: -10 }} />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          padding: "24px 20px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Back button */}
        <div style={{ width: "100%", marginBottom: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: "white",
              border: "none",
              borderBottom: `3px solid ${C.border}`,
              borderRadius: RADIUS.button,
              padding: "6px 14px",
              cursor: "pointer",
              color: C.text,
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: `0 2px 8px ${C.shadow}`,
            }}
          >
            ← Back
          </button>
        </div>

        {/* Hero avatar + name */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 56,
              lineHeight: 1,
              animation: "heroZoomIn 0.5s ease-out both",
              background: "white",
              width: 80,
              height: 80,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px ${C.shadow}`,
            }}
          >
            {kid.avatar}
          </div>
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 20,
            color: C.text,
            fontWeight: 700,
            animation: "heroZoomIn 0.5s ease-out 0.1s both",
          }}
        >
          {kid.name}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: "clamp(18px, 5vw, 22px)",
            color: C.text,
            fontWeight: 600,
            marginTop: 24,
            marginBottom: 24,
            animation: "missionTitleReveal 0.5s ease-out 0.3s both",
          }}
        >
          Choose Your Mission
        </div>

        {/* Mission cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "100%",
          }}
        >
          {missions.map((m, i) => {
            const isTransitioning = transitioning === m.key;
            return (
              <button
                key={m.key}
                className="mission-card"
                onClick={() => handleSelect(m.key)}
                style={{
                  width: "100%",
                  background: "white",
                  border: `3px solid ${m.borderColor}`,
                  borderBottom: `5px solid ${m.borderColor}`,
                  borderRadius: RADIUS.card,
                  padding: "20px 22px",
                  cursor: transitioning ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.22s, box-shadow 0.22s",
                  boxShadow: `0 4px 16px ${C.shadow}`,
                  animation: `missionCardSlideUp 0.4s ease-out ${0.35 + i * 0.1}s both`,
                  ...(isTransitioning
                    ? {
                        animation: `portalExpand 0.4s ease-in forwards`,
                      }
                    : {}),
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: 36,
                    lineHeight: 1,
                    flexShrink: 0,
                    width: 52,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 16,
                    background: m.bg,
                  }}
                >
                  {m.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 17,
                      color: m.color,
                      fontWeight: 700,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 13,
                      color: C.muted,
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {m.desc}
                  </div>
                  {m.badge && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "2px 10px",
                        background: `${C.muted}15`,
                        borderRadius: 8,
                        fontFamily: FONT,
                        fontSize: 11,
                        color: C.muted,
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      {m.badge}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div
                  style={{
                    color: m.color,
                    fontSize: 20,
                    opacity: 0.5,
                  }}
                >
                  →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ModeSelectScreen;
