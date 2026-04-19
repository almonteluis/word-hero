import { useState } from "react";
import { C, FONT, RADIUS } from "../../constants";

const AVATARS = [
  "🦸", "🦹", "🧙", "🧑‍🚀", "🧑‍🎨", "🦊",
  "🐱", "🐶", "🐸", "🦁", "🐼", "🐰",
  "🤖", "👽", "🧸", "🐧", "🐯", "🐵",
];

const AGE_OPTIONS = ["3", "4", "5", "6", "7", "8", "9", "10"];

export default function CreateAccountScreen({ onBack, onCreateAccount, onGoogleSignup }) {
  const [step, setStep] = useState(1); // 1: parent info, 2: child profile
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childAvatar, setChildAvatar] = useState("🦸");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStep1 = (e) => {
    e.preventDefault();
    setError("");
    if (!parentName.trim()) { setError("Please enter your name"); return; }
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setStep(2);
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError("");
    if (!childName.trim()) { setError("Please enter your child's name"); return; }
    if (!childAge) { setError("Please select your child's age"); return; }
    setLoading(true);
    try {
      await onCreateAccount({
        parent: { name: parentName, email },
        password,
        children: [{ name: childName, age: childAge, avatar: childAvatar }],
      });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await onGoogleSignup();
    } catch (err) {
      setError(friendlyError(err.code));
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
        onClick={step === 1 ? onBack : () => setStep(1)}
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
        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ width: step === 1 ? 32 : 12, height: 12, borderRadius: 6, background: step === 1 ? C.primary : `${C.ink}15`, transition: "all 0.3s" }} />
          <div style={{ width: step === 2 ? 32 : 12, height: 12, borderRadius: 6, background: step === 2 ? C.primary : `${C.ink}15`, transition: "all 0.3s" }} />
        </div>

        {step === 1 ? (
          <>
            <h1
              style={{
                fontFamily: FONT,
                fontSize: 28,
                fontWeight: 700,
                color: C.text,
                marginBottom: 8,
              }}
            >
              Create your account 🎉
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 15, color: C.muted, marginBottom: 28 }}>
              Step 1 — Parent info
            </p>

            <form onSubmit={handleStep1}>
              <label style={{ display: "block", fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                Your Name
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent's name"
                style={{
                  width: "100%", padding: "14px 16px", fontSize: 16, fontFamily: FONT,
                  borderRadius: RADIUS.small, border: `2px solid ${C.ink}20`,
                  background: C.surface, color: C.text, outline: "none",
                  marginBottom: 20, boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@example.com"
                style={{
                  width: "100%", padding: "14px 16px", fontSize: 16, fontFamily: FONT,
                  borderRadius: RADIUS.small, border: `2px solid ${C.ink}20`,
                  background: C.surface, color: C.text, outline: "none",
                  marginBottom: 20, boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative", marginBottom: 24 }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{
                    width: "100%", padding: "14px 48px 14px 16px", fontSize: 16, fontFamily: FONT,
                    borderRadius: RADIUS.small, border: `2px solid ${C.ink}20`,
                    background: C.surface, color: C.text, outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", fontSize: 18, cursor: "pointer",
                    color: C.muted, padding: 4,
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {error && (
                <div style={{ fontFamily: FONT, fontSize: 14, color: C.red, marginBottom: 16, textAlign: "center" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="toy-block toy-pressable"
                style={{
                  width: "100%", padding: "16px", fontSize: 18, fontWeight: 700,
                  fontFamily: FONT, color: C.textLight, background: C.primary,
                  borderRadius: RADIUS.button, border: `3px solid ${C.ink}`,
                  boxShadow: `4px 5px 0px ${C.ink}`, cursor: "pointer",
                }}
              >
                Next — Add Child Profile
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
              <div style={{ flex: 1, height: 1, background: `${C.ink}15` }} />
              <span style={{ fontFamily: FONT, fontSize: 13, color: C.muted }}>or</span>
              <div style={{ flex: 1, height: 1, background: `${C.ink}15` }} />
            </div>

            <button
              className="toy-block toy-pressable"
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: "100%", padding: "14px", fontSize: 16, fontWeight: 600,
                fontFamily: FONT, color: C.text, background: C.surface,
                borderRadius: RADIUS.button, border: `3px solid ${C.ink}`,
                boxShadow: `4px 5px 0px ${C.ink}`, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
          </>
        ) : (
          <>
            <h1
              style={{
                fontFamily: FONT,
                fontSize: 28,
                fontWeight: 700,
                color: C.text,
                marginBottom: 8,
              }}
            >
              Add your hero! ⭐
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 15, color: C.muted, marginBottom: 28 }}>
              Step 2 — Child's profile (you can add more later)
            </p>

            <form onSubmit={handleStep2}>
              {/* Avatar picker */}
              <label style={{ display: "block", fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>
                Choose an Avatar
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setChildAvatar(av)}
                    className={childAvatar === av ? "toy-block" : ""}
                    style={{
                      fontSize: 28,
                      padding: 8,
                      borderRadius: RADIUS.small,
                      border: childAvatar === av ? `3px solid ${C.ink}` : "3px solid transparent",
                      background: childAvatar === av ? C.accent : C.panel,
                      boxShadow: childAvatar === av ? `3px 4px 0px ${C.ink}` : "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>

              <label style={{ display: "block", fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                Child's Name
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Your child's first name"
                style={{
                  width: "100%", padding: "14px 16px", fontSize: 16, fontFamily: FONT,
                  borderRadius: RADIUS.small, border: `2px solid ${C.ink}20`,
                  background: C.surface, color: C.text, outline: "none",
                  marginBottom: 20, boxSizing: "border-box",
                }}
              />

              <label style={{ display: "block", fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                Age
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {AGE_OPTIONS.map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setChildAge(age)}
                    className={childAge === age ? "toy-block" : ""}
                    style={{
                      padding: "10px 18px",
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily: FONT,
                      borderRadius: RADIUS.small,
                      border: childAge === age ? `3px solid ${C.ink}` : `2px solid ${C.ink}20`,
                      background: childAge === age ? C.accent : C.surface,
                      boxShadow: childAge === age ? `3px 4px 0px ${C.ink}` : "none",
                      color: C.text,
                      cursor: "pointer",
                    }}
                  >
                    {age}
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ fontFamily: FONT, fontSize: 14, color: C.red, marginBottom: 16, textAlign: "center" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="toy-block toy-pressable"
                style={{
                  width: "100%", padding: "16px", fontSize: 18, fontWeight: 700,
                  fontFamily: FONT, color: C.textLight, background: C.primary,
                  borderRadius: RADIUS.button, border: `3px solid ${C.ink}`,
                  boxShadow: `4px 5px 0px ${C.ink}`, cursor: "pointer",
                }}
              >
                Create Account
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    "auth/email-already-in-use": "An account with this email already exists",
    "auth/weak-password": "Password is too weak. Use at least 6 characters",
    "auth/invalid-email": "Invalid email address",
    "auth/too-many-requests": "Too many attempts. Try again later",
    "auth/popup-closed-by-user": "Sign-in was cancelled",
    "auth/popup-blocked": "Pop-up blocked by browser. Allow pop-ups and try again",
  };
  return map[code] || "Something went wrong. Please try again";
}
