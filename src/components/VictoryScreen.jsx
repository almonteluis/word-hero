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
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: `linear-gradient(180deg, ${C.sun} 0%, ${C.accent} 40%, ${C.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        overflow: "hidden",
        animation: "victoryBgExpand 2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      <style>{`
        @keyframes victoryBgExpand {
          0% {
            clip-path: circle(0% at 50% 50%);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            clip-path: circle(150% at 50% 50%);
            opacity: 1;
          }
        }
        @keyframes starFallIn {
          0% {
            opacity: 0;
            transform: translateY(-80px) translateX(-30px) scale(0.3) rotate(-45deg);
          }
          50% {
            opacity: 1;
            transform: translateY(10px) translateX(5px) scale(1.2) rotate(5deg);
          }
          70% {
            transform: translateY(-5px) translateX(-2px) scale(0.95) rotate(-2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1) rotate(0deg);
          }
        }
        @keyframes headlineSlideUp {
          0% {
            opacity: 0;
            transform: translateY(120px) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateY(-8px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes scoreSlideRight {
          0% {
            opacity: 0;
            transform: translateX(-60px) scale(0.7);
          }
          60% {
            opacity: 1;
            transform: translateX(5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes emojiBounceIn {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-30deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.4) rotate(10deg);
          }
          70% {
            transform: scale(0.9) rotate(-3deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes statsFadeUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes buttonsSlideUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
            animation: `confettiFall ${2 + (i % 3)}s ease-in ${2 + i * 0.15}s infinite`,
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
        {/* Stars — fall in left to right, sequentially */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 8,
          }}
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                fontSize: s === 2 ? 60 : 48,
                lineHeight: 1,
                animation:
                  s <= stars
                    ? `starFallIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${2.1 + s * 0.3}s both`
                    : "none",
                opacity: s <= stars ? undefined : 0.2,
                filter: s <= stars ? "none" : "grayscale(1)",
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Headline — slides up from bottom */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 42,
            color: C.text,
            fontWeight: 700,
            animation: `headlineSlideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 2.4s both`,
          }}
        >
          {messages[stars]}
        </div>

        {/* Score — slides in from left */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 52,
            color: "white",
            fontWeight: 700,
            textShadow: "2px 2px 0 rgba(0,0,0,0.15)",
            animation: `scoreSlideRight 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 2.8s both`,
          }}
        >
          {score}/{total}
        </div>

        {/* Celebrating character — bounces in */}
        <div
          style={{
            fontSize: 72,
            animation: `emojiBounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 3.2s both, float 2s ease-in-out 4s infinite`,
            margin: "8px 0",
          }}
        >
          {stars >= 2 ? "🎉" : "💪"}
        </div>

        {/* Stats row — fades up with stagger */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            animation: `statsFadeUp 0.6s ease-out 3.5s both`,
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
              animation: `statsFadeUp 0.5s ease-out ${3.5}s both`,
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
              animation: `statsFadeUp 0.5s ease-out ${3.65}s both`,
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
              animation: `statsFadeUp 0.5s ease-out ${3.8}s both`,
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

        {/* Action buttons — slide up last */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            animation: `buttonsSlideUp 0.6s ease-out 4.1s both`,
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
