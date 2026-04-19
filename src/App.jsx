import { useState, useEffect, useReducer, useRef } from "react";
import { C, FONT, RADIUS } from "./constants";
import {
  loadProfiles,
  saveProfiles,
  loadKidProgress,
  saveKidProgress,
  loadNotificationPrefs,
  saveNotificationPrefs,
  loadLang,
  saveLang,
} from "./utils/storage";
import { initProgress, progressReducer } from "./utils/progress";
import {
  loginWithEmail,
  loginWithGoogle,
  createAccount as firebaseCreateAccount,
  logout as firebaseLogout,
  resetPassword,
  onAuthChange,
} from "./utils/firebase";
import KidSelector from "./components/KidSelector";
import ModeSelectScreen from "./components/ModeSelectScreen";
import FindItGame from "./components/FindItGame";
import FlashcardMode from "./components/FlashcardMode";
import BottomNav from "./components/BottomNav";
import DictionaryScreen from "./components/DictionaryScreen";
import ModulesScreen from "./components/ModulesScreen";
import ProfileScreen from "./components/ProfileScreen";
import GlobalStyles from "./styles/animations.jsx";
import WelcomeScreen from "./components/auth/WelcomeScreen";
import LoginScreen from "./components/auth/LoginScreen";
import ForgotPasswordScreen from "./components/auth/ForgotPasswordScreen";
import CreateAccountScreen from "./components/auth/CreateAccountScreen";
import AuthProfileScreen from "./components/auth/ProfileScreen";

// ─── MAIN APP ──────────────────────────────────────────────
export default function WordHeroApp() {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState("welcome");
  const [profiles, setProfiles] = useState(null);
  const [activeKid, setActiveKid] = useState(null);
  const [tab, setTab] = useState("home");
  const [mode, setMode] = useState("menu");
  const [modeKey, setModeKey] = useState(0);
  const [focusedWord, setFocusedWord] = useState(null);
  const [progress, dispatch] = useReducer(progressReducer, null, initProgress);
  const [lang, setLang] = useState("en");
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoaded(true);
    });
    return unsubscribe;
  }, []);

  // Load profiles on mount
  useEffect(() => {
    const p = loadProfiles();
    setProfiles(p || []);
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
    setLang(loadLang(activeKid.id));
    setTimeout(() => dispatch({ type: "CHECK_REVIEW_DECAY" }), 100);
  }, [activeKid]);

  // Clear focused-word practice whenever we leave a practice mode
  useEffect(() => {
    if (mode === "menu" && focusedWord) setFocusedWord(null);
  }, [mode, focusedWord]);

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

  // ─── AUTH HANDLERS ────────────────────────────────────────
  const handleEmailLogin = async ({ email, password }) => {
    await loginWithEmail(email, password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleCreateAccount = async ({ parent, password, children }) => {
    await firebaseCreateAccount(parent.email, password);
    const kids = children.map((c, i) => ({
      id: `kid-${Date.now()}-${i}`,
      name: c.name,
      age: c.age,
      avatar: c.avatar,
    }));
    setProfiles(kids);
    saveProfiles(kids);
  };

  const handleResetPassword = async (email) => {
    await resetPassword(email);
  };

  const handleLogout = async () => {
    await firebaseLogout();
    setActiveKid(null);
    setAuthScreen("welcome");
  };

  // ─── KID HELPERS ──────────────────────────────────────────
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
    setTab("home");
    setMode("menu");
  };

  const switchProfile = () => {
    setActiveKid(null);
    setTab("home");
    setMode("menu");
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "home") setMode("menu");
    setFocusedWord(null);
  };

  const practiceWord = (word) => {
    setFocusedWord(word);
    setTab("home");
    setMode("flash");
    setModeKey((k) => k + 1);
  };

  // ─── LOADING ──────────────────────────────────────────────
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

  // ─── AUTH FLOW ────────────────────────────────────────────
  if (!user) {
    switch (authScreen) {
      case "login":
        return (
          <LoginScreen
            onBack={() => setAuthScreen("welcome")}
            onLogin={handleEmailLogin}
            onGoogleLogin={handleGoogleLogin}
            onForgotPassword={() => setAuthScreen("forgot")}
          />
        );
      case "forgot":
        return (
          <ForgotPasswordScreen
            onBack={() => setAuthScreen("login")}
            onSendCode={handleResetPassword}
          />
        );
      case "create":
        return (
          <CreateAccountScreen
            onBack={() => setAuthScreen("welcome")}
            onCreateAccount={handleCreateAccount}
            onGoogleSignup={handleGoogleLogin}
          />
        );
      default:
        return (
          <WelcomeScreen
            onLogin={() => setAuthScreen("login")}
            onCreateAccount={() => setAuthScreen("create")}
          />
        );
    }
  }

  // ─── AUTH PROFILE SCREEN ──────────────────────────────────
  if (mode === "auth-profile") {
    return (
      <AuthProfileScreen
        user={user}
        children={profiles}
        onLogout={handleLogout}
        onBack={() => setMode("menu")}
      />
    );
  }

  // Kid selector screen — no bottom nav
  if (!activeKid) {
    return (
      <KidSelector
        profiles={profiles}
        onSelect={selectKid}
        onAdd={addKid}
        onDelete={deleteKid}
        onProfile={() => setMode("auth-profile")}
      />
    );
  }

  const modes = [
    { key: "flash", label: "FLASH", icon: "⚡" },
    { key: "find", label: "FIND IT", icon: "🔍" },
  ];

  // Tab content rendering
  const renderTabContent = () => {
    switch (tab) {
      case "home":
        if (mode === "menu") {
          return (
            <ModeSelectScreen
              kid={activeKid}
              progress={progress}
              onSelectMode={(m) => { setFocusedWord(null); setMode(m); setModeKey((k) => k + 1); }}
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
              paddingBottom: 90,
            }}
          >
            {/* Floating Background Shapes */}
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
                paddingTop: "max(16px, env(safe-area-inset-top))",
                position: "relative",
                zIndex: 1,
              }}
            >
              <button
                className="toy-block toy-pressable"
                onClick={() => setMode("menu")}
                style={{
                  padding: "8px 16px",
                  color: C.text,
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 700,
                  background: C.surface,
                  borderWidth: "3px",
                  boxShadow: `3px 4px 0px ${C.ink}`,
                  borderRadius: "16px",
                }}
              >
                ← Back
              </button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontFamily: FONT, color: C.text, fontWeight: 700, letterSpacing: 1 }}>
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
                <span style={{ fontFamily: FONT, color: C.text, fontSize: 14, fontWeight: 700 }}>
                  {activeKid.name}
                </span>
              </div>
            </div>

            {/* Mode tabs */}
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
                  onClick={() => { setFocusedWord(null); setMode(m.key); setModeKey((k) => k + 1); }}
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

            {/* Game content */}
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
                  focusedWord={focusedWord}
                  lang={lang}
                  onAdvanceToFindIt={() => {
                    setMode("find");
                    setModeKey((k) => k + 1);
                  }}
                />
              )}
              {mode === "find" && (
                <FindItGame progress={progress} dispatch={dispatch} lang={lang} />
              )}
            </div>
          </div>
        );

      case "dictionary":
        return <DictionaryScreen progress={progress} lang={lang} />;

      case "modules":
        return <ModulesScreen lang={lang} />;

      case "profile":
        return (
          <ProfileScreen
            kid={activeKid}
            progress={progress}
            dispatch={dispatch}
            onSwitchProfile={switchProfile}
            onPracticeWord={practiceWord}
            lang={lang}
            onLangChange={(newLang) => {
              setLang(newLang);
              if (activeKid) saveLang(activeKid.id, newLang);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div key={`${tab}-${mode}`} style={{ animation: "screenEnter 0.25s ease-out" }}>
        {renderTabContent()}
      </div>
      <BottomNav activeTab={tab} onTabChange={handleTabChange} />
      <GlobalStyles />
    </>
  );
}
