import { C, FONT, RADIUS } from "../../constants";

export default function WelcomeScreen({ onLogin, onCreateAccount }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.secondary} 0%, #E0F2FE 40%, ${C.green} 80%, ${C.accent} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Playful floating shapes */}
      <div style={{ position: "absolute", top: "8%", left: "5%", width: 100, height: 100, background: C.primary, borderRadius: "40% 60% 70% 30%", opacity: 0.2, animation: "floatBlob 8s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "20%", right: "0%", width: 140, height: 140, background: C.accent, borderRadius: "60% 40% 30% 70%", opacity: 0.2, animation: "floatBlobRev 10s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", left: "-5%", width: 120, height: 120, background: C.secondary, borderRadius: "50%", opacity: 0.2, animation: "floatBlob 12s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "30%", right: "5%", width: 80, height: 80, background: C.green, borderRadius: "50% 30% 50% 70%", opacity: 0.25, animation: "floatBlobRev 9s ease-in-out infinite", pointerEvents: "none" }} />

      {/* Logo area */}
      <div style={{ textAlign: "center", marginBottom: 48, position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>⚡</div>
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 48,
            fontWeight: 700,
            color: C.text,
            letterSpacing: 2,
            margin: 0,
            textShadow: `3px 3px 0px ${C.ink}15`,
          }}
        >
          Word Hero
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 16,
            color: C.muted,
            marginTop: 8,
            fontWeight: 500,
          }}
        >
          Learn sight words like a superhero!
        </p>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 320,
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          className="toy-block toy-pressable"
          onClick={onLogin}
          style={{
            width: "100%",
            padding: "18px 24px",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: FONT,
            color: C.textLight,
            background: C.primary,
            borderRadius: RADIUS.button,
            border: `3px solid ${C.ink}`,
            boxShadow: `4px 5px 0px ${C.ink}`,
            cursor: "pointer",
          }}
        >
          Log In
        </button>

        <button
          className="toy-block toy-pressable"
          onClick={onCreateAccount}
          style={{
            width: "100%",
            padding: "18px 24px",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: FONT,
            color: C.text,
            background: C.accent,
            borderRadius: RADIUS.button,
            border: `3px solid ${C.ink}`,
            boxShadow: `4px 5px 0px ${C.ink}`,
            cursor: "pointer",
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
