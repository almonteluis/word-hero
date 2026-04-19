import { C, FONT, RADIUS, ALL_WORDS } from "../constants";
import { getHeroStats } from "../utils/progress";

function HeroPowerBar({ progress }) {
  const { masteredCount } = getHeroStats(progress);
  const pct = Math.round((masteredCount / ALL_WORDS.length) * 100);

  return (
    <div style={{ width: "100%", maxWidth: 340 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            color: C.text,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Hero Power
        </span>
        <span
          style={{
            color: C.accent,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {masteredCount}/{ALL_WORDS.length}
        </span>
      </div>
      <div
        style={{
          height: 12,
          background: C.surface,
          borderRadius: RADIUS.button,
          overflow: "hidden",
          border: `3px solid ${C.ink}`,
          boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1)`,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${C.accent}, ${C.sun})`,
            borderRadius: RADIUS.button,
            transition: "width 0.6s",
          }}
        />
      </div>
    </div>
  );
}

export default HeroPowerBar;
