import { useState, useMemo } from "react";
import { C, FONT, RADIUS, ALL_WORDS } from "../constants";
import { getHeroStats, getWeekActivity } from "../utils/progress";
import { speak } from "../utils/speech";

const DAILY_CHALLENGES = [
  { icon: "⚡", title: "Speed Hero", desc: "Complete Round 3 without a miss", reward: 20, color: C.accent },
  { icon: "🔍", title: "Word Detective", desc: "Find 5 words correctly in a row", reward: 15, color: C.purple },
  { icon: "🎯", title: "Perfect Round", desc: "Flash Training with 100%", reward: 25, color: C.green },
];

function ModeSelectScreen({ kid, progress, onSelectMode, challenge, onStartChallenge }) {
  const [transitioning, setTransitioning] = useState(null);

  const stats = useMemo(() => getHeroStats(progress), [progress]);
  const week = useMemo(() => getWeekActivity(progress), [progress]);

  const dayIndex = new Date().getDate();
  const wordOfDay = ALL_WORDS[dayIndex % ALL_WORDS.length];
  const dailyChallenge = DAILY_CHALLENGES[dayIndex % DAILY_CHALLENGES.length];

  const handleSelect = (key) => {
    if (transitioning) return;
    setTransitioning(key);
    setTimeout(() => onSelectMode(key), 400);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9F0", paddingBottom: 90, WebkitFontSmoothing: "antialiased" }}>
      <div
        style={{
          background: "linear-gradient(180deg, #FFF5E4 0%, #FFF9F0 100%)",
          padding: "max(24px, env(safe-area-inset-top)) 14px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 420,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <WeekStrip week={week} />

        {/* Hero + inline stats as one wide card */}
        <HeroStatsCard kid={kid} stats={stats} />

        <WordOfDay word={wordOfDay} />

        {challenge && (
          <SharedChallengeCard
            challenge={challenge}
            onStart={() => onStartChallenge?.(challenge.mode)}
          />
        )}

        <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.text, animation: "fadeRise 0.4s ease-out 0.28s both" }}>
          🎮 Start Training
        </div>
        <ModeCardPair onSelect={handleSelect} transitioning={transitioning} />

        <DailyChallenge challenge={dailyChallenge} />
      </div>
    </div>
  );
}

function WeekStrip({ week }) {
  return (
    <div
      className="toy-block"
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 3,
        padding: "9px 7px",
        borderWidth: 3,
        boxShadow: `3px 4px 0 ${C.ink}`,
        background: C.surface,
        animation: "fadeRise 0.4s ease-out both",
      }}
    >
      {week.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ fontFamily: FONT, fontSize: 8, color: C.muted, fontWeight: 600 }}>{d.label}</div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: d.isToday ? C.accent : d.done ? C.green : "transparent",
              border: d.isToday
                ? `3px solid ${C.ink}`
                : d.done
                  ? `2px solid ${C.ink}`
                  : `2px solid ${C.muted}55`,
              boxShadow: d.isToday ? `2px 2px 0 ${C.ink}` : "none",
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 700,
              color: C.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {d.done && !d.isToday ? "✓" : d.date}
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroStatsCard({ kid, stats }) {
  const inlineStats = [
    { value: String(stats.masteredCount), emoji: "🔥", label: "Streak" },
    { value: String(stats.masteredCount), label: "Mastered", bg: C.green },
    { value: `${stats.accuracy}%`, label: "Accuracy", bg: C.purple },
  ];

  return (
    <div
      className="toy-block"
      style={{
        background: C.surface,
        borderWidth: 3,
        overflow: "hidden",
        animation: "fadeRise 0.4s ease-out 0.06s both",
      }}
    >
      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: C.panel,
              border: `4px solid ${C.ink}`,
              boxShadow: `3px 3px 0 ${C.ink}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            {kid.avatar}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -4,
              right: -6,
              background: C.accent,
              border: `2px solid ${C.ink}`,
              borderRadius: 50,
              padding: "1px 6px",
              fontFamily: FONT,
              fontSize: 9,
              fontWeight: 700,
              color: C.ink,
            }}
          >
            Lvl {stats.level}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.primary, letterSpacing: 0.4 }}>
            {stats.rankIcon} {stats.rank.toUpperCase()}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: C.text }}>{kid.name}</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {inlineStats.map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: "center",
                background: s.bg || "transparent",
                borderRadius: 10,
                padding: s.bg ? "6px 8px" : "0 4px",
                border: s.bg ? `2px solid ${C.ink}` : "none",
              }}
            >
              <div style={{ fontFamily: FONT, fontSize: s.emoji ? 18 : 14, fontWeight: 700, color: C.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {s.emoji || s.value}
              </div>
              {s.emoji && (
                <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {s.value}
                </div>
              )}
              <div style={{ fontFamily: FONT, fontSize: 8, color: C.muted, fontWeight: 600, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WordOfDay({ word }) {
  const handleSpeak = () => speak(word);
  return (
    <div
      className="toy-block"
      style={{
        background: `linear-gradient(120deg, ${C.secondary} 0%, ${C.purple} 100%)`,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderWidth: 3,
        animation: "fadeRise 0.4s ease-out 0.14s both",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: C.ink, opacity: 0.6, letterSpacing: 0.5 }}>
          ✨ WORD OF THE DAY
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 40,
            fontWeight: 700,
            color: C.ink,
            letterSpacing: 1,
            animation: "wordPop 0.5s ease-out 0.3s both",
          }}
        >
          {word}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 11, color: `${C.ink}80`, fontWeight: 500 }}>
          Tap the 🔊 to hear it!
        </div>
      </div>
      <button
        className="toy-pressable"
        onClick={handleSpeak}
        aria-label={`Hear ${word}`}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: C.accent,
          border: `3px solid ${C.ink}`,
          boxShadow: `3px 4px 0 ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        🔊
      </button>
    </div>
  );
}

function ModeCardPair({ onSelect, transitioning }) {
  const modes = [
    { key: "flash", icon: "⚡", label: "Flash Training", desc: "Learn your words", bg: C.accent },
    { key: "find", icon: "🔍", label: "Find It", desc: "Word recognition", bg: C.purple },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {modes.map((m, i) => {
        const isActive = transitioning === m.key;
        return (
          <button
            key={m.key}
            className="toy-block toy-pressable"
            onClick={() => onSelect(m.key)}
            style={{
              background: m.bg,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              width: "100%",
              animation: isActive
                ? "portalExpand 0.4s ease-in forwards"
                : `fadeRise 0.4s ease-out ${0.32 + i * 0.06}s both`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: C.surface,
                border: `3px solid ${C.ink}`,
                boxShadow: `2px 3px 0 ${C.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.ink }}>{m.label}</div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: `${C.ink}80`, fontWeight: 500, marginTop: 2 }}>
                {m.desc}
              </div>
            </div>
            <div style={{ color: C.ink, fontSize: 22, fontWeight: 700, flexShrink: 0 }}>→</div>
          </button>
        );
      })}
    </div>
  );
}

function DailyChallenge({ challenge }) {
  return (
    <div
      className="toy-block toy-pressable"
      style={{
        background: challenge.color,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderWidth: 3,
        cursor: "pointer",
        animation: "fadeRise 0.4s ease-out 0.44s both",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 10,
          background: C.surface,
          border: `3px solid ${C.ink}`,
          boxShadow: `2px 3px 0 ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {challenge.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.ink }}>{challenge.title}</div>
          <div
            style={{
              background: C.heart,
              color: "white",
              borderRadius: 50,
              padding: "1px 7px",
              fontSize: 9,
              fontWeight: 700,
              border: `2px solid ${C.ink}`,
              whiteSpace: "nowrap",
            }}
          >
            NEW
          </div>
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 10,
            color: `${C.ink}80`,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {challenge.desc}
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.ink, fontVariantNumeric: "tabular-nums" }}>+{challenge.reward}</div>
        <div style={{ fontFamily: FONT, fontSize: 8, fontWeight: 700, color: `${C.ink}70` }}>🪙</div>
      </div>
    </div>
  );
}

function SharedChallengeCard({ challenge, onStart }) {
  return (
    <div
      className="toy-block"
      style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
        padding: "14px 16px",
        borderWidth: 3,
        animation: "fadeRise 0.4s ease-out 0.22s both",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 9,
          fontWeight: 700,
          color: `${C.ink}bb`,
          letterSpacing: 0.8,
          marginBottom: 6,
        }}
      >
        📣 FRIEND CHALLENGE
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 700,
          color: C.ink,
          marginBottom: 4,
        }}
      >
        Beat {challenge.score}/{challenge.total} in {challenge.modeLabel}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 500,
          color: `${C.ink}cc`,
          lineHeight: 1.5,
        }}
      >
        A family shared their score with you. Jump in and see if your hero can top {challenge.pct}%.
      </div>

      <button
        className="toy-block toy-pressable"
        onClick={onStart}
        style={{
          marginTop: 12,
          background: C.surface,
          color: C.ink,
          padding: "10px 14px",
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Take {challenge.modeLabel} Challenge →
      </button>
    </div>
  );
}

export default ModeSelectScreen;
