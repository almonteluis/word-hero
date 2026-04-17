import { useState } from "react";
import { C, FONT, RADIUS } from "../constants";
import HomeBackground from "./HomeBackground";

function ModeSelectScreen({ kid, progress, onSelectMode, onBack }) {
  const [transitioning, setTransitioning] = useState(null);

  const handleSelect = (key) => {
    if (transitioning) return;
    setTransitioning(key);
    setTimeout(() => onSelectMode(key), 550);
  };

  const findItUnlocked = (progress?.sessions || 0) > 0;

  const missions = [
    {
      key: "flash",
      icon: "⚡",
      label: "FLASH TRAINING",
      desc: "Learn your words",
      color: C.accent,
      gradient: "linear-gradient(135deg, rgba(246,198,25,0.18) 0%, rgba(200,160,10,0.08) 100%)",
      glowColor: "rgba(246,198,25,0.35)",
    },
    {
      key: "find",
      icon: "🔍",
      label: "FIND IT",
      desc: "Word recognition",
      color: C.blue,
      gradient: "linear-gradient(135deg, rgba(74,144,255,0.18) 0%, rgba(50,100,200,0.08) 100%)",
      glowColor: "rgba(74,144,255,0.35)",
      badge: !findItUnlocked ? "Complete Flash first" : null,
    },
    {
      key: "stats",
      icon: "🛡️",
      label: "HERO STATS",
      desc: "Check your progress",
      color: C.green,
      gradient: "linear-gradient(135deg, rgba(46,204,113,0.18) 0%, rgba(30,150,80,0.08) 100%)",
      glowColor: "rgba(46,204,113,0.35)",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0c1130 0%,#0a0e27 55%,#0c1530 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <HomeBackground />

      <style>{`
        @keyframes heroZoomIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes heroGlowBurst {
          0% { transform: scale(0); opacity: 0.9; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes missionTitleReveal {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes missionCardSlideUp {
          0% { opacity: 0; transform: translateY(24px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes missionCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes portalExpand {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(3); opacity: 0; }
        }
        .mission-card:hover {
          transform: translateY(-3px) !important;
          filter: brightness(1.1);
        }
      `}</style>

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
              background: C.panel,
              border: `1px solid ${C.muted}30`,
              borderRadius: 10,
              padding: "6px 12px",
              cursor: "pointer",
              color: C.muted,
              fontFamily: FONT,
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            ← BACK
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
          {/* Glow burst behind avatar */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${C.accent}60 0%, transparent 70%)`,
              transform: "translate(-50%, -50%)",
              animation: "heroGlowBurst 0.8s ease-out forwards",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontSize: 56,
              lineHeight: 1,
              animation: "heroZoomIn 0.6s ease-out both",
              position: "relative",
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
            letterSpacing: 2,
            animation: "heroZoomIn 0.6s ease-out 0.1s both",
          }}
        >
          {kid.name}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: "clamp(16px, 5vw, 20px)",
            color: C.accent,
            letterSpacing: 4,
            marginTop: 24,
            marginBottom: 28,
            textShadow: `0 0 18px ${C.accent}50`,
            animation: "missionTitleReveal 0.5s ease-out 0.3s both",
          }}
        >
          CHOOSE YOUR MISSION
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
                  background: m.gradient,
                  border: `2.5px solid ${m.color}55`,
                  borderRadius: 20,
                  padding: "20px 22px",
                  cursor: transitioning ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  backdropFilter: "blur(6px)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.22s, border-color 0.22s, box-shadow 0.22s",
                  boxShadow: isTransitioning
                    ? `0 0 40px ${m.color}80`
                    : `0 0 14px ${m.color}15`,
                  animation: `missionCardSlideUp 0.4s ease-out ${0.4 + i * 0.12}s both${
                    !isTransitioning ? `, missionCardFloat ${3 + i * 0.5}s ease-in-out ${i * 1.2}s infinite` : ""
                  }`,
                  ...(isTransitioning
                    ? {
                        animation: `portalExpand 0.5s ease-in forwards`,
                        borderColor: m.color,
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
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 14,
                    background: `${m.color}20`,
                    border: `1px solid ${m.color}30`,
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
                      letterSpacing: 2,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 13,
                      color: C.muted,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    {m.desc}
                  </div>
                  {/* Soft badge for Find It */}
                  {m.badge && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "2px 8px",
                        background: `${m.color}15`,
                        borderRadius: 6,
                        fontFamily: FONT,
                        fontSize: 10,
                        color: m.color,
                        fontWeight: 800,
                        letterSpacing: 0.5,
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
                    opacity: 0.6,
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
