import { useState, useEffect } from "react";
import { C, FONT } from "../constants";

function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          onExpire();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining <= 0]);

  const pct = (remaining / seconds) * 100;
  const color = remaining <= 3 ? C.red : remaining <= 5 ? C.accent : C.blue;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 120,
          height: 8,
          background: C.panel,
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${color}30`,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 8,
            transition: "width 1s linear, background 0.3s",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: FONT,
          fontSize: 16,
          color,
          minWidth: 28,
          textAlign: "center",
        }}
      >
        {remaining}s
      </span>
    </div>
  );
}

export default CountdownTimer;
