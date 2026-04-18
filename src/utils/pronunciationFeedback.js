// Picks the best-matching transcript alternative and returns a coaching tip
// for the learner. Combines (1) showing what we heard with (2) targeted
// phoneme/digraph hints for common kid mispronunciations.

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

function pickClosest(alts, target) {
  return alts.reduce(
    (best, a) => (editDistance(a, target) < editDistance(best, target) ? a : best),
    alts[0],
  );
}

// Explicit hints for the common confusions kids hit on sight words.
const HINT_MAP = {
  "she|see": "Start with the 'shh' sound, then say 'ee'.",
  "she|he": "Add the 'shh' sound at the start before 'ee'.",
  "she|the": "Start with 'shh', not 'th' — lips forward.",
  "he|she": "Just 'hee' — no 'shh' sound at the start.",
  "he|the": "Start with a soft 'h' breath, not 'th'.",
  "the|duh": "Put your tongue between your teeth for 'th', then say 'uh'.",
  "the|tuh": "Soften the start — tongue between teeth for 'th'.",
  "the|da": "Tongue peeks between your teeth for 'th'.",
  "the|de": "Tongue between teeth for 'th', then 'uh'.",
  "they|day": "Start with 'th' — tongue between your teeth.",
  "them|dem": "Start with 'th' — tongue between your teeth.",
  "that|dat": "Start with 'th' — tongue between your teeth.",
  "this|dis": "Start with 'th' — tongue between your teeth.",
  "there|dare": "Start with 'th' — tongue between your teeth.",
  "their|dare": "Start with 'th' — tongue between your teeth.",
  "through|froo": "Start with 'th', not 'f' — tongue between teeth.",
  "though|doe": "Start with 'th' — tongue between your teeth.",
  "is|it": "End with a buzzy 'zz' sound, not a hard 't'.",
  "it|is": "End with a quick 't', not a 'zz'.",
  "was|wuz": "Good try — say it a bit slower: 'wuhz'.",
  "right|white": "Curl your tongue back for the 'r' sound.",
  "right|light": "Curl your tongue back for 'r', don't touch the roof.",
  "write|white": "The 'w' is silent — start with 'r' (curl your tongue).",
  "write|right": "Nice — those sound the same! Try a clearer 'r' start.",
  "know|no": "Those sound the same — 'know' has a silent 'k'.",
  "know|now": "Silent 'k' — it sounds just like 'no'.",
  "once|ones": "Start with a 'w' sound: 'wunce'.",
  "could|cold": "Say 'kuh' + 'ood' — no 'l' sound in the middle.",
  "would|wood": "Those sound the same — silent 'l'. Nice try!",
  "should|shood": "Those sound the same — silent 'l'. Nice try!",
  "two|to": "Those sound the same — no worries.",
  "too|to": "Those sound the same — no worries.",
  "for|four": "Those sound the same — no worries.",
};

function hintFromRules(target, heard) {
  // Silent letters
  if (target.startsWith("kn") && heard === target.slice(1)) {
    return "The 'k' is silent — start with the 'n' sound.";
  }
  if (target.startsWith("wr") && heard === target.slice(1)) {
    return "The 'w' is silent — start with the 'r' sound.";
  }

  // Digraph swaps
  if (target.includes("th") && !heard.includes("th")) {
    return "For 'th', put your tongue lightly between your teeth.";
  }
  if (target.includes("sh") && !heard.includes("sh")) {
    return "For 'sh', push your lips out and make a 'shhh' sound.";
  }
  if (target.includes("ch") && !heard.includes("ch")) {
    return "For 'ch', make a quick 'chuh' — like a tiny sneeze.";
  }
  if (target.endsWith("ng") && heard.endsWith("n") && !heard.endsWith("ng")) {
    return "End with 'ng' — lift the back of your tongue.";
  }

  // Consonant starts
  if (target.startsWith("r") && heard.startsWith("w")) {
    return "For 'r', curl your tongue back without touching the roof.";
  }
  if (
    target.startsWith("l") &&
    (heard.startsWith("w") || heard.startsWith("y"))
  ) {
    return "For 'l', touch your tongue to the roof of your mouth.";
  }
  if (target.startsWith("v") && heard.startsWith("b")) {
    return "For 'v', bite your bottom lip gently and buzz.";
  }
  if (target.startsWith("f") && heard.startsWith("p")) {
    return "For 'f', rest your teeth on your bottom lip and blow.";
  }

  // Missing/extra edge letters
  if (target.length > 1 && heard === target.slice(1)) {
    return `Don't skip the '${target[0]}' sound at the start.`;
  }
  if (target.length > 1 && heard === target.slice(0, -1)) {
    return `Finish with the '${target[target.length - 1]}' sound at the end.`;
  }
  if (heard.length > 1 && target === heard.slice(1)) {
    return `No extra sound at the start — just say "${target}".`;
  }

  return null;
}

function buildTip(target, heard) {
  if (heard === target) {
    return `Almost — say "${target}" a little clearer.`;
  }
  const mapped = HINT_MAP[`${target}|${heard}`];
  if (mapped) return mapped;
  const ruled = hintFromRules(target, heard);
  if (ruled) return ruled;
  return `Say it slowly: sound out each part of "${target}".`;
}

function getPronunciationFeedback(spokenResult, target) {
  if (!spokenResult || !target) return null;
  const alts = spokenResult.split("|").filter(Boolean);
  if (alts.length === 0) return null;
  const t = target.toLowerCase().trim();
  const heard = pickClosest(alts, t);
  return { heard, tip: buildTip(t, heard) };
}

export { getPronunciationFeedback };
