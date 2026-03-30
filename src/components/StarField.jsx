import { memo, useMemo } from "react";
import { C } from "../constants";

const STAR_COUNT = 30;
const PALETTE = [C.accent, C.blue, C.red, C.purple, C.green];

function makeStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 4 + Math.random() * 4,
    color: PALETTE[i % PALETTE.length],
    opacity: 0.15 + Math.random() * 0.3,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 3,
  }));
}

export const StarField = memo(function StarField() {
  const stars = useMemo(makeStars, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            borderRadius: "50%",
            opacity: s.opacity,
            animation: `starPulse ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
});
