import { useState, useEffect, useReducer, useRef, useCallback, Suspense, lazy } from "react";
import { C } from "./constants";
import {
  loadProfiles,
  saveProfiles,
  loadKidProgress,
  saveKidProgress,
  removeKidProgress,
  initProgress,
  progressReducer,
} from "./utils";
import { StarField } from "./components/StarField";
import { KidSelector } from "./components/KidSelector";

const FlashcardMode = lazy(() => import("./components/FlashcardMode"));
const FindItGame = lazy(() => import("./components/FindItGame"));
const ProgressTracker = lazy(() => import("./components/ProgressTracker"));

const MODES = [
  { key: "flash", label: "FLASH", icon: "⚡" },
  { key: "find", label: "FIND IT", icon: "🔍" },
  { key: "stats", label: "STATS", icon: "🛡️" },
];

function ModeFallback() {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div
        style={{
          color: C.accent,
          fontFamily: "'Russo One', sans-serif",
          fontSize: 18,
          letterSpacing: 3,
          animation: "starPulse 1.2s ease-in-out infinite",
        }}
      >
        ⚡ LOADING... ⚡
      </div>
    </div>
  );
}

export default function WordHeroApp() {
  const [profiles, setProfiles] = useState(null);
  const [activeKid, setActiveKid] = useState(null);
  const [mode, setMode] = useState("flash");
  const [findItGroup, setFindItGroup] = useState(0);
  const [progress, dispatch] = useReducer(progressReducer, null, initProgress);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    const p = loadProfiles();
    setProfiles(p || []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!activeKid) return;
    const p = loadKidProgress(activeKid.id);
    dispatch({ type: "LOAD", data: p });
    dispatch({ type: "NEW_SESSION" });
  }, [activeKid]);

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

  const addKid = useCallback((kid) => {
    setProfiles((prev) => {
      const next = [...(prev || []), kid];
      saveProfiles(next);
      return next;
    });
  }, []);

  const deleteKid = useCallback((id) => {
    setProfiles((prev) => {
      const next = prev.filter((k) => k.id !== id);
      saveProfiles(next);
      return next;
    });
    removeKidProgress(id);
  }, []);

  const selectKid = useCallback((kid) => {
    setActiveKid(kid);
    setMode("flash");
  }, []);

  const goBack = useCallback(() => {
    setActiveKid(null);
  }, []);

  const advanceToFindIt = useCallback((g) => {
    setFindItGroup(g);
    setMode("find");
  }, []);

  const resetProgress = useCallback(() => {
    if (activeKid && confirm(`Reset ${activeKid.name}'s progress?`)) {
      dispatch({ type: "RESET" });
    }
  }, [activeKid]);

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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Russo+One&family=Nunito:wght@700;800;900&display=swap"
        rel="stylesheet"
      />
      <StarField />

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
          onClick={goBack}
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
        {MODES.map((m) => (
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

      <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
        <Suspense fallback={<ModeFallback />}>
          {mode === "flash" && (
            <FlashcardMode
              progress={progress}
              dispatch={dispatch}
              onAdvanceToFindIt={advanceToFindIt}
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
        </Suspense>
      </div>

      <div style={{ textAlign: "center", padding: "16px 0 40px", position: "relative", zIndex: 1 }}>
        <button
          onClick={resetProgress}
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

      <style>{`
        @keyframes starPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes cardEnter {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes swooshRight {
          to { opacity: 0; transform: translateX(200px) rotate(10deg); }
        }
        @keyframes swooshLeft {
          to { opacity: 0; transform: translateX(-200px) rotate(-10deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes correctPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:active { transform: scale(0.96) !important; }
        input::placeholder { color: ${C.muted}80; }
      `}</style>
    </div>
  );
}
