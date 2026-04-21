import { C, FONT } from "../constants";

const TABS = [
  { key: "home", icon: "⚡", label: "Home" },
  { key: "dictionary", icon: "📖", label: "Words" },
  { key: "modules", icon: "🧩", label: "Modules" },
  { key: "profile", icon: "👤", label: "Profile" },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: C.surface,
        borderTop: `4px solid ${C.ink}`,
        boxShadow: `0 -4px 0 ${C.ink}`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        WebkitFontSmoothing: "antialiased",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 12px",
              WebkitTapHighlightColor: "transparent",
              transition: "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              ...(isActive ? { transform: "translateY(-2px)" } : {}),
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.9)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = isActive
                ? "translateY(-2px)"
                : "";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = isActive
                ? "translateY(-2px)"
                : "";
            }}
          >
            <div
              style={{
                width: 40,
                height: 36,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                lineHeight: 1,
                transition: "background 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                ...(isActive
                  ? {
                      background: C.accent,
                      border: `3px solid ${C.ink}`,
                      boxShadow: `2px 3px 0 ${C.ink}`,
                    }
                  : {
                      background: "transparent",
                      border: "3px solid transparent",
                      boxShadow: "none",
                    }),
              }}
            >
              {tab.icon}
            </div>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? C.text : C.muted,
                letterSpacing: 0.3,
                transition: "color 0.2s, font-weight 0.2s",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
