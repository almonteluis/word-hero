import { C } from "../constants";

const StarField = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
    }}
  >
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: 4 + Math.random() * 4,
          height: 4 + Math.random() * 4,
          background: [C.accent, C.blue, C.red, C.purple, C.green][i % 5],
          borderRadius: "50%",
          opacity: 0.15 + Math.random() * 0.3,
          animation: `starPulse ${2 + Math.random() * 3}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
        }}
      />
    ))}
  </div>
);

export default StarField;
