import { C, FONT, RADIUS } from "../constants";
import { getHeroStats } from "../utils/progress";
import { cardStyle } from "../utils/styles";

function HeroProfile({ progress, kidName }) {
  const { masteredCount, level, rank, rankIcon } = getHeroStats(progress);

  return (
    <div
      className="toy-block"
      style={{
        ...cardStyle(),
        padding: "20px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 52, marginBottom: 4 }}>{rankIcon}</div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 20,
          color: C.accent,
          fontWeight: 700,
        }}
      >
        {rank}
      </div>
      <div
        style={{
          display: "inline-block",
          background: C.accent,
          color: "white",
          borderRadius: RADIUS.button,
          padding: "3px 14px",
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 600,
          marginTop: 6,
        }}
      >
        Lvl {level}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 13,
          color: C.muted,
          fontWeight: 500,
          marginTop: 4,
        }}
      >
        {kidName}'s Hero Profile
      </div>
    </div>
  );
}

export default HeroProfile;
