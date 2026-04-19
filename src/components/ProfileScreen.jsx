import { useRef, useState } from "react";
import { C, FONT, RADIUS, getWordBank, SUPPORTED_LANGS, LANG_LABELS } from "../constants";
import {
  getHeroStats,
  getRankProgress,
  getWeekActivity,
  getCompletionEstimate,
} from "../utils/progress";
import DailyReminderSettings from "./DailyReminderSettings";
import BottomSheet from "./BottomSheet";
import GroupedWordList from "./profile/GroupedWordList";
import ActivitySheet from "./profile/ActivitySheet";
import WordDetailModal from "./profile/WordDetailModal";

export default function ProfileScreen({ kid, progress, dispatch, onSwitchProfile, onPracticeWord, lang = "en", onLangChange }) {
  const { masteredCount, learningCount, level, rank, rankIcon } = getHeroStats(progress);
  const { pct } = getRankProgress(progress);
  const week = getWeekActivity(progress);
  const completion = getCompletionEstimate(progress);
  const settingsRef = useRef(null);

  const [sheet, setSheet] = useState(null); // "mastered" | "learning" | "activity" | null
  const [selectedWord, setSelectedWord] = useState(null);

  const scrollToSettings = () =>
    settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const masteredWords = Object.keys(progress.mastered || {});
  const learningWords = Object.keys(progress.learning || {});

  const handlePractice = (word) => {
    setSelectedWord(null);
    setSheet(null);
    onPracticeWord?.(word);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.secondary} 0%, #E0F2FE 45%, ${C.bg} 100%)`,
        paddingBottom: 90,
      }}
    >
      <div
        style={{
          maxWidth: 400,
          margin: "0 auto",
          padding: "20px 16px",
          paddingTop: "max(20px, env(safe-area-inset-top))",
        }}
      >
        <Header onSettings={scrollToSettings} />
        <WeekdayStrip week={week} />
        <IdentityCard kid={kid} rank={rank} rankIcon={rankIcon} level={level} />
        <ProgressCard pct={pct} rank={rank} completion={completion} />
        <CardsCollected
          mastered={masteredCount}
          learning={learningCount}
          sessions={progress.sessions || 0}
          onOpen={setSheet}
        />

        <div
          ref={settingsRef}
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: C.text,
            fontWeight: 700,
            marginBottom: 8,
            marginTop: 4,
          }}
        >
          ⚙️ Settings
        </div>
        <DailyReminderSettings />

        {/* Language toggle */}
        {onLangChange && (
          <div
            className="toy-block"
            style={{
              marginTop: 10,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: "3px",
              boxShadow: `3px 4px 0px ${C.ink}`,
            }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
              }}
            >
              🌐 Language / Idioma
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {SUPPORTED_LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  className={l === lang ? "" : "toy-pressable"}
                  style={{
                    padding: "6px 14px",
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: RADIUS.button,
                    border: l === lang ? `3px solid ${C.ink}` : `2px solid ${C.ink}30`,
                    background: l === lang ? C.accent : C.surface,
                    color: l === lang ? "white" : C.text,
                    boxShadow: l === lang ? `2px 3px 0px ${C.ink}` : "none",
                    cursor: "pointer",
                  }}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className="toy-block toy-pressable"
          onClick={onSwitchProfile}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginTop: 16,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            color: C.text,
            background: C.surface,
            borderWidth: 3,
            boxShadow: `3px 4px 0 ${C.ink}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          🔄 Switch Profile
        </button>
      </div>

      <BottomSheet
        open={sheet === "mastered"}
        onClose={() => setSheet(null)}
        title={`Mastered · ${masteredCount}`}
      >
        <GroupedWordList
          words={masteredWords}
          progress={progress}
          variant="mastered"
          onWordTap={setSelectedWord}
          emptyMessage="No words mastered yet. Keep practicing!"
        />
      </BottomSheet>

      <BottomSheet
        open={sheet === "learning"}
        onClose={() => setSheet(null)}
        title={`Learning · ${learningCount}`}
      >
        <GroupedWordList
          words={learningWords}
          progress={progress}
          variant="learning"
          onWordTap={setSelectedWord}
          emptyMessage="Nothing in progress. Start a round to begin!"
        />
      </BottomSheet>

      <BottomSheet
        open={sheet === "activity"}
        onClose={() => setSheet(null)}
        title="Activity"
      >
        <ActivitySheet progress={progress} />
      </BottomSheet>

      <WordDetailModal
        word={selectedWord}
        progress={progress}
        onClose={() => setSelectedWord(null)}
        onPractice={handlePractice}
      />
    </div>
  );
}

function Header({ onSettings }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 700,
          color: C.text,
          letterSpacing: -0.5,
        }}
      >
        Profile
      </div>
      <button
        onClick={onSettings}
        aria-label="Go to settings"
        className="toy-pressable"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: C.surface,
          border: `3px solid ${C.ink}`,
          boxShadow: `2px 3px 0 ${C.ink}`,
          cursor: "pointer",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⚙️
      </button>
    </div>
  );
}

function WeekdayStrip({ week }) {
  return (
    <div
      className="toy-block"
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 4,
        padding: "10px 8px",
        marginBottom: 16,
        borderWidth: 3,
        boxShadow: `3px 4px 0 ${C.ink}`,
        background: C.surface,
      }}
    >
      {week.map((d, i) => {
        const active = d.isToday;
        const bg = active ? C.accent : d.done ? C.green : "transparent";
        const border = active
          ? `3px solid ${C.ink}`
          : d.done
            ? `2px solid ${C.ink}`
            : `2px solid ${C.muted}55`;
        const textColor = d.isFuture ? C.muted : C.ink;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 10,
                color: C.muted,
                fontWeight: 600,
              }}
            >
              {d.label}
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: bg,
                border,
                boxShadow: active ? `2px 2px 0 ${C.ink}` : "none",
                color: textColor,
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {d.done && !active ? "✓" : d.date}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IdentityCard({ kid, rank, rankIcon, level }) {
  return (
    <div
      className="toy-block"
      style={{
        padding: 16,
        marginBottom: 16,
        borderWidth: 3,
        boxShadow: `4px 6px 0 ${C.ink}`,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: C.panel,
          border: `4px solid ${C.ink}`,
          boxShadow: `3px 3px 0 ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          flexShrink: 0,
        }}
      >
        {kid.avatar}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 18,
            fontWeight: 700,
            color: C.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {kid.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 6,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 14 }}>{rankIcon}</span>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: C.primary,
              fontWeight: 700,
            }}
          >
            {rank}
          </span>
          <span
            style={{
              background: C.accent,
              color: C.ink,
              borderRadius: RADIUS.pill,
              padding: "2px 8px",
              fontFamily: FONT,
              fontSize: 10,
              fontWeight: 700,
              border: `2px solid ${C.ink}`,
            }}
          >
            Lvl {level}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ pct, rank, completion }) {
  return (
    <div
      className="toy-block"
      style={{
        padding: "18px 16px 20px",
        marginBottom: 18,
        borderWidth: 3,
        boxShadow: `4px 6px 0 ${C.ink}`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 700,
          color: C.text,
          textAlign: "left",
          marginBottom: 10,
        }}
      >
        Progress
      </div>
      <ProgressRing pct={pct} rank={rank} />
      <div
        style={{
          marginTop: 18,
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 700,
          color: C.text,
          letterSpacing: 1.2,
        }}
      >
        {completion.label}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 11,
          color: C.muted,
          fontWeight: 600,
          marginTop: 2,
        }}
      >
        {completion.hasDate ? "Expected Completion Date" : "Earn mastery to unlock estimate"}
      </div>
    </div>
  );
}

function ProgressRing({ pct, rank }) {
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={C.panel}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={C.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: "stroke-dasharray 0.6s" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 11,
            color: C.muted,
            fontWeight: 600,
          }}
        >
          You've completed
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 44,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1,
          }}
        >
          {pct}
          <span style={{ fontSize: 22 }}>%</span>
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 10,
            color: C.muted,
            fontWeight: 600,
            letterSpacing: 0.5,
            textAlign: "center",
            padding: "0 16px",
          }}
        >
          of {rank.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function CardsCollected({ mastered, learning, sessions, onOpen }) {
  const items = [
    { key: "mastered", label: "MASTERED", value: mastered, bg: C.green },
    { key: "learning", label: "LEARNING", value: learning, bg: C.accent },
    { key: "activity", label: "SESSIONS", value: sessions, bg: C.secondary },
  ];
  return (
    <>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          marginBottom: 10,
        }}
      >
        Cards Collected
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {items.map((s) => (
          <button
            key={s.key}
            onClick={() => onOpen(s.key)}
            aria-label={`Open ${s.label.toLowerCase()} details`}
            className="toy-block toy-pressable"
            style={{
              padding: "14px 8px",
              textAlign: "center",
              borderWidth: 3,
              boxShadow: `3px 4px 0 ${C.ink}`,
              background: s.bg,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 30,
                fontWeight: 700,
                color: C.ink,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 10,
                fontWeight: 700,
                color: C.ink,
                marginTop: 6,
                letterSpacing: 0.8,
              }}
            >
              {s.label}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
