import { C, FONT, RADIUS } from "../constants";

function VictoryScreen({ score, total, onRetry, onContinue, onHome, continueLabel = "Continue →" }) {
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
        background: `linear-gradient(180deg, ${C.sun} 0%, ${C.accent} 35%, #FFF5CC 70%, ${C.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
        animation: "victoryExpand 2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      <style>{`
        @keyframes victoryExpand {
          0% {
            clip-path: circle(0% at 50% 50%);
            opacity: 0;
          }
          20% {
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
            transform: translateY(-100px) translateX(-40px) scale(0.2) rotate(-60deg);
          }
          45% {
            opacity: 1;
            transform: translateY(8px) translateX(4px) scale(1.25) rotate(8deg);
          }
          65% {
            transform: translateY(-6px) translateX(-2px) scale(0.92) rotate(-3deg);
          }
          85% {
            transform: translateY(2px) scale(1.04) rotate(1deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1) rotate(0deg);
          }
        }
        @keyframes headlineFromBottom {
          0% {
            opacity: 0;
            transform: translateY(140px) scale(0.7);
          }
          55% {
            opacity: 1;
            transform: translateY(-10px) scale(1.08);
          }
          75% {
            transform: translateY(4px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes scoreSlideIn {
          0% {
            opacity: 0;
            transform: translateX(-80px) scale(0.6);
          }
          60% {
            opacity: 1;
            transform: translateX(6px) scale(1.06);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes emojiBounceIn {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-40deg);
          }
          45% {
            opacity: 1;
            transform: scale(1.5) rotate(12deg);
          }
          65% {
            transform: scale(0.85) rotate(-5deg);
          }
          80% {
            transform: scale(1.1) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes statCardIn {
          0% {
            opacity: 0;
            transform: translateY(50px) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateY(-4px) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes buttonsIn {
          0% {
            opacity: 0;
            transform: translateY(60px);
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
          50% { transform: translateY(-12px); }
        }
      `}</style>

      {Array.from({ length: 24 }).map((_, i) => (
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
            animation: `confettiFall ${2.5 + (i % 3)}s ease-in ${2 + i * 0.12}s infinite`,
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
          gap: 10,
          maxWidth: 380,
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 4,
          }}
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                fontSize: s === 2 ? 64 : 50,
                lineHeight: 1,
                animation:
                  s <= stars
                    ? `starFallIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${2.0 + s * 0.25}s both`
                    : "none",
                opacity: s <= stars ? undefined : 0.2,
                filter: s <= stars ? "none" : "grayscale(1)",
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        <div
          style={{
            fontFamily: FONT,
            fontSize: 44,
            color: C.text,
            fontWeight: 700,
            textWrap: "balance",
            animation: `headlineFromBottom 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 2.5s both`,
          }}
        >
          {messages[stars]}
        </div>

        <div
          style={{
            fontFamily: FONT,
            fontSize: 56,
            color: "white",
            fontWeight: 700,
            textShadow: "3px 3px 0 rgba(0,0,0,0.12)",
            fontVariantNumeric: "tabular-nums",
            animation: `scoreSlideIn 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 2.9s both`,
          }}
        >
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{score}/{total}</span>
        </div>

        <div
          style={{
            fontSize: 76,
            margin: "4px 0",
            animation: `emojiBounceIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 3.3s both, float 2.5s ease-in-out 4.2s infinite`,
          }}
        >
          {stars >= 2 ? "🎉" : "💪"}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          {[
            { emoji: "🏆", value: trophies, label: "trophies", borderColor: C.accent, valueColor: C.accent, delay: 3.7 },
            { emoji: "🪙", value: coins, label: "coins", borderColor: C.sun, valueColor: C.sun, delay: 3.85 },
            { emoji: "❤️", value: hearts, label: "hearts", borderColor: C.heart, valueColor: C.heart, delay: 4.0 },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "white",
                borderRadius: RADIUS.card,
                padding: "10px 16px",
                textAlign: "center",
                boxShadow: `0 4px 12px ${C.shadow}`,
                border: `3px solid ${stat.borderColor}30`,
                minWidth: 80,
                animation: `statCardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${stat.delay}s both`,
              }}
            >
              <div style={{ fontSize: 20 }}>{stat.emoji}</div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 20,
                  color: stat.valueColor,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 10,
                  color: C.muted,
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            animation: `buttonsIn 0.6s ease-out 4.3s both`,
          }}
        >
          {onRetry && (
            <button
              className="toy-block toy-pressable"
              onClick={onRetry}
              style={{
                background: C.surface,
                color: C.text,
                padding: "12px 24px",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              ← Retry
            </button>
          )}
          {onContinue && (
            <button
              className="toy-block toy-pressable"
              onClick={onContinue}
              style={{
                background: C.primary,
                color: C.text,
                padding: "12px 24px",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              {continueLabel}
            </button>
          )}
          {onHome && (
            <button
              className="toy-block toy-pressable"
              onClick={onHome}
              style={{
                background: C.green,
                color: C.text,
                padding: "12px 24px",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              🏠 Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VictoryScreen;
