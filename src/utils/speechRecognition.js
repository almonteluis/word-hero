import { useState, useEffect, useCallback, useRef } from "react";

function useSpeechRecognition(lang = "en") {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang === "es" ? "es-MX" : "en-US";
    rec.maxAlternatives = 5;
    rec.onresult = (e) => {
      const alternatives = [];
      for (let i = 0; i < e.results[0].length; i++) {
        alternatives.push(e.results[0][i].transcript.toLowerCase().trim());
      }
      setResult(alternatives.join("|"));
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, [lang]);

  const startListening = useCallback(() => {
    setResult("");
    if (recRef.current) {
      try {
        recRef.current.start();
        setListening(true);
      } catch {}
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {}
    }
    setListening(false);
  }, []);

  return { listening, result, startListening, stopListening, supported };
}

function wordMatch(spokenResult, target) {
  const alts = spokenResult.split("|");
  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "");
  const t = normalize(target);
  return alts.some((raw) => {
    const a = normalize(raw);
    if (a === t) return true;
    if (t.length <= 3) return false;
    if (a.includes(t)) return true;
    if (t.includes(a) && a.length >= t.length * 0.8) return true;
    return false;
  });
}

function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Three-band classification used by the practice rounds. "close" gives kids
// a forgiving mid-tier so a near-miss feels like encouragement, not failure.
function wordMatchLevel(spokenResult, target) {
  if (!spokenResult || !target) return "miss";
  if (wordMatch(spokenResult, target)) return "correct";

  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "");

  const t = normalize(target);
  if (!t) return "miss";

  const tolerance = t.length <= 3 ? 1 : 2;
  const closeHit = spokenResult.split("|").some((raw) => {
    const a = normalize(raw);
    if (!a) return false;
    return editDistance(a, t) <= tolerance;
  });
  return closeHit ? "close" : "miss";
}

export { useSpeechRecognition, wordMatch, wordMatchLevel };
