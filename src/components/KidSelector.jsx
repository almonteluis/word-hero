import { useState } from "react";
import { C, AVATARS } from "../constants";
import { StarField } from "./StarField";
import { Btn } from "./Btn";

export function KidSelector({ profiles, onSelect, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [hoveredKid, setHoveredKid] = useState(null);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ id: Date.now().toString(), name: name.trim(), avatar: AVATARS[avatar] });
    setName("");
    setAvatar(0);
    setAdding(false);
  };

  const colors = [C.blue, C.green, C.purple, C.accent, C.red];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at center, ${C.panelHover} 0%, ${C.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <StarField />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .hero-card {
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .hero-card:hover {
          transform: translateY(-5px) scale(1.05);
        }
        .hero-card:active {
          transform: translateY(4px) scale(0.95);
        }
        
        /* Hide scrollbar for grid */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1); 
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: ${C.muted}; 
          border-radius: 10px;
        }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 700,
          textAlign: "center",
          animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        <div
          style={{
            fontSize: 54,
            fontFamily: "'Russo One', sans-serif",
            color: "#FFF",
            letterSpacing: 4,
            textShadow: `0 8px 0 ${C.red}, 0 0 30px ${C.accent}80`,
            marginBottom: 8,
            animation: "float 4s ease-in-out infinite",
            transformOrigin: "center"
          }}
        >
          ⚡ WORD HERO ⚡
        </div>
        
        <div
          style={{
            background: C.panel,
            border: `4px solid ${C.blue}`,
            borderRadius: 30,
            padding: "8px 24px",
            display: "inline-block",
            marginBottom: 40,
            boxShadow: `0 6px 0 ${C.blue}`,
            transform: "rotate(-2deg)"
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: C.accent,
              fontFamily: "'Russo One', sans-serif",
              letterSpacing: 2,
            }}
          >
            TRAINING ACADEMY
          </div>
        </div>

        <div
          style={{
            fontSize: 24,
            color: C.text,
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 2,
            marginBottom: 24,
            textShadow: `2px 2px 0 ${C.bg}`
          }}
        >
          WHO'S PLAYING TODAY? Let's go! 🚀
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          {profiles.map((kid, i) => {
            const cardColor = colors[i % colors.length];
            return (
              <div
                key={kid.id}
                onMouseEnter={() => setHoveredKid(kid.id)}
                onMouseLeave={() => setHoveredKid(null)}
                style={{ position: "relative" }}
              >
                <button
                  className="hero-card"
                  onClick={() => onSelect(kid)}
                  style={{
                    background: C.panel,
                    border: `4px solid ${cardColor}`,
                    borderRadius: 24,
                    padding: "24px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    boxShadow: `0 8px 0 ${cardColor}, 0 15px 20px rgba(0,0,0,0.3)`,
                    outline: "none",
                    minWidth: 160,
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `${cardColor}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `3px solid ${cardColor}`,
                      fontSize: 48,
                      boxShadow: "inset 0 4px 0 rgba(255,255,255,0.2)"
                    }}
                  >
                    {kid.avatar}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: 26,
                      color: C.text,
                      letterSpacing: 1,
                      textShadow: `1px 1px 0 #000`
                    }}
                  >
                    {kid.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: 14,
                      color: cardColor,
                      letterSpacing: 1,
                      backgroundColor: `${cardColor}20`,
                      padding: "6px 16px",
                      borderRadius: 16,
                    }}
                  >
                    SELECT
                  </div>
                </button>
                
                {hoveredKid === kid.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove ${kid.name}'s profile?`)) onDelete(kid.id);
                    }}
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      background: C.red,
                      border: "3px solid #FFF",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#FFF",
                      fontSize: 20,
                      fontFamily: "Arial, sans-serif",
                      fontWeight: "bold",
                      boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
                      zIndex: 10,
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {!adding && (
            <button
              className="hero-card"
              onClick={() => setAdding(true)}
              style={{
                background: "transparent",
                border: `4px dashed ${C.muted}`,
                borderRadius: 24,
                padding: "24px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                outline: "none",
                minWidth: 160,
                color: C.muted,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.accent;
                e.currentTarget.style.color = C.accent;
                e.currentTarget.style.background = `${C.accent}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.muted;
                e.currentTarget.style.color = C.muted;
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ fontSize: 50, fontWeight: "bold", lineHeight: 1 }}>+</div>
              <div
                style={{
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: 20,
                  letterSpacing: 1,
                  marginTop: 10
                }}
              >
                NEW HERO
              </div>
            </button>
          )}
        </div>

        {adding && (
          <div
            style={{
              background: C.panel,
              borderRadius: 32,
              padding: 30,
              border: `4px solid ${C.blue}`,
              boxShadow: `0 8px 0 ${C.blue}, 0 20px 30px rgba(0,0,0,0.5)`,
              animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              maxWidth: 450,
              margin: "0 auto"
            }}
          >
            <div style={{ 
              fontSize: 24, 
              fontFamily: "'Russo One', sans-serif",
              color: C.accent,
              marginBottom: 20
            }}>
              CREATE YOUR HERO!
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's your name?"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{
                width: "100%",
                background: C.bg,
                border: `3px solid ${C.muted}`,
                borderRadius: 16,
                padding: "16px 20px",
                color: C.text,
                fontSize: 22,
                fontFamily: "'Russo One', sans-serif",
                letterSpacing: 1,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 20,
                textAlign: "center"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = C.accent;
                e.target.style.boxShadow = `0 0 15px ${C.accent}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.muted;
                e.target.style.boxShadow = "none";
              }}
            />
            <div
              style={{
                fontSize: 16,
                color: C.text,
                fontFamily: "'Russo One', sans-serif",
                marginBottom: 12
              }}
            >
              CHOOSE AN AVATAR:
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                marginBottom: 24,
                background: `${C.bg}50`,
                padding: 16,
                borderRadius: 20
              }}
            >
              {AVATARS.map((a, i) => (
                <button
                  key={i}
                  className="hero-card"
                  onClick={() => setAvatar(i)}
                  style={{
                    fontSize: 32,
                    background: i === avatar ? C.accent : C.panel,
                    border: `3px solid ${i === avatar ? "#FFF" : "transparent"}`,
                    boxShadow: i === avatar ? `0 4px 0 #FFF` : `0 4px 0 rgba(0,0,0,0.2)`,
                    borderRadius: 16,
                    padding: "8px 0",
                    cursor: "pointer",
                    lineHeight: 1,
                    transition: "all 0.1s"
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <button
                className="hero-card"
                onClick={() => setAdding(false)}
                style={{ 
                  background: C.bg, 
                  color: C.text, 
                  border: `3px solid ${C.muted}`,
                  borderRadius: 16,
                  padding: "12px 24px",
                  fontSize: 16,
                  fontFamily: "'Russo One', sans-serif",
                  cursor: "pointer",
                  boxShadow: `0 4px 0 ${C.muted}`
                }}
              >
                CANCEL
              </button>
              <button
                className="hero-card"
                onClick={handleAdd}
                style={{ 
                  background: C.green, 
                  color: "#FFF", 
                  border: `3px solid #FFF`,
                  borderRadius: 16,
                  padding: "12px 24px",
                  fontSize: 18,
                  fontFamily: "'Russo One', sans-serif",
                  cursor: "pointer",
                  boxShadow: `0 4px 0 #FFF`,
                  flex: 1
                }}
              >
                GO! 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
