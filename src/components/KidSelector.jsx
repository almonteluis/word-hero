import { useState, useRef } from "react";
import { C, FONT, RADIUS } from "../constants";

const ANIMAL_HEROES = [
  "🦊", "🐱", "🐻", "🦁", "🐰", "🦄",
  "🐸", "🐼", "🐨", "🐯", "🦋", "🐧",
];

const KID_HEROES = [
  "👦🏻", "👧🏻", "👦🏽", "👧🏽", "👦🏾", "👧🏾",
  "👦🏿", "👧🏿", "🧒🏻", "🧒🏽", "🧒🏿", "🧑🏻",
];

const ALL_AVATARS = [...KID_HEROES, ...ANIMAL_HEROES];

// ─── SwipeRow ───────────────────────────────────────────────
function SwipeRow({ kid, onSelect, onDelete, idx }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(null);
  const startOffset = useRef(0);
  const REVEAL = 72;

  const begin = (clientX) => {
    startX.current = clientX;
    startOffset.current = offset;
    setDragging(true);
  };
  const move = (clientX) => {
    if (!dragging || startX.current === null) return;
    const dx = clientX - startX.current;
    setOffset(Math.max(-REVEAL, Math.min(0, startOffset.current + dx)));
  };
  const end = () => {
    if (!dragging) return;
    setDragging(false);
    setOffset(offset < -REVEAL / 2 ? -REVEAL : 0);
    startX.current = null;
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        animation: `cardBounceIn .5s cubic-bezier(.34,1.56,.64,1) ${idx * 0.1 + 0.2}s both`,
      }}
      onMouseMove={(e) => move(e.clientX)}
      onMouseUp={end}
      onMouseLeave={end}
    >
      {/* Delete zone */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: REVEAL,
          background: C.heart,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0 20px 20px 0",
          border: `4px solid ${C.ink}`,
          borderLeft: "none",
        }}
      >
        <button
          onClick={onDelete}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 20 }}>🗑️</span>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 9,
              fontWeight: 700,
              color: "white",
              letterSpacing: 0.3,
            }}
          >
            DELETE
          </span>
        </button>
      </div>

      {/* Sliding card */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform .25s cubic-bezier(.4,0,.2,1)",
        }}
        onTouchStart={(e) => begin(e.touches[0].clientX)}
        onTouchMove={(e) => move(e.touches[0].clientX)}
        onTouchEnd={end}
        onMouseDown={(e) => begin(e.clientX)}
      >
        <button
          className="toy-block toy-pressable"
          onClick={() => {
            if (offset < 0) {
              setOffset(0);
              return;
            }
            onSelect(kid);
          }}
          style={{
            width: "100%",
            background: C.surface,
            padding: "14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            textAlign: "left",
            borderWidth: 3,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: C.panel,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              flexShrink: 0,
              border: `3px solid ${C.ink}`,
              boxShadow: `3px 4px 0 ${C.ink}`,
            }}
          >
            {kid.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 20,
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
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              Tap to play · swipe ← to delete
            </div>
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: C.primary,
              border: `2px solid ${C.ink}`,
              boxShadow: `2px 2px 0 ${C.ink}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            →
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── AvatarPicker ────────────────────────────────────────────
function AvatarPicker({ value, onChange }) {
  const [tab, setTab] = useState(value && ANIMAL_HEROES.includes(value) ? "animals" : "heroes");

  const avatars = tab === "heroes" ? KID_HEROES : ANIMAL_HEROES;

  return (
    <div>
      {/* Toggle tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { key: "heroes", label: "🧒 Kid Heroes" },
          { key: "animals", label: "🐾 Animal Heroes" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 700,
              padding: "7px 18px",
              borderRadius: 50,
              cursor: "pointer",
              transition: "all .2s",
              border: `3px solid ${C.ink}`,
              background: tab === t.key ? C.accent : "white",
              boxShadow:
                tab === t.key
                  ? `3px 4px 0 ${C.ink}`
                  : `2px 3px 0 ${C.ink}`,
              color: tab === t.key ? C.ink : C.muted,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Avatar grid */}
      <div
        style={{
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {avatars.map((a) => {
          const sel = a === value;
          return (
            <button
              key={a}
              onClick={() => onChange(a)}
              style={{
                fontSize: 26,
                background: sel
                  ? "linear-gradient(135deg, #FFDE5930, #FFD16630)"
                  : "rgba(201,240,226,.5)",
                border: `3px solid ${sel ? C.accent : "transparent"}`,
                borderRadius: sel ? "50%" : RADIUS.small,
                width: sel ? 48 : 44,
                height: sel ? 48 : 44,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .18s cubic-bezier(.34,1.56,.64,1)",
                boxShadow: sel ? "0 0 12px #FFDE5950" : "none",
              }}
            >
              {a}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── KidSelector ─────────────────────────────────────────────
function KidSelector({ profiles, onSelect, onAdd, onDelete, onProfile }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(KID_HEROES[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      id: Date.now().toString(),
      name: name.trim(),
      avatar,
    });
    setName("");
    setAvatar(KID_HEROES[0]);
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
          50% { transform: translateX(20px); }
          100% { transform: translateX(0); }
        }
        @keyframes cloudDriftReverse {
          0% { transform: translateX(0); }
          50% { transform: translateX(-18px); }
          100% { transform: translateX(0); }
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
      `}</style>

      {/* Clouds */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "3%",
          zIndex: 0,
          animation: "cloudDrift 12s ease-in-out infinite",
          pointerEvents: "none",
        }}
      >
        <svg width="110" height="44" viewBox="0 0 120 50">
          <ellipse cx="60" cy="32" rx="58" ry="18" fill="white" opacity="0.9" />
          <ellipse cx="35" cy="24" rx="30" ry="16" fill="white" opacity="0.95" />
          <ellipse cx="80" cy="22" rx="26" ry="14" fill="white" opacity="0.92" />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "5%",
          zIndex: 0,
          opacity: 0.6,
          pointerEvents: "none",
        }}
      >
        <svg width="80" height="34" viewBox="0 0 90 40">
          <ellipse cx="45" cy="26" rx="44" ry="14" fill="#FFE4E6" opacity="0.9" />
          <ellipse cx="28" cy="18" rx="24" ry="12" fill="#FFE4E6" opacity="0.95" />
        </svg>
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          padding: "60px 20px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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

        {/* Title */}
        <div
          style={{
            animation: "titleFloat 4s ease-in-out infinite",
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: "clamp(52px, 14vw, 64px)",
              color: "white",
              fontWeight: 700,
              lineHeight: 1,
              textShadow: `3px 3px 0 ${C.accent}, 0 0 40px ${C.sun}60`,
            }}
          >
            Word
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: "clamp(56px, 15vw, 70px)",
              color: C.sun,
              fontWeight: 700,
              lineHeight: 1,
              textShadow: `3px 3px 0 ${C.accent}`,
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
            fontSize: 15,
            color: C.text,
            fontWeight: 700,
            marginBottom: 28,
            letterSpacing: 0.5,
          }}
        >
          Learn to read, one word at a time!
        </div>

        {/* Choose header */}
        {profiles.length > 0 && (
          <div
            className="toy-block"
            style={{
              fontFamily: FONT,
              fontSize: 17,
              color: C.text,
              fontWeight: 700,
              marginBottom: 14,
              background: C.surface,
              borderRadius: 16,
              padding: "5px 20px",
              borderWidth: 3,
              boxShadow: `3px 4px 0 ${C.ink}`,
            }}
          >
            Choose Your Hero
          </div>
        )}

        {/* Profile cards — swipe to delete */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
            marginBottom: 16,
          }}
        >
          {profiles.map((kid, idx) => (
            <SwipeRow
              key={kid.id}
              kid={kid}
              idx={idx}
              onSelect={onSelect}
              onDelete={() => {
                if (confirm(`Remove ${kid.name}'s profile?`)) onDelete(kid.id);
              }}
            />
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
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: FONT,
              fontSize: 17,
              fontWeight: 700,
              color: C.textLight,
              letterSpacing: 0.5,
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>+</span>
            Add a Hero
          </button>
        ) : (
          <div
            className="toy-block"
            style={{
              background: C.surface,
              padding: 20,
              width: "100%",
              animation: "formSlideUp 0.35s ease-out both",
              borderWidth: 3,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 18,
                fontWeight: 700,
                color: C.text,
                marginBottom: 4,
              }}
            >
              Create Your Hero
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 12,
                color: C.muted,
                marginBottom: 14,
              }}
            >
              Pick a character and give them a name!
            </div>

            {/* Tabbed avatar picker */}
            <div style={{ marginBottom: 14 }}>
              <AvatarPicker value={avatar} onChange={setAvatar} />
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
                borderRadius: 16,
                padding: "10px 16px",
                color: C.text,
                fontSize: 16,
                fontFamily: FONT,
                fontWeight: 700,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 14,
              }}
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                className="toy-block toy-pressable"
                onClick={() => setAdding(false)}
                style={{
                  background: C.panel,
                  padding: "8px 18px",
                  fontFamily: FONT,
                  fontSize: 14,
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
                  padding: "8px 18px",
                  fontFamily: FONT,
                  fontSize: 14,
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
export { ALL_AVATARS, KID_HEROES, ANIMAL_HEROES };
