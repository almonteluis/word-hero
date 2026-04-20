import { useState } from "react";
import { C, FONT, RADIUS } from "../constants";

const AVATARS = [
  "🦊", "🐱", "🐻", "🦁", "🐰", "🦄",
  "🐸", "🐼", "🐨", "🐯", "🦋", "🐧",
];

// Sun rays — static positions so they don't shift per render
const SUN_RAYS = Array.from({ length: 12 }).map((_, i) => ({
  angle: i * 30,
  width: 3 + (i % 3),
  opacity: 0.15 + (i % 3) * 0.05,
  dur: 4 + (i % 4),
  delay: (i * 0.3) % 3,
}));

// Floating particles — seeds, leaves, sparkles
const PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
  left: (i * 23.7 + 5) % 95,
  size: 3 + (i % 3) * 2,
  emoji: ["✨", "🍃", "🌸", "⭐", "🌿", "💛", "🦋"][i % 7],
  dur: 6 + (i % 5) * 2,
  delay: (i * 0.7) % 5,
  startY: 10 + (i * 13) % 60,
}));

function KidSelector({ profiles, onSelect, onAdd, onDelete, onProfile }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      id: Date.now().toString(),
      name: name.trim(),
      avatar: AVATARS[avatar],
    });
    setName("");
    setAvatar(0);
    setAdding(false);
  };

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
        overflowY: "auto",
      }}
    >
      <style>{`
        @keyframes cloudDrift {
          0% { transform: translateX(0); }
          50% { transform: translateX(30px); }
          100% { transform: translateX(0); }
        }
        @keyframes cloudDriftReverse {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25px); }
          100% { transform: translateX(0); }
        }
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes sunRayPulse {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.22; }
        }
        @keyframes titleFloat {
          0%, 100% { transform: translateY(0) rotate(-0.5deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes cardBounceIn {
          0% { opacity: 0; transform: translateY(30px) scale(0.9); }
          60% { transform: translateY(-4px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes formSlideUp {
          0% { opacity: 0; transform: translateY(20px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes addBtnGlow {
          0%, 100% { box-shadow: 0 6px 24px rgba(63,175,232,0.3); }
          50% { box-shadow: 0 6px 32px rgba(63,175,232,0.5); }
        }
        @keyframes hillSway {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .ks-hero-card {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s !important;
        }
        .ks-hero-card:hover {
          transform: translateY(-6px) scale(1.02) !important;
          box-shadow: 0 12px 36px rgba(58,74,84,0.15) !important;
        }
        .ks-hero-card:hover .ks-avatar-ring {
          transform: scale(1.08);
          box-shadow: 0 0 20px rgba(245,166,35,0.4);
        }
        .ks-delete-btn:hover {
          background: rgba(255,107,122,0.2) !important;
          transform: scale(1.1);
        }
      `}</style>

      {/* ═══ SKY LAYER ═══ */}

      {/* Sun */}
      <div
        style={{
          position: "absolute",
          top: "3%",
          right: "8%",
          width: 70,
          height: 70,
          zIndex: 0,
          animation: "sunPulse 4s ease-in-out infinite",
        }}
      >
        <div style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: C.sun,
          boxShadow: `0 0 40px ${C.sun}80, 0 0 80px ${C.sun}40, 0 0 120px ${C.sun}20`,
        }} />
        {/* Sun rays */}
        {SUN_RAYS.map((ray, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: ray.width,
              height: 50,
              background: C.sun,
              borderRadius: 3,
              opacity: ray.opacity,
              transformOrigin: "50% 0%",
              transform: `translate(-50%, 0) rotate(${ray.angle}deg) translateY(35px)`,
              animation: `sunRayPulse ${ray.dur}s ease-in-out ${ray.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Pastel Clouds */}
      <div style={{ position: "absolute", top: "5%", left: "3%", zIndex: 0, animation: "cloudDrift 12s ease-in-out infinite", pointerEvents: "none" }}>
        <svg width="120" height="50" viewBox="0 0 120 50">
          <ellipse cx="60" cy="32" rx="58" ry="18" fill="white" opacity="0.9" />
          <ellipse cx="35" cy="24" rx="30" ry="16" fill="white" opacity="0.95" />
          <ellipse cx="80" cy="22" rx="26" ry="14" fill="white" opacity="0.92" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: "10%", left: "45%", zIndex: 0, animation: "cloudDriftReverse 15s ease-in-out infinite 3s", pointerEvents: "none" }}>
        <svg width="90" height="40" viewBox="0 0 90 40">
          <ellipse cx="45" cy="26" rx="44" ry="14" fill="#FFE4E6" opacity="0.85" />
          <ellipse cx="28" cy="18" rx="24" ry="12" fill="#FFE4E6" opacity="0.9" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: "16%", right: "2%", zIndex: 0, animation: "cloudDrift 18s ease-in-out infinite 6s", pointerEvents: "none", opacity: 0.7 }}>
        <svg width="100" height="44" viewBox="0 0 100 44">
          <ellipse cx="50" cy="28" rx="48" ry="16" fill="#E0F2FE" />
          <ellipse cx="30" cy="20" rx="28" ry="14" fill="#E0F2FE" />
        </svg>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          padding: "48px 20px 160px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Title — floating banner feel */}
        {/* Profile button */}
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
          <button
            className="toy-block toy-pressable"
            onClick={onProfile}
            style={{
              background: C.surface,
              border: `3px solid ${C.ink}`,
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              cursor: "pointer",
              boxShadow: `3px 4px 0px ${C.ink}`,
              padding: 0,
            }}
          >
            👤
          </button>
        </div>

        <div
          style={{
            animation: "titleFloat 4s ease-in-out infinite",
            marginBottom: 6,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: "clamp(48px, 14vw, 72px)",
              color: "white",
              fontWeight: 700,
              lineHeight: 1.0,
              textShadow: `
                3px 3px 0 ${C.accent},
                5px 5px 0 ${C.text}15,
                0 0 40px ${C.sun}60
              `,
              letterSpacing: 1,
            }}
          >
            Word
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: "clamp(52px, 15vw, 78px)",
              color: C.sun,
              fontWeight: 700,
              lineHeight: 1.0,
              textShadow: `
                3px 3px 0 ${C.accent},
                5px 5px 0 ${C.text}15,
                0 0 40px ${C.accent}50
              `,
              letterSpacing: 2,
            }}
          >
            Hero
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 16,
            color: C.text,
            fontWeight: 700,
            marginBottom: 32,
            letterSpacing: 0.5,
          }}
        >
          Learn to read, one word at a time!
        </div>

        {/* Character section header */}
        {profiles.length > 0 && (
          <div
            className="toy-block"
            style={{
              fontFamily: FONT,
              fontSize: 18,
              color: C.text,
              fontWeight: 700,
              marginBottom: 16,
              background: C.surface,
              borderRadius: "16px",
              padding: "6px 22px",
              borderWidth: "3px",
              boxShadow: `3px 4px 0px ${C.ink}`,
            }}
          >
            Choose Your Hero
          </div>
        )}

        {/* Profile cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "100%",
            marginBottom: 20,
          }}
        >
          {profiles.map((kid, idx) => (
            <div
              key={kid.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                animation: `cardBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.1 + 0.2}s both`,
              }}
            >
              <button
                className="toy-block toy-pressable"
                onClick={() => onSelect(kid)}
                style={{
                  flex: 1,
                  background: C.surface,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  borderRadius: RADIUS.card,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: C.panel,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    flexShrink: 0,
                    border: `3px solid ${C.ink}`,
                    boxShadow: `3px 4px 0px ${C.ink}`,
                  }}
                >
                  {kid.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 18,
                      color: C.text,
                      fontWeight: 700,
                    }}
                  >
                    {kid.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 12,
                      color: C.muted,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    Tap to start training!
                  </div>
                </div>
                {/* Arrow */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: C.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 700,
                    flexShrink: 0,
                    boxShadow: `2px 2px 0px ${C.ink}`,
                    border: `2px solid ${C.ink}`,
                  }}
                >
                  →
                </div>
              </button>

              {/* Delete button */}
              <button
                className="ks-delete-btn"
                onClick={() => {
                  if (confirm(`Remove ${kid.name}'s profile?`))
                    onDelete(kid.id);
                }}
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                  border: `2px solid ${C.heart}30`,
                  borderRadius: 14,
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: C.heart,
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1,
                  transition: "all 0.18s",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add hero / form */}
        {!adding ? (
          <button
            className="toy-block toy-pressable"
            onClick={() => setAdding(true)}
            style={{
              width: "100%",
              background: C.primary,
              padding: "16px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: FONT,
              fontSize: 18,
              fontWeight: 700,
              color: C.textLight,
              letterSpacing: 0.5,
            }}
          >
            <span style={{ fontSize: 24, lineHeight: 1 }}>+</span>
            Add a Hero
          </button>
        ) : (
          <div
            className="toy-block"
            style={{
              background: C.surface,
              padding: 24,
              animation: "formSlideUp 0.35s ease-out both",
              width: "100%",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 700,
                color: C.text,
                marginBottom: 6,
              }}
            >
              Create Your Hero
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: C.muted,
                fontWeight: 500,
                marginBottom: 16,
              }}
            >
              Pick a character and give them a name!
            </div>

            {/* Avatar picker */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {AVATARS.map((a, i) => (
                <button
                  key={i}
                  onClick={() => setAvatar(i)}
                  style={{
                    fontSize: 30,
                    background: i === avatar ? `linear-gradient(135deg, ${C.sun}30, ${C.accent}30)` : "rgba(201,240,226,0.5)",
                    border: `3px solid ${i === avatar ? C.accent : "transparent"}`,
                    borderRadius: i === avatar ? "50%" : RADIUS.small,
                    width: i === avatar ? 52 : 44,
                    height: i === avatar ? 52 : 44,
                    cursor: "pointer",
                    lineHeight: 1,
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: i === avatar ? `0 0 16px ${C.accent}30` : "none",
                    transform: i === avatar ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Name input */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hero name..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{
                width: "100%",
                background: C.surface,
                border: `3px solid ${C.ink}`,
                borderRadius: "16px",
                padding: "12px 18px",
                color: C.text,
                fontSize: 17,
                fontFamily: FONT,
                fontWeight: 700,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="toy-block toy-pressable"
                onClick={() => setAdding(false)}
                style={{
                  background: C.panel,
                  padding: "10px 22px",
                  fontFamily: FONT,
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                Cancel
              </button>
              <button
                className="toy-block toy-pressable"
                onClick={handleAdd}
                style={{
                  background: C.primary,
                  padding: "10px 22px",
                  fontFamily: FONT,
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.textLight,
                }}
              >
                Create Hero
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

export default KidSelector;
