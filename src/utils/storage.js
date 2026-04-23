const NOTIF_PREFS_KEY = "word-hero-notif-prefs";
const ANALYTICS_KEY = "word-hero-analytics";

function loadProfiles() {
  try {
    const raw = localStorage.getItem("word-hero-profiles");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveProfiles(data) {
  try {
    localStorage.setItem("word-hero-profiles", JSON.stringify(data));
  } catch {}
}
function loadKidProgress(kidId) {
  try {
    const raw = localStorage.getItem(`word-hero-progress-${kidId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveKidProgress(kidId, progress) {
  try {
    localStorage.setItem(
      `word-hero-progress-${kidId}`,
      JSON.stringify(progress),
    );
  } catch {}
}

function loadNotificationPrefs() {
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY);
    return raw
      ? JSON.parse(raw)
      : { enabled: false, time: "08:00", lastSentDate: null };
  } catch {
    return { enabled: false, time: "08:00", lastSentDate: null };
  }
}
function saveNotificationPrefs(prefs) {
  try {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

function loadLang(kidId) {
  try {
    return localStorage.getItem(`word-hero-lang-${kidId}`) || "en";
  } catch {
    return "en";
  }
}
function saveLang(kidId, lang) {
  try {
    localStorage.setItem(`word-hero-lang-${kidId}`, lang);
  } catch {}
}

function loadAnalytics() {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : { counts: {}, events: [] };
  } catch {
    return { counts: {}, events: [] };
  }
}

function loadEventCounts() {
  return loadAnalytics().counts || {};
}

function trackEvent(name, payload = {}) {
  const analytics = loadAnalytics();
  const counts = analytics.counts || {};
  const events = analytics.events || [];
  const next = {
    counts: {
      ...counts,
      [name]: (counts[name] || 0) + 1,
    },
    events: [{ name, payload, at: Date.now() }, ...events].slice(0, 25),
  };

  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next));
  } catch {}

  return next;
}

export {
  ANALYTICS_KEY,
  NOTIF_PREFS_KEY,
  loadProfiles,
  saveProfiles,
  loadKidProgress,
  saveKidProgress,
  loadNotificationPrefs,
  saveNotificationPrefs,
  loadLang,
  saveLang,
  loadAnalytics,
  loadEventCounts,
  trackEvent,
};
