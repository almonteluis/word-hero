import { useState } from "react";
import { C, FONT, RADIUS } from "../constants";
import HomeBackground from "./HomeBackground";
import Btn from "./Btn";

const AVATARS = [
  "🦸",
  "🦸‍♀️",
  "🦹",
  "🦹‍♀️",
  "🧑‍🚀",
  "👨‍🚀",
  "🦊",
  "🐉",
  "🦁",
  "🐺",
  "🦅",
  "🐲",
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
        background:
          "linear-gradient(180deg,#0c1130 0%,#0a0e27 55%,#0c1530 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <HomeBackground />

      <style>{`
        @keyframes titleGlow {
          0%,100% { filter: drop-shadow(0 0 12px #f6c61970); }
          50%      { filter: drop-shadow(0 0 28px #f6c619aa); }
        }
        @keyframes cardSlideIn {
          0%   { opacity: 0; transform: translateY(14px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes addBtnPop {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ks-hero-card:hover  { border-color: rgba(246,198,25,0.7) !important; box-shadow: 0 0 24px rgba(246,198,25,0.25) !important; }
        .ks-delete-btn:hover { background: rgba(232,69,69,0.55) !important; border-color: rgba(232,69,69,0.8) !important; }
        .ks-add-btn:hover    { transform: scale(1.03) !important; box-shadow: 0 8px 32px rgba(74,144,255,0.55) !important; }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        {/* ── Title ── */}
        <div
          style={{
            animation: "titleGlow 3.5s ease-in-out infinite",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: "clamp(50px, 14vw, 74px)",
              color: "#f6c619",
              letterSpacing: "0.03em",
              lineHeight: 1.0,
              textShadow:
                "3px 3px 0 #c4900a, 6px 6px 0 #7a5800, 0 0 40px rgba(246,198,25,0.4)",
            }}
          >
            ⚡ WORD
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: "clamp(50px, 14vw, 74px)",
              color: "#f6c619",
              letterSpacing: "0.03em",
              lineHeight: 1.0,
              textShadow:
                "3px 3px 0 #c4900a, 6px 6px 0 #7a5800, 0 0 40px rgba(246,198,25,0.4)",
              marginBottom: 8,
            }}
          >
            HERO ⚡ ⚡
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#7ab8d4",
            fontFamily: FONT,
            letterSpacing: 6,
            marginBottom: 44,
            textTransform: "uppercase",
          }}
        >
          TRAINING ACADEMY
        </div>

        {/* ── Who's training label ── */}
        <div
          style={{
            fontSize: 15,
            color: "#f0f0f0",
            fontFamily: FONT,
            letterSpacing: 3,
            marginBottom: 18,
            fontWeight: 800,
          }}
        >
          WHO'S TRAINING TODAY?
        </div>

        {/* ── Profile cards ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
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
                className="ks-hero-card"
                onClick={() => onSelect(kid)}
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg,rgba(91,184,212,0.16) 0%,rgba(58,152,176,0.10) 100%)",
                  border: "2.5px solid rgba(246,198,25,0.32)",
                  borderRadius: 20,
                  padding: "15px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "border-color 0.22s, box-shadow 0.22s",
                  backdropFilter: "blur(6px)",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 42, lineHeight: 1, flexShrink: 0 }}>
                  {kid.avatar}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: "clamp(20px, 5.5vw, 26px)",
                      color: "#f0f0f0",
                      letterSpacing: 1,
                    }}
                  >
                    {kid.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 10,
                      color: "#7ab8d4",
                      letterSpacing: 2.5,
                      marginTop: 3,
                    }}
                  >
                    TAP TO START TRAINING
                  </div>
                </div>
              </button>

              <button
                className="ks-delete-btn"
                onClick={() => {
                  if (confirm(`Remove ${kid.name}'s profile?`))
                    onDelete(kid.id);
                }}
                style={{
                  background: "rgba(232,69,69,0.22)",
                  border: "2px solid rgba(232,69,69,0.38)",
                  borderRadius: 14,
                  padding: "11px 13px",
                  cursor: "pointer",
                  color: "#e84545",
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1,
                  transition: "background 0.18s, border-color 0.18s",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ── Add hero / form ── */}
        {!adding ? (
          <button
            className="ks-add-btn"
            onClick={() => setAdding(true)}
            style={{
              width: "100%",
              background:
                "linear-gradient(135deg,#2e6fd4 0%,#4a90ff 60%,#5ca8ff 100%)",
              border: "none",
              borderRadius: 50,
              padding: "18px 28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 22px rgba(74,144,255,0.38)",
              transition: "transform 0.22s, box-shadow 0.22s",
              animation: "addBtnPop 0.5s ease-out 0.25s both",
            }}
          >
            <span
              style={{
                fontSize: 22,
                color: "#f6c619",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              +
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 16,
                color: "white",
                letterSpacing: 3,
                fontWeight: 800,
              }}
            >
              ADD A HERO
            </span>
          </button>
        ) : (
          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(24,38,76,0.97) 0%,rgba(17,22,56,0.97) 100%)",
              borderRadius: 24,
              padding: 22,
              border: "2px solid rgba(74,144,255,0.38)",
              backdropFilter: "blur(12px)",
              animation: "cardSlideIn 0.3s ease-out both",
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hero name..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{
                width: "100%",
                background: "rgba(10,14,39,0.85)",
                border: "2px solid rgba(74,144,255,0.45)",
                borderRadius: 14,
                padding: "13px 16px",
                color: "#f0f0f0",
                fontSize: 18,
                fontFamily: FONT,
                letterSpacing: 2,
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
                      i === avatar ? "rgba(74,144,255,0.22)" : "transparent",
                    border: `2px solid ${i === avatar ? "#4a90ff" : "transparent"}`,
                    borderRadius: 12,
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
              <Btn
                onClick={() => setAdding(false)}
                color={C.panel}
                small
                style={{
                  border: "1px solid rgba(122,130,166,0.35)",
                  color: C.muted,
                }}
              >
                CANCEL
              </Btn>
              <Btn onClick={handleAdd} color={C.green} small>
                CREATE HERO
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KidSelector;
