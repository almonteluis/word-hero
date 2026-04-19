import { C, FONT, RADIUS } from "../constants";

export default function ModulesScreen({ lang = "en" }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.secondary} 0%, #E0F2FE 50%, ${C.green} 100%)`,
        paddingBottom: 90,
      }}
    >
      <div
        style={{
          maxWidth: 400,
          margin: "0 auto",
          padding: "20px 16px",
          paddingTop: "max(20px, env(safe-area-inset-top))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div
          className="toy-block"
          style={{
            padding: "32px 24px",
            textAlign: "center",
            borderWidth: "3px",
            boxShadow: `4px 6px 0px ${C.ink}`,
          }}
        >
          <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 16 }}>
            🧩
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              marginBottom: 8,
            }}
          >
            Modules Coming Soon!
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: C.muted,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            Structured lessons and challenges are on the way.
            <br />
            Keep training with Flash and Find It for now!
          </div>
        </div>
      </div>
    </div>
  );
}
