import { useState } from "react";
import { C, AVATARS } from "../constants";
import { StarField } from "./StarField";
import { Btn } from "./Btn";

export function KidSelector({ profiles, onSelect, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ id: Date.now().toString(), name: name.trim(), avatar: AVATARS[avatar] });
    setName("");
    setAvatar(0);
    setAdding(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <StarField />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontFamily: "'Russo One', sans-serif",
            color: C.accent,
            letterSpacing: 6,
            textShadow: `0 0 30px ${C.accent}50, 2px 2px 0 ${C.red}`,
            marginBottom: 4,
          }}
        >
          ⚡ WORD HERO ⚡
        </div>
        <div
          style={{
            fontSize: 14,
            color: C.muted,
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 4,
            marginBottom: 36,
          }}
        >
          TRAINING ACADEMY
        </div>

        <div
          style={{
            fontSize: 15,
            color: C.text,
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 3,
            marginBottom: 16,
          }}
        >
          WHO'S TRAINING TODAY?
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {profiles.map((kid) => (
            <div key={kid.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => onSelect(kid)}
                style={{
                  flex: 1,
                  background: C.panel,
                  border: `2px solid ${C.accent}30`,
                  borderRadius: 16,
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.boxShadow = `0 0 20px ${C.accent}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.accent + "30";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: 36 }}>{kid.avatar}</span>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: 22,
                      color: C.text,
                      letterSpacing: 2,
                    }}
                  >
                    {kid.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: 11,
                      color: C.muted,
                      letterSpacing: 2,
                    }}
                  >
                    TAP TO START TRAINING
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Remove ${kid.name}'s profile?`)) onDelete(kid.id);
                }}
                style={{
                  background: "transparent",
                  border: `1px solid ${C.muted}30`,
                  borderRadius: 10,
                  padding: "8px 10px",
                  cursor: "pointer",
                  color: C.muted,
                  fontSize: 14,
                  fontFamily: "'Russo One', sans-serif",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {!adding ? (
          <Btn onClick={() => setAdding(true)} color={C.blue} style={{ width: "100%" }}>
            + ADD A HERO
          </Btn>
        ) : (
          <div
            style={{
              background: C.panel,
              borderRadius: 20,
              padding: 20,
              border: `2px solid ${C.blue}40`,
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
                background: C.bg,
                border: `2px solid ${C.blue}40`,
                borderRadius: 12,
                padding: "12px 16px",
                color: C.text,
                fontSize: 18,
                fontFamily: "'Russo One', sans-serif",
                letterSpacing: 2,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 12,
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              {AVATARS.map((a, i) => (
                <button
                  key={i}
                  onClick={() => setAvatar(i)}
                  style={{
                    fontSize: 28,
                    background: i === avatar ? C.blue + "30" : "transparent",
                    border: `2px solid ${i === avatar ? C.blue : "transparent"}`,
                    borderRadius: 12,
                    padding: 4,
                    cursor: "pointer",
                    lineHeight: 1,
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
                style={{ border: `1px solid ${C.muted}40`, color: C.muted }}
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
