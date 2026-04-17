import { useState } from "react";
import { C, FONT, RADIUS } from "../constants";

const AVATARS = [
  "🦊",
  "🐱",
  "🐻",
  "🦁",
  "🐰",
  "🦄",
  "🐸",
  "🐼",
  "🐨",
  "🐯",
  "🦋",
  "🐧",
];

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
        background: `linear-gradient(180deg, ${C.bg} 0%, #A8D44E 50%, #C9F0E2 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes titleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes cardSlideIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes addBtnPop {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCloud {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        .ks-profile-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 28px ${C.shadow} !important;
        }
      `}</style>

      {/* Decorative clouds */}
      <div style={{ position: "absolute", top: "6%", left: "5%", opacity: 0.4, animation: "floatCloud 8s ease-in-out infinite", pointerEvents: "none" }}>
        <div style={{ width: 80, height: 30, background: "white", borderRadius: 20 }} />
        <div style={{ width: 50, height: 25, background: "white", borderRadius: 15, marginLeft: 20, marginTop: -12 }} />
      </div>
      <div style={{ position: "absolute", top: "12%", right: "8%", opacity: 0.3, animation: "floatCloud 10s ease-in-out infinite 2s", pointerEvents: "none" }}>
        <div style={{ width: 60, height: 24, background: "white", borderRadius: 16 }} />
        <div style={{ width: 40, height: 20, background: "white", borderRadius: 12, marginLeft: 14, marginTop: -10 }} />
      </div>
      <div style={{ position: "absolute", bottom: "15%", left: "10%", opacity: 0.25, animation: "floatCloud 12s ease-in-out infinite 4s", pointerEvents: "none" }}>
        <div style={{ width: 90, height: 32, background: "white", borderRadius: 20 }} />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        {/* Title */}
        <div
          style={{
            animation: "titleBounce 3s ease-in-out infinite",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: "clamp(44px, 12vw, 64px)",
              color: C.text,
              fontWeight: 700,
              lineHeight: 1.0,
              textShadow: `3px 3px 0 ${C.sun}`,
            }}
          >
            Word Hero
          </div>
        </div>

        <div
          style={{
            fontSize: 15,
            color: C.text,
            fontFamily: FONT,
            fontWeight: 500,
            opacity: 0.7,
            marginBottom: 36,
          }}
        >
          Learn to read, one word at a time!
        </div>

        {/* Who's training label */}
        {profiles.length > 0 && (
          <div
            style={{
              fontSize: 17,
              color: C.text,
              fontFamily: FONT,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            Who's training today?
          </div>
        )}

        {/* Profile cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 22,
          }}
        >
          {profiles.map((kid, idx) => (
            <div
              key={kid.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                animation: `cardSlideIn 0.4s ease-out ${idx * 0.08}s both`,
              }}
            >
              <button
                className="ks-profile-card"
                onClick={() => onSelect(kid)}
                style={{
                  flex: 1,
                  background: "white",
                  border: `3px solid transparent`,
                  borderRadius: RADIUS.card,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: `0 4px 16px ${C.shadow}`,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>
                  {kid.avatar}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: "clamp(18px, 5vw, 24px)",
                      color: C.text,
                      fontWeight: 600,
                    }}
                  >
                    {kid.name}
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
                    Tap to start!
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Remove ${kid.name}'s profile?`))
                    onDelete(kid.id);
                }}
                style={{
                  background: `${C.heart}18`,
                  border: `2px solid ${C.heart}30`,
                  borderRadius: 14,
                  padding: "11px 13px",
                  cursor: "pointer",
                  color: C.heart,
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1,
                  transition: "background 0.18s",
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
              borderBottom: `5px solid ${C.secondary}cc`,
              borderRadius: RADIUS.button,
              padding: "16px 28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 16px rgba(63, 175, 232, 0.25)",
              transition: "transform 0.2s",
              animation: "addBtnPop 0.5s ease-out 0.25s both",
            }}
          >
            <span
              style={{
                fontSize: 22,
                color: C.sun,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              +
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 17,
                color: "white",
                fontWeight: 700,
              }}
            >
              Add a Hero
            </span>
          </button>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: RADIUS.card,
              padding: 22,
              boxShadow: `0 8px 32px ${C.shadow}`,
              animation: "cardSlideIn 0.3s ease-out both",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 18,
                fontWeight: 600,
                color: C.text,
                marginBottom: 14,
              }}
            >
              Create Your Hero
            </div>
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
                padding: "12px 16px",
                color: C.text,
                fontSize: 17,
                fontFamily: FONT,
                fontWeight: 500,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 14,
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
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
                    fontSize: 28,
                    background:
                      i === avatar ? `${C.accent}25` : "transparent",
                    border: `3px solid ${i === avatar ? C.accent : "transparent"}`,
                    borderRadius: RADIUS.small,
                    padding: 5,
                    cursor: "pointer",
                    lineHeight: 1,
                    transition: "all 0.15s",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setAdding(false)}
                style={{
                  background: C.panel,
                  border: "none",
                  borderBottom: `3px solid ${C.border}`,
                  borderRadius: RADIUS.button,
                  padding: "8px 20px",
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.text,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                style={{
                  background: C.primary,
                  border: "none",
                  borderBottom: `4px solid ${C.primary}cc`,
                  borderRadius: RADIUS.button,
                  padding: "8px 20px",
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.text,
                  cursor: "pointer",
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
