import { C, FONT } from "../constants";

const PARTICLE_DATA = Array.from({ length: 20 }).map((_, i) => ({
  left: (i * 17.3 + 11) % 100,
  top: (i * 13.7 + 7) % 100,
  size: 4 + (i % 3) * 2,
  color: [
    C.accent,
    C.secondary,
    C.heart,
    C.purple,
    C.green,
    C.sun,
  ][i % 6],
  opacity: 0.12 + (i % 4) * 0.06,
  dur: 3 + (i % 3),
  delay: (i * 0.5) % 3,
}));

function StarField() {
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
      {PARTICLE_DATA.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            borderRadius: "50%",
            opacity: s.opacity,
            animation: `starPulse ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default StarField;
