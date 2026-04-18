import { useState, useEffect, useReducer, useRef } from "react";
import { C, FONT, RADIUS } from "./constants";
import {
  loadProfiles,
  saveProfiles,
  loadKidProgress,
  saveKidProgress,
  loadNotificationPrefs,
  saveNotificationPrefs,
} from "./utils/storage";
import { initProgress, progressReducer } from "./utils/progress";
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
  const [modeKey, setModeKey] = useState(0);
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
            color: C.text,
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 700,
            animation: "starPulse 1.5s ease-in-out infinite",
          }}
        >
          Loading...
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
  ];

  // Mode selection screen has its own full layout
  if (mode === "menu") {
    return (
      <ModeSelectScreen
        kid={activeKid}
        progress={progress}
        onSelectMode={(m) => { setMode(m); setModeKey((k) => k + 1); }}
        onBack={() => setActiveKid(null)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.secondary} 0%, #E0F2FE 50%, ${C.green} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Playful Floating Background Shapes */}
      <div style={{ position: "absolute", top: "5%", left: "10%", width: 120, height: 120, background: C.primary, borderRadius: "40% 60% 70% 30%", opacity: 0.15, animation: "floatBlob 8s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "25%", right: "-5%", width: 200, height: 200, background: C.secondary, borderRadius: "60% 40% 30% 70%", opacity: 0.15, animation: "floatBlobRev 12s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "-10%", width: 180, height: 160, background: C.accent, borderRadius: "50% 50% 50% 50%", opacity: 0.15, animation: "floatBlob 10s ease-in-out infinite", pointerEvents: "none" }} />

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
          className="toy-block toy-pressable"
          onClick={() => {
            setActiveKid(null);
          }}
          style={{
            padding: "8px 16px",
            color: C.text,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            background: C.surface,
            borderWidth: "3px", // slightly thinner for small header button
            boxShadow: `3px 4px 0px ${C.ink}`,
            borderRadius: "16px",
          }}
        >
          ← Switch
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 20,
              fontFamily: FONT,
              color: C.text,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Word Hero
          </div>
        </div>

        <div
          className="toy-block"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: C.surface,
            padding: "4px 14px 4px 8px",
            borderWidth: "3px",
            boxShadow: `3px 4px 0px ${C.ink}`,
            borderRadius: "100px",
          }}
        >
          <span style={{ fontSize: 24, transform: "translateY(1px)" }}>{activeKid.avatar}</span>
          <span
            style={{
              fontFamily: FONT,
              color: C.text,
              fontSize: 14,
              fontWeight: 700,
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
            className="toy-block toy-pressable"
            onClick={() => { setMode(m.key); setModeKey((k) => k + 1); }}
            style={{
              background: mode === m.key ? C.accent : C.surface,
              color: C.text,
              padding: "10px 20px",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: FONT,
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      )}

      {/* Content */}
      <div
        key={modeKey}
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 600,
          margin: "0 auto",
          animation: "modeEnter 0.4s ease-out",
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
          className="toy-pressable"
          onClick={() => {
            if (confirm(`Reset ${activeKid.name}'s progress?`))
              dispatch({ type: "RESET" });
          }}
          style={{
            background: "transparent",
            border: `3px solid ${C.ink}40`,
            color: `${C.ink}80`,
            borderRadius: RADIUS.button,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: FONT,
          }}
        >
          Reset Progress
        </button>
      </div>

      <GlobalStyles />
    </div>
  );
}
