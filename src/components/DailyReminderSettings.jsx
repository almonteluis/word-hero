import { useState } from "react";
import { C, FONT, RADIUS } from "../constants";
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
} from "../utils/storage";

function DailyReminderSettings() {
  const [prefs, setPrefs] = useState(loadNotificationPrefs);
  const [permission, setPermission] = useState(() =>
    "Notification" in window ? Notification.permission : "unsupported",
  );
  const [showIOSHint, setShowIOSHint] = useState(false);

  const isSupported = "Notification" in window;
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone);

  const updatePrefs = (updates) => {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    saveNotificationPrefs(next);
  };

  const requestPermission = async () => {
    if (!isSupported) return;
    if (isIOS && !isStandalone) {
      setShowIOSHint(true);
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") updatePrefs({ enabled: true });
  };

  const handleToggle = async () => {
    if (!prefs.enabled) {
      if (permission === "granted") {
        updatePrefs({ enabled: true });
      } else {
        await requestPermission();
      }
    } else {
      updatePrefs({ enabled: false });
    }
  };

  const sendTestNotification = () => {
    if (permission !== "granted") return;
    new Notification("⚡ Word Hero Daily Challenge!", {
      body: "Time to train! Your daily sight words are ready. Keep your hero power up!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: RADIUS.card,
        padding: 16,
        marginTop: 24,
        border: `3px solid ${C.secondary}25`,
        boxShadow: `0 4px 12px ${C.shadow}`,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 13,
          color: C.blue,
          letterSpacing: 2,
          marginBottom: 4,
        }}
      >
        DAILY REMINDER
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 10,
          color: C.muted,
          letterSpacing: 1,
          marginBottom: 14,
        }}
      >
        Get notified to do your daily word challenge
      </div>

      {/* iOS not-installed hint */}
      {isIOS && !isStandalone && (
        <div
          style={{
            background: `${C.accent}12`,
            border: `1px solid ${C.accent}30`,
            borderRadius: 10,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 11,
              color: C.accent,
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            iOS SETUP REQUIRED
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.text,
              lineHeight: 1.6,
              fontFamily: FONT,
            }}
          >
            To enable notifications on iPhone/iPad:
            <br />
            1. Tap the <strong style={{ color: C.accent }}>Share</strong> button
            in Safari
            <br />
            2. Select{" "}
            <strong style={{ color: C.accent }}>"Add to Home Screen"</strong>
            <br />
            3. Open Word Hero from your Home Screen
            <br />
            4. Then enable reminders here
          </div>
          {showIOSHint && (
            <button
              onClick={() => setShowIOSHint(false)}
              style={{
                marginTop: 8,
                background: "transparent",
                border: `1px solid ${C.muted}40`,
                color: C.muted,
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 10,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              DISMISS
            </button>
          )}
        </div>
      )}

      {/* Permission denied warning */}
      {permission === "denied" && (
        <div
          style={{
            background: `${C.red}12`,
            border: `1px solid ${C.red}30`,
            borderRadius: 10,
            padding: 10,
            marginBottom: 14,
            fontFamily: FONT,
            fontSize: 11,
            color: C.red,
            letterSpacing: 1,
          }}
        >
          NOTIFICATIONS BLOCKED — Enable them in your browser settings to use
          reminders.
        </div>
      )}

      {/* Toggle row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: 12,
            color: C.text,
            letterSpacing: 1,
          }}
        >
          Enable Daily Reminder
        </span>
        <button
          onClick={handleToggle}
          disabled={permission === "denied" || !isSupported}
          style={{
            width: 46,
            height: 26,
            borderRadius: 13,
            border: "none",
            cursor: permission === "denied" ? "not-allowed" : "pointer",
            background:
              prefs.enabled && permission === "granted"
                ? `linear-gradient(135deg, ${C.blue}, ${C.accent})`
                : C.bg,
            position: "relative",
            transition: "background 0.25s",
            boxShadow:
              prefs.enabled && permission === "granted"
                ? `0 0 10px ${C.blue}40`
                : "none",
            opacity: permission === "denied" || !isSupported ? 0.4 : 1,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: C.text,
              position: "absolute",
              top: 3,
              left: prefs.enabled && permission === "granted" ? 23 : 3,
              transition: "left 0.25s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
        </button>
      </div>

      {/* Time picker */}
      {prefs.enabled && permission === "granted" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            animation: "fadeUp 0.3s",
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: C.text,
              letterSpacing: 1,
            }}
          >
            Remind me at
          </span>
          <input
            type="time"
            value={prefs.time}
            onChange={(e) =>
              updatePrefs({ time: e.target.value, lastSentDate: null })
            }
            style={{
              background: C.bg,
              border: `1px solid ${C.blue}40`,
              borderRadius: 8,
              color: C.accent,
              fontFamily: FONT,
              fontSize: 14,
              padding: "4px 10px",
              letterSpacing: 1,
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {permission !== "granted" &&
          permission !== "denied" &&
          isSupported &&
          !(isIOS && !isStandalone) && (
            <button
              onClick={requestPermission}
              style={{
                background: `linear-gradient(135deg, ${C.blue}, ${C.accent})`,
                color: C.bg,
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                fontFamily: FONT,
                fontSize: 11,
                letterSpacing: 2,
                cursor: "pointer",
                boxShadow: `0 4px 12px ${C.blue}30`,
              }}
            >
              ALLOW NOTIFICATIONS
            </button>
          )}
        {prefs.enabled && permission === "granted" && (
          <button
            onClick={sendTestNotification}
            style={{
              background: C.bg,
              color: C.blue,
              border: `1px solid ${C.blue}40`,
              borderRadius: 10,
              padding: "8px 14px",
              fontFamily: FONT,
              fontSize: 11,
              letterSpacing: 2,
              cursor: "pointer",
            }}
          >
            TEST NOTIFICATION
          </button>
        )}
      </div>

      {prefs.enabled && permission === "granted" && (
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT,
            fontSize: 10,
            color: C.muted,
            letterSpacing: 1,
            lineHeight: 1.6,
          }}
        >
          Reminder fires when you open the app after {prefs.time}.
          {isIOS &&
            " For alerts without opening the app, iOS 16.4+ is required with the PWA installed."}
        </div>
      )}
    </div>
  );
}

export default DailyReminderSettings;
