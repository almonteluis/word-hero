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

function KidSelector({ profiles, onSelect, onAdd, onDelete }) {
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
        background: "linear-gradient(180deg, #7EC8E3 0%, #A8DCF0 20%, #C5EEBB 40%, #B5DE5E 55%, #A0CC4A 70%, #8BBF3A 100%)",
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

      {/* Clouds */}
      <div style={{ position: "absolute", top: "5%", left: "3%", zIndex: 0, animation: "cloudDrift 12s ease-in-out infinite", pointerEvents: "none" }}>
        <svg width="120" height="50" viewBox="0 0 120 50">
          <ellipse cx="60" cy="32" rx="58" ry="18" fill="white" opacity="0.9" />
          <ellipse cx="35" cy="24" rx="30" ry="16" fill="white" opacity="0.95" />
          <ellipse cx="80" cy="22" rx="26" ry="14" fill="white" opacity="0.92" />
          <ellipse cx="55" cy="18" rx="22" ry="12" fill="white" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: "10%", left: "45%", zIndex: 0, animation: "cloudDriftReverse 15s ease-in-out infinite 3s", pointerEvents: "none" }}>
        <svg width="90" height="40" viewBox="0 0 90 40">
          <ellipse cx="45" cy="26" rx="44" ry="14" fill="white" opacity="0.85" />
          <ellipse cx="28" cy="18" rx="24" ry="12" fill="white" opacity="0.9" />
          <ellipse cx="65" cy="20" rx="20" ry="10" fill="white" opacity="0.88" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: "16%", right: "2%", zIndex: 0, animation: "cloudDrift 18s ease-in-out infinite 6s", pointerEvents: "none", opacity: 0.7 }}>
        <svg width="100" height="44" viewBox="0 0 100 44">
          <ellipse cx="50" cy="28" rx="48" ry="16" fill="white" />
          <ellipse cx="30" cy="20" rx="28" ry="14" fill="white" />
          <ellipse cx="72" cy="18" rx="22" ry="12" fill="white" />
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
            color: "white",
            fontWeight: 500,
            textShadow: "1px 1px 2px rgba(0,0,0,0.15)",
            marginBottom: 32,
            letterSpacing: 0.5,
          }}
        >
          Learn to read, one word at a time!
        </div>

        {/* Character section header */}
        {profiles.length > 0 && (
          <div
            style={{
              fontFamily: FONT,
              fontSize: 19,
              color: C.text,
              fontWeight: 700,
              marginBottom: 16,
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(8px)",
              borderRadius: RADIUS.button,
              padding: "6px 22px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
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
                className="ks-hero-card"
                onClick={() => onSelect(kid)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(12px)",
                  border: "none",
                  borderRadius: RADIUS.card,
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: `0 6px 24px rgba(58,74,84,0.1), 0 2px 6px rgba(58,74,84,0.06)`,
                  textAlign: "left",
                }}
              >
                {/* Avatar in a character-card ring */}
                <div
                  className="ks-avatar-ring"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.sun}30, ${C.accent}30)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                    flexShrink: 0,
                    border: `3px solid white`,
                    boxShadow: `0 2px 10px ${C.accent}30`,
                    transition: "transform 0.25s, box-shadow 0.25s",
                  }}
                >
                  {kid.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: "clamp(18px, 5vw, 24px)",
                      color: C.text,
                      fontWeight: 700,
                    }}
                  >
                    {kid.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 13,
                      color: C.accent,
                      fontWeight: 600,
                      marginTop: 1,
                    }}
                  >
                    Tap to start training!
                  </div>
                </div>
                {/* Arrow chevron */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: C.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                    boxShadow: `0 2px 8px ${C.accent}40`,
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
            onClick={() => setAdding(true)}
            style={{
              width: "100%",
              background: C.secondary,
              border: "none",
              borderBottom: `5px solid ${C.secondary}bb`,
              borderRadius: RADIUS.button,
              padding: "16px 28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: FONT,
              fontSize: 18,
              fontWeight: 700,
              color: "white",
              letterSpacing: 0.5,
              animation: "addBtnGlow 3s ease-in-out infinite",
              transition: "transform 0.2s",
            }}
          >
            <span style={{ fontSize: 24, lineHeight: 1 }}>+</span>
            Add a Hero
          </button>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(16px)",
              borderRadius: RADIUS.card,
              padding: 24,
              boxShadow: "0 12px 40px rgba(58,74,84,0.12)",
              border: `2px solid rgba(255,255,255,0.8)`,
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
                border: `3px solid ${C.border}`,
                borderRadius: RADIUS.button,
                padding: "12px 18px",
                color: C.text,
                fontSize: 17,
                fontFamily: FONT,
                fontWeight: 500,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 16,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = C.accent; }}
              onBlur={(e) => { e.target.style.borderColor = C.border; }}
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setAdding(false)}
                style={{
                  background: "rgba(201,240,226,0.6)",
                  border: "none",
                  borderBottom: `3px solid ${C.border}`,
                  borderRadius: RADIUS.button,
                  padding: "10px 22px",
                  fontFamily: FONT,
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.text,
                  cursor: "pointer",
                  transition: "transform 0.15s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                style={{
                  background: C.primary,
                  border: "none",
                  borderBottom: `4px solid ${C.primary}bb`,
                  borderRadius: RADIUS.button,
                  padding: "10px 22px",
                  fontFamily: FONT,
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  cursor: "pointer",
                  boxShadow: `0 4px 16px ${C.primary}30`,
                  transition: "transform 0.15s",
                }}
              >
                Create Hero
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ GROUND LAYER — hills, trees, flowers ═══ */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 140,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {/* Back hill */}
        <svg
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: 40,
            left: "-10%",
            width: "120%",
            height: 80,
            animation: "hillSway 8s ease-in-out infinite",
          }}
        >
          <path
            d="M0,80 Q50,20 120,50 Q200,10 280,45 Q350,25 400,60 L400,100 L0,100 Z"
            fill="#8BBF3A"
            opacity="0.7"
          />
        </svg>

        {/* Front hill */}
        <svg
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: "-5%",
            width: "110%",
            height: 60,
          }}
        >
          <path
            d="M0,50 Q60,15 140,35 Q220,8 300,30 Q360,18 400,40 L400,80 L0,80 Z"
            fill="#78B032"
          />
        </svg>

        {/* Trees */}
        <div style={{ position: "absolute", bottom: 38, left: "6%", animation: "cloudDrift 10s ease-in-out infinite 1s" }}>
          <svg width="50" height="70" viewBox="0 0 50 70">
            <rect x="20" y="45" width="10" height="25" rx="3" fill="#8B6B3E" />
            <ellipse cx="25" cy="30" rx="22" ry="25" fill="#5DAA1E" />
            <ellipse cx="25" cy="22" rx="16" ry="18" fill="#6FC422" />
            <ellipse cx="18" cy="18" rx="8" ry="10" fill="#7DD425" opacity="0.7" />
          </svg>
        </div>

        <div style={{ position: "absolute", bottom: 32, right: "8%", animation: "cloudDriftReverse 12s ease-in-out infinite 4s" }}>
          <svg width="40" height="58" viewBox="0 0 40 58">
            <rect x="16" y="38" width="8" height="20" rx="2" fill="#8B6B3E" />
            <ellipse cx="20" cy="24" rx="18" ry="22" fill="#5DAA1E" />
            <ellipse cx="20" cy="18" rx="13" ry="15" fill="#6FC422" />
          </svg>
        </div>

        <div style={{ position: "absolute", bottom: 50, left: "22%", animation: "cloudDrift 14s ease-in-out infinite 2s" }}>
          <svg width="32" height="48" viewBox="0 0 32 48">
            <rect x="13" y="32" width="6" height="16" rx="2" fill="#8B6B3E" />
            <ellipse cx="16" cy="20" rx="14" ry="18" fill="#5DAA1E" />
            <ellipse cx="16" cy="14" rx="10" ry="12" fill="#6FC422" />
          </svg>
        </div>

        {/* Flowers */}
        <div style={{ position: "absolute", bottom: 48, left: "15%", fontSize: 18, animation: "hillSway 6s ease-in-out infinite 1s" }}>🌸</div>
        <div style={{ position: "absolute", bottom: 42, left: "35%", fontSize: 14, animation: "hillSway 7s ease-in-out infinite 3s" }}>🌼</div>
        <div style={{ position: "absolute", bottom: 52, right: "20%", fontSize: 16, animation: "hillSway 5s ease-in-out infinite 2s" }}>🌺</div>
        <div style={{ position: "absolute", bottom: 44, right: "30%", fontSize: 12, animation: "hillSway 8s ease-in-out infinite 0.5s" }}>🌻</div>
        <div style={{ position: "absolute", bottom: 46, left: "55%", fontSize: 14, animation: "hillSway 6s ease-in-out infinite 4s" }}>🌷</div>

        {/* Floating sparkles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              bottom: `${p.startY}%`,
              fontSize: p.size + 6,
              animation: `sparkle ${p.dur}s ease-in-out ${p.delay}s infinite`,
              pointerEvents: "none",
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KidSelector;
