const SHARE_PARAM_KEYS = ["challenge", "mode", "score", "total", "src"];
const VALID_MODES = new Set(["flash", "find"]);

function getChallengeModeLabel(mode) {
  return mode === "find" ? "Find It" : "Flash Training";
}

function getChallengeLead(kidName) {
  const firstName = kidName?.trim()?.split(/\s+/)?.[0];
  return firstName ? `${firstName} just finished Word Hero!` : "We just finished Word Hero!";
}

function clampScore(score, total) {
  return Math.max(0, Math.min(Math.round(score), total));
}

function buildChallengeShare({ score, total, mode = "flash", kidName, baseUrl }) {
  const shareMode = VALID_MODES.has(mode) ? mode : "flash";
  const safeTotal = Math.max(1, Math.round(Number(total) || 10));
  const safeScore = clampScore(Number(score) || 0, safeTotal);
  const pct = Math.round((safeScore / safeTotal) * 100);

  const url = new URL(
    baseUrl || (typeof window !== "undefined" ? window.location.href : "https://wordhero.app"),
  );
  url.search = "";
  url.hash = "";
  url.searchParams.set("challenge", "1");
  url.searchParams.set("mode", shareMode);
  url.searchParams.set("score", String(safeScore));
  url.searchParams.set("total", String(safeTotal));
  url.searchParams.set("src", "challenge-share");

  const modeLabel = getChallengeModeLabel(shareMode);
  const text = `${getChallengeLead(kidName)} Can your hero beat ${pct}% in ${modeLabel}?`;

  return {
    mode: shareMode,
    modeLabel,
    pct,
    score: safeScore,
    total: safeTotal,
    title: `${modeLabel} Challenge`,
    text,
    url: url.toString(),
    clipboardText: `${text} ${url.toString()}`,
  };
}

function parseChallengeFromSearch(search = "") {
  const params = new URLSearchParams(search);
  if (params.get("challenge") !== "1" || params.get("src") !== "challenge-share") {
    return null;
  }

  const mode = params.get("mode");
  const score = Number(params.get("score"));
  const total = Number(params.get("total"));

  if (!VALID_MODES.has(mode) || !Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
    return null;
  }

  const safeTotal = Math.round(total);
  const safeScore = clampScore(score, safeTotal);
  const pct = Math.round((safeScore / safeTotal) * 100);

  return {
    mode,
    modeLabel: getChallengeModeLabel(mode),
    score: safeScore,
    total: safeTotal,
    pct,
  };
}

function stripChallengeParamsFromUrl(href) {
  const url = new URL(href, "https://wordhero.app");
  SHARE_PARAM_KEYS.forEach((key) => url.searchParams.delete(key));
  return `${url.pathname}${url.search}${url.hash}`;
}

export {
  buildChallengeShare,
  getChallengeModeLabel,
  parseChallengeFromSearch,
  stripChallengeParamsFromUrl,
};
