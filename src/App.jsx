import { useState, useEffect, useReducer, useRef } from "react";
import { C } from "./constants";
import {
  loadProfiles,
  saveProfiles,
  loadKidProgress,
  saveKidProgress,
  loadNotificationPrefs,
  saveNotificationPrefs,
} from "./utils/storage";
import { initProgress, progressReducer } from "./utils/progress";
import StarField from "./components/StarField";
import ProgressTracker from "./components/ProgressTracker";
import KidSelector from "./components/KidSelector";
import ModeSelectScreen from "./components/ModeSelectScreen";
import FindItGame from "./components/FindItGame";
import FlashcardMode from "./components/FlashcardMode";
import GlobalStyles from "./styles/animations.jsx";

// ─── MAIN APP ──────────────────────────────────────────────
export default function WordHeroApp() {
  const [profiles, setProfiles] = useState(null);
  const [activeKid, setActiveKid] = useState(null);
  const [mode, setMode] = useState("menu");
  const [findItGroup, setFindItGroup] = useState(0);
  const [progress, dispatch] = useReducer(progressReducer, null, initProgress);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  // Load profiles on mount
  useEffect(() => {
    const p = loadProfiles();
    setProfiles(p || []);
    setLoaded(true);
  }, []);

  // Check and fire daily reminder notification on app open
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;
    const prefs = loadNotificationPrefs();
    if (!prefs.enabled) return;
    const today = new Date().toDateString();
    if (prefs.lastSentDate === today) return;
    const [h, m] = prefs.time.split(":").map(Number);
    const now = new Date();
    if (now.getHours() < h || (now.getHours() === h && now.getMinutes() < m))
      return;
    new Notification("⚡ Word Hero Daily Challenge!", {
      body: "Time to train! Your daily sight words are ready. Keep your hero power up!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
    saveNotificationPrefs({ ...prefs, lastSentDate: today });
  }, []);

  // Load kid progress when selected
  useEffect(() => {
    if (!activeKid) return;
    const p = loadKidProgress(activeKid.id);
    dispatch({ type: "LOAD", data: p });
    dispatch({ type: "NEW_SESSION" });
    // Check for 7-day mastery decay after loading
    setTimeout(() => dispatch({ type: "CHECK_REVIEW_DECAY" }), 100);
  }, [activeKid]);

  // Auto-save progress on changes (debounced)
  useEffect(() => {
    if (!activeKid) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveKidProgress(activeKid.id, progress);
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [progress, activeKid]);

  const addKid = (kid) => {
    const next = [...(profiles || []), kid];
    setProfiles(next);
    saveProfiles(next);
  };

  const deleteKid = (id) => {
    const next = profiles.filter((k) => k.id !== id);
    setProfiles(next);
    saveProfiles(next);
    try {
      localStorage.removeItem(`word-hero-progress-${id}`);
    } catch {}
  };

  const selectKid = (kid) => {
    setActiveKid(kid);
    setMode("menu");
  };

  if (!loaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: C.accent,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 24,
            letterSpacing: 4,
            animation: "starPulse 1.5s ease-in-out infinite",
          }}
        >
          ⚡ LOADING... ⚡
        </div>
      </div>
    );
  }

  if (!activeKid) {
    return (
      <KidSelector
        profiles={profiles}
        onSelect={selectKid}
        onAdd={addKid}
        onDelete={deleteKid}
      />
    );
  }

  const modes = [
    { key: "flash", label: "FLASH", icon: "⚡" },
    { key: "find", label: "FIND IT", icon: "🔍" },
    { key: "stats", label: "STATS", icon: "🛡️" },
  ];

  // Mode selection screen has its own full layout
  if (mode === "menu") {
    return (
      <ModeSelectScreen
        kid={activeKid}
        progress={progress}
        onSelectMode={(m) => setMode(m)}
        onBack={() => setActiveKid(null)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Russo+One&family=Nunito:wght@700;800;900&display=swap"
        rel="stylesheet"
      />
      <StarField />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          onClick={() => {
            setActiveKid(null);
          }}
          style={{
            background: C.panel,
            border: `1px solid ${C.muted}30`,
            borderRadius: 10,
            padding: "6px 12px",
            cursor: "pointer",
            color: C.muted,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          ← SWITCH
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 22,
              fontFamily: "'Russo One', sans-serif",
              color: C.accent,
              letterSpacing: 4,
              textShadow: `0 0 15px ${C.accent}40, 1px 1px 0 ${C.red}`,
            }}
          >
            ⚡ WORD HERO ⚡
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: C.panel,
            borderRadius: 10,
            padding: "4px 10px",
            border: `1px solid ${C.accent}20`,
          }}
        >
          <span style={{ fontSize: 20 }}>{activeKid.avatar}</span>
          <span
            style={{
              fontFamily: "'Russo One', sans-serif",
              color: C.text,
              fontSize: 13,
              letterSpacing: 1,
            }}
          >
            {activeKid.name}
          </span>
        </div>
      </div>

      {/* Mode tabs */}
      {mode !== "menu" && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          padding: "8px 16px 4px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            style={{
              background:
                mode === m.key
                  ? `linear-gradient(135deg, ${C.accent}, ${C.red})`
                  : C.panel,
              color: mode === m.key ? C.bg : C.muted,
              border: `2px solid ${mode === m.key ? C.accent : "transparent"}`,
              borderRadius: 12,
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 12,
              fontFamily: "'Russo One', sans-serif",
              letterSpacing: 2,
              transition: "all 0.2s",
              boxShadow: mode === m.key ? `0 4px 12px ${C.accent}35` : "none",
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        {mode === "flash" && (
          <FlashcardMode
            progress={progress}
            dispatch={dispatch}
            onAdvanceToFindIt={(g) => {
              setFindItGroup(g);
              setMode("find");
            }}
          />
        )}
        {mode === "find" && (
          <FindItGame
            progress={progress}
            dispatch={dispatch}
            initialGroup={findItGroup}
          />
        )}
        {mode === "stats" && (
          <ProgressTracker progress={progress} kidName={activeKid.name} />
        )}
      </div>

      {/* Reset */}
      <div
        style={{
          textAlign: "center",
          padding: "16px 0 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          onClick={() => {
            if (confirm(`Reset ${activeKid.name}'s progress?`))
              dispatch({ type: "RESET" });
          }}
          style={{
            background: "transparent",
            border: `1px solid ${C.muted}30`,
            color: C.muted,
            borderRadius: 8,
            padding: "5px 14px",
            fontSize: 10,
            cursor: "pointer",
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 2,
          }}
        >
          RESET PROGRESS
        </button>
      </div>

      <GlobalStyles />
    </div>
  );
}
