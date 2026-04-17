const STAR_DATA = Array.from({ length: 40 }).map((_, i) => ({
  left: (i * 13.7 + 7) % 100,
  top: (i * 17.3 + 11) % 100,
  size: 3 + (i % 4),
  color: [
    "#f6c619",
    "#4a90ff",
    "#e84545",
    "#9b59b6",
    "#2ecc71",
    "#ffffff",
    "#ffb3c6",
  ][i % 7],
  opacity: 0.15 + (i % 6) * 0.05,
  dur: 2 + (i % 3),
  delay: (i * 0.4) % 3,
}));

function HomeBackground() {
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
      {/* Twinkling star dots */}
      {STAR_DATA.map((s, i) => (
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

      {/* ── Top-left: large teal Saturn-style planet ── */}
      <div
        style={{
          position: "absolute",
          left: "-8%",
          top: "1%",
          width: "46vw",
          maxWidth: 190,
          animation: "floatPlanet 7s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <ellipse
            cx="80"
            cy="108"
            rx="76"
            ry="18"
            fill="#4aaac0"
            opacity="0.65"
          />
          <text
            x="80"
            y="116"
            textAnchor="middle"
            fontSize="8.5"
            fill="#0a0e27"
            fontFamily="monospace"
            opacity="0.85"
            letterSpacing="2"
          >
            F M G I S K Z E E A N
          </text>
          <circle cx="80" cy="72" r="54" fill="#5bb8cc" />
          <ellipse
            cx="80"
            cy="66"
            rx="54"
            ry="12"
            fill="#82d8ea"
            opacity="0.55"
          />
          <ellipse
            cx="80"
            cy="82"
            rx="54"
            ry="8"
            fill="#3a98b0"
            opacity="0.4"
          />
          <ellipse
            cx="80"
            cy="108"
            rx="76"
            ry="18"
            fill="none"
            stroke="#82d8ea"
            strokeWidth="7"
            opacity="0.25"
          />
          <circle cx="65" cy="66" r="8.5" fill="white" />
          <circle cx="95" cy="66" r="8.5" fill="white" />
          <circle cx="67" cy="68" r="4" fill="#0a2a44" />
          <circle cx="97" cy="68" r="4" fill="#0a2a44" />
          <circle cx="65.5" cy="66" r="1.5" fill="white" />
          <circle cx="95.5" cy="66" r="1.5" fill="white" />
          <ellipse
            cx="54"
            cy="78"
            rx="9"
            ry="5"
            fill="#ffaac6"
            opacity="0.45"
          />
          <ellipse
            cx="106"
            cy="78"
            rx="9"
            ry="5"
            fill="#ffaac6"
            opacity="0.45"
          />
          <path
            d="M 63 81 Q 80 93 97 81"
            stroke="#0a2a44"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── Shooting star top-center ── */}
      <div
        style={{
          position: "absolute",
          left: "52%",
          top: "7%",
          animation: "shootingStarAnim 4.5s ease-in-out infinite",
          animationDelay: "1.2s",
        }}
      >
        <svg width="68" height="34" viewBox="0 0 68 34">
          <line
            x1="68"
            y1="2"
            x2="8"
            y2="30"
            stroke="#f6c619"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="68" cy="2" r="5" fill="#f6c619" />
        </svg>
      </div>

      {/* ── Top-right: small swirling galaxy ── */}
      <div
        style={{
          position: "absolute",
          right: "3%",
          top: "7%",
          width: "22vw",
          maxWidth: 92,
          animation: "floatPlanet 8s ease-in-out infinite",
          animationDelay: "2.1s",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <ellipse
            cx="50"
            cy="50"
            rx="48"
            ry="22"
            fill="#6b4c9a"
            opacity="0.5"
            transform="rotate(-25,50,50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="18"
            fill="#8b6cba"
            opacity="0.45"
            transform="rotate(60,50,50)"
          />
          <circle cx="50" cy="50" r="23" fill="#c4a0e8" />
          <circle cx="50" cy="50" r="16" fill="#e2d0f8" />
          <circle cx="43" cy="47" r="4.5" fill="white" />
          <circle cx="57" cy="47" r="4.5" fill="white" />
          <circle cx="44.5" cy="48.5" r="2.2" fill="#444" />
          <circle cx="58.5" cy="48.5" r="2.2" fill="#444" />
          <ellipse cx="38" cy="54" rx="5" ry="3" fill="#ffb3c6" opacity="0.5" />
          <ellipse cx="62" cy="54" rx="5" ry="3" fill="#ffb3c6" opacity="0.5" />
          <path
            d="M 43 56 Q 50 62 57 56"
            stroke="#444"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── Right side: striped blue planet ── */}
      <div
        style={{
          position: "absolute",
          right: "-4%",
          top: "33%",
          width: "28vw",
          maxWidth: 112,
          animation: "floatPlanet 6s ease-in-out infinite",
          animationDelay: "0.8s",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="50" r="42" fill="#8ecae6" />
          <ellipse
            cx="50"
            cy="35"
            rx="42"
            ry="7"
            fill="#aaddf0"
            opacity="0.65"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="6"
            fill="#70b8d8"
            opacity="0.5"
          />
          <ellipse
            cx="50"
            cy="64"
            rx="42"
            ry="7"
            fill="#aaddf0"
            opacity="0.6"
          />
          <circle cx="40" cy="46" r="6.5" fill="white" />
          <circle cx="60" cy="46" r="6.5" fill="white" />
          <circle cx="41.5" cy="47.5" r="3" fill="#0a2a44" />
          <circle cx="61.5" cy="47.5" r="3" fill="#0a2a44" />
          <ellipse
            cx="33"
            cy="54"
            rx="7"
            ry="4"
            fill="#ffaac6"
            opacity="0.45"
          />
          <ellipse
            cx="67"
            cy="54"
            rx="7"
            ry="4"
            fill="#ffaac6"
            opacity="0.45"
          />
          <path
            d="M 40 56 Q 50 65 60 56"
            stroke="#0a2a44"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── Shooting star lower-left ── */}
      <div
        style={{
          position: "absolute",
          left: "18%",
          top: "72%",
          animation: "shootingStarAnim 5s ease-in-out infinite",
          animationDelay: "0.4s",
        }}
      >
        <svg width="58" height="28" viewBox="0 0 58 28">
          <line
            x1="58"
            y1="2"
            x2="6"
            y2="24"
            stroke="#f6c619"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="58" cy="2" r="4" fill="#f6c619" />
        </svg>
      </div>

      {/* ── Bottom-left: teal planet with letter ring ── */}
      <div
        style={{
          position: "absolute",
          left: "-7%",
          bottom: "4%",
          width: "42vw",
          maxWidth: 168,
          animation: "floatPlanet 7.5s ease-in-out infinite",
          animationDelay: "3.2s",
        }}
      >
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          <ellipse
            cx="80"
            cy="108"
            rx="74"
            ry="17"
            fill="#4aaac0"
            opacity="0.65"
          />
          <text
            x="80"
            y="116"
            textAnchor="middle"
            fontSize="8.5"
            fill="#0a0e27"
            fontFamily="monospace"
            opacity="0.85"
            letterSpacing="2"
          >
            U Z A T E L Y K H G E V
          </text>
          <circle cx="80" cy="72" r="50" fill="#5bb8cc" />
          <ellipse
            cx="80"
            cy="65"
            rx="50"
            ry="11"
            fill="#82d8ea"
            opacity="0.5"
          />
          <ellipse
            cx="80"
            cy="80"
            rx="50"
            ry="8"
            fill="#3a98b0"
            opacity="0.4"
          />
          <ellipse
            cx="80"
            cy="108"
            rx="74"
            ry="17"
            fill="none"
            stroke="#82d8ea"
            strokeWidth="6"
            opacity="0.25"
          />
          <circle cx="66" cy="67" r="8" fill="white" />
          <circle cx="94" cy="67" r="8" fill="white" />
          <circle cx="67.5" cy="69" r="3.8" fill="#0a2a44" />
          <circle cx="95.5" cy="69" r="3.8" fill="#0a2a44" />
          <ellipse
            cx="55"
            cy="78"
            rx="8.5"
            ry="5"
            fill="#ffaac6"
            opacity="0.45"
          />
          <ellipse
            cx="105"
            cy="78"
            rx="8.5"
            ry="5"
            fill="#ffaac6"
            opacity="0.45"
          />
          <path
            d="M 64 81 Q 80 92 96 81"
            stroke="#0a2a44"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── Bottom-right: warm spiral galaxy ── */}
      <div
        style={{
          position: "absolute",
          right: "4%",
          bottom: "7%",
          width: "30vw",
          maxWidth: 118,
          animation: "floatPlanet 9s ease-in-out infinite",
          animationDelay: "4.1s",
        }}
      >
        <svg viewBox="0 0 120 120" width="100%" height="100%">
          <ellipse
            cx="60"
            cy="60"
            rx="58"
            ry="26"
            fill="#3d5a80"
            opacity="0.5"
            transform="rotate(-15,60,60)"
          />
          <ellipse
            cx="60"
            cy="60"
            rx="48"
            ry="22"
            fill="#5a7fa0"
            opacity="0.4"
            transform="rotate(55,60,60)"
          />
          <circle cx="60" cy="60" r="28" fill="#e8d5a0" />
          <circle cx="60" cy="60" r="20" fill="#f5e8c0" />
          <circle cx="51" cy="56" r="5.5" fill="white" />
          <circle cx="69" cy="56" r="5.5" fill="white" />
          <circle cx="52.5" cy="57.5" r="2.5" fill="#555" />
          <circle cx="70.5" cy="57.5" r="2.5" fill="#555" />
          <ellipse
            cx="45"
            cy="64"
            rx="6"
            ry="3.5"
            fill="#ffb3c6"
            opacity="0.5"
          />
          <ellipse
            cx="75"
            cy="64"
            rx="6"
            ry="3.5"
            fill="#ffb3c6"
            opacity="0.5"
          />
          <path
            d="M 51 66 Q 60 73 69 66"
            stroke="#555"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default HomeBackground;
