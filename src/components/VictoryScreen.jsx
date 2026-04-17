import { C, FONT, RADIUS } from "../constants";
import Btn from "./Btn";

function VictoryScreen({ score, total, onRetry, onContinue, showRetryAsPrimary = false }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  // Rewards based on performance
  const trophies = stars * 2;
  const coins = score * 5;
  const hearts = stars >= 3 ? 3 : stars >= 2 ? 2 : 1;

  const messages = {
    3: "Amazing!",
    2: "Great Job!",
    1: "Good Try!",
    0: "Keep Going!",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.sun} 0%, ${C.accent} 40%, ${C.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes starPop {
          0% { transform: scale(0) rotate(-20deg); }
          60% { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Confetti particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 17.3 + 5) % 100}%`,
            top: "-20px",
            width: 8 + (i % 4) * 3,
            height: 8 + (i % 4) * 3,
            background: [
              C.heart,
              C.secondary,
              C.green,
              C.accent,
              C.sun,
              C.purple,
            ][i % 6],
            borderRadius: i % 2 === 0 ? "50%" : "2px",
            animation: `confettiFall ${2 + (i % 3)}s ease-in ${i * 0.15}s infinite`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          maxWidth: 360,
          width: "100%",
        }}
      >
        {/* Stars */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                fontSize: s === 2 ? 56 : 44,
                lineHeight: 1,
                animation:
                  s <= stars
                    ? `starPop 0.5s ease-out ${0.3 + s * 0.2}s both`
                    : "none",
                opacity: s <= stars ? 1 : 0.2,
                filter: s <= stars ? "none" : "grayscale(1)",
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 36,
            color: C.text,
            fontWeight: 700,
            animation: "slideUp 0.5s ease-out 0.2s both",
          }}
        >
          {messages[stars]}
        </div>

        {/* Score */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 48,
            color: "white",
            fontWeight: 700,
            textShadow: "2px 2px 0 rgba(0,0,0,0.15)",
            animation: "slideUp 0.5s ease-out 0.4s both",
          }}
        >
          {score}/{total}
        </div>

        {/* Celebrating character */}
        <div
          style={{
            fontSize: 64,
            animation: "float 2s ease-in-out infinite",
            margin: "8px 0",
          }}
        >
          {stars >= 2 ? "🎉" : "💪"}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            animation: "slideUp 0.5s ease-out 0.6s both",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: RADIUS.card,
              padding: "10px 16px",
              textAlign: "center",
              boxShadow: `0 4px 12px ${C.shadow}`,
              border: `3px solid ${C.accent}30`,
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: 20 }}>🏆</div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 20,
                color: C.accent,
                fontWeight: 700,
              }}
            >
              {trophies}
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 10,
                color: C.muted,
                fontWeight: 600,
              }}
            >
              trophies
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: RADIUS.card,
              padding: "10px 16px",
              textAlign: "center",
              boxShadow: `0 4px 12px ${C.shadow}`,
              border: `3px solid ${C.sun}30`,
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: 20 }}>🪙</div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 20,
                color: C.sun,
                fontWeight: 700,
              }}
            >
              {coins}
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 10,
                color: C.muted,
                fontWeight: 600,
              }}
            >
              coins
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: RADIUS.card,
              padding: "10px 16px",
              textAlign: "center",
              boxShadow: `0 4px 12px ${C.shadow}`,
              border: `3px solid ${C.heart}30`,
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: 20 }}>❤️</div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 20,
                color: C.heart,
                fontWeight: 700,
              }}
            >
              {hearts}
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 10,
                color: C.muted,
                fontWeight: 600,
              }}
            >
              hearts
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            animation: "slideUp 0.5s ease-out 0.8s both",
          }}
        >
          <button
            onClick={onRetry}
            style={{
              background: "white",
              border: "none",
              borderBottom: `4px solid ${C.border}`,
              borderRadius: RADIUS.button,
              padding: "12px 24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 600,
              color: C.text,
              boxShadow: `0 4px 12px ${C.shadow}`,
              transition: "transform 0.15s",
            }}
          >
            ← Retry
          </button>
          {onContinue && (
            <button
              onClick={onContinue}
              style={{
                background: C.primary,
                border: "none",
                borderBottom: `4px solid ${C.primary}cc`,
                borderRadius: RADIUS.button,
                padding: "12px 24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 700,
                color: C.text,
                boxShadow: `0 4px 16px ${C.primary}40`,
                transition: "transform 0.15s",
              }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VictoryScreen;
