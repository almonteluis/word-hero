import { C, FONT, RADIUS } from "../../constants";

export default function ProfileScreen({ user, children, onLogout, onBack }) {
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
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            marginBottom: 24,
          }}
        >
          Profile
        </h1>

        {/* User card */}
        <div
          className="toy-block"
          style={{
            background: C.surface,
            borderRadius: RADIUS.card,
            border: `3px solid ${C.ink}`,
            boxShadow: `4px 5px 0px ${C.ink}`,
            padding: 24,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>🦸</div>
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: C.text }}>
            {user?.name || "Parent Name"}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: C.muted, marginTop: 4 }}>
            {user?.email || "parent@example.com"}
          </div>
        </div>

        {/* Children */}
        <div
          className="toy-block"
          style={{
            background: C.surface,
            borderRadius: RADIUS.card,
            border: `3px solid ${C.ink}`,
            boxShadow: `4px 5px 0px ${C.ink}`,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>
            Heroes ({children?.length || 0})
          </div>

          {children && children.length > 0 ? (
            children.map((child, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderTop: i > 0 ? `2px solid ${C.panel}` : "none",
                }}
              >
                <span style={{ fontSize: 28 }}>{child.avatar}</span>
                <div>
                  <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.text }}>
                    {child.name}
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: C.muted }}>
                    Age {child.age}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontFamily: FONT, fontSize: 14, color: C.muted, textAlign: "center", padding: "12px 0" }}>
              No heroes yet
            </div>
          )}

          <button
            className="toy-pressable"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FONT,
              color: C.text,
              background: C.panel,
              borderRadius: RADIUS.small,
              border: `2px solid ${C.ink}15`,
              cursor: "pointer",
              marginTop: 12,
            }}
          >
            + Add another hero
          </button>
        </div>

        {/* Placeholder settings */}
        <div
          className="toy-block"
          style={{
            background: C.surface,
            borderRadius: RADIUS.card,
            border: `3px solid ${C.ink}`,
            boxShadow: `4px 5px 0px ${C.ink}`,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12 }}>
            Settings
          </div>
          {["Notifications", "Sound Effects", "Dark Mode", "Subscription"].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderTop: `1px solid ${C.panel}`,
                fontFamily: FONT,
                fontSize: 15,
                color: C.text,
              }}
            >
              {item}
              <span style={{ color: C.muted, fontSize: 13 }}>Coming soon</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          className="toy-block toy-pressable"
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: FONT,
            color: C.textLight,
            background: C.red,
            borderRadius: RADIUS.button,
            border: `3px solid ${C.ink}`,
            boxShadow: `4px 5px 0px ${C.ink}`,
            cursor: "pointer",
            marginBottom: 40,
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
