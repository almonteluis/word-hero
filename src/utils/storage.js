const NOTIF_PREFS_KEY = "word-hero-notif-prefs";

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

export {
  NOTIF_PREFS_KEY,
  loadProfiles,
  saveProfiles,
  loadKidProgress,
  saveKidProgress,
  loadNotificationPrefs,
  saveNotificationPrefs,
};
