import { useState } from "react";
import { C, FONT, RADIUS } from "../../constants";

export default function ForgotPasswordScreen({ onBack, onSendCode }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email"); return; }
    setLoading(true);
    try {
      await onSendCode(email);
      setSent(true);
    } catch (err) {
      setError(err.code === "auth/user-not-found" ? "No account found with this email" : "Something went wrong. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: C.text,
          fontSize: 24,
          cursor: "pointer",
          padding: "8px",
          marginBottom: 16,
          fontFamily: FONT,
          fontWeight: 700,
        }}
      >
        ← Back
      </button>

      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 32,
            fontWeight: 700,
            color: C.text,
            marginBottom: 8,
          }}
        >
          Reset password 🔑
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 15,
            color: C.muted,
            marginBottom: 32,
          }}
        >
          {sent
            ? "We sent a reset code to your email!"
            : "Enter your email and we'll send you a reset code"}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@example.com"
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: 16,
                fontFamily: FONT,
                borderRadius: RADIUS.small,
                border: `2px solid ${C.ink}20`,
                background: C.surface,
                color: C.text,
                outline: "none",
                marginBottom: 24,
                boxSizing: "border-box",
              }}
            />

            {error && (
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 14,
                  color: C.red,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="toy-block toy-pressable"
              style={{
                width: "100%",
                padding: "16px",
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
              Send Code
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>📧</div>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 16,
                color: C.text,
                marginBottom: 24,
              }}
            >
              Check <strong>{email}</strong> for your reset code.
            </p>
            <button
              className="toy-block toy-pressable"
              onClick={onBack}
              style={{
                padding: "14px 32px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: FONT,
                color: C.text,
                background: C.surface,
                borderRadius: RADIUS.button,
                border: `3px solid ${C.ink}`,
                boxShadow: `4px 5px 0px ${C.ink}`,
                cursor: "pointer",
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
