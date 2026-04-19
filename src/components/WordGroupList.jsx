import { C, FONT, ALL_WORDS, WORD_GROUPS, GROUP_NAMES } from "../constants";
import { MASTERY_SESSIONS } from "../utils/progress";
import { cardStyle } from "../utils/styles";

function NeedsReviewAlert({ needsReview, ws, now }) {
  if (needsReview.length === 0) return null;
  return (
    <div
      className="toy-block"
      style={{
        ...cardStyle(C.heart),
        padding: 14,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 14,
          color: C.heart,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        These words need review
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 12,
          color: C.muted,
          fontWeight: 500,
          marginBottom: 10,
        }}
      >
        Practice these soon or they'll lose mastery!
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {needsReview.map((w) => {
          const stat = ws[w];
          const daysAgo = stat
            ? Math.floor((now - stat.lastSeen) / (24 * 60 * 60 * 1000))
            : "?";
          return (
            <span
              key={w}
              style={{
                padding: "3px 8px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT,
                background: `${C.heart}18`,
                color: C.heart,
                border: `2px solid ${C.ink}15`,
              }}
            >
              {w}{" "}
              <span style={{ fontSize: 9, opacity: 0.7 }}>{daysAgo}d</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StrugglingWordsAlert({ words, ws }) {
  if (words.length === 0) return null;
  return (
    <div
      className="toy-block"
      style={{
        ...cardStyle(C.accent),
        padding: 14,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 14,
          color: C.accent,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        Tough Words
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 12,
          color: C.muted,
          fontWeight: 500,
          marginBottom: 10,
        }}
      >
        These words need extra practice
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {words.slice(0, 10).map((w) => {
          const stat = ws[w];
          const wordAcc = Math.round((stat.correct / stat.attempts) * 100);
          return (
            <span
              key={w}
              style={{
                padding: "3px 8px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT,
                background: `${C.accent}15`,
                color: C.accent,
                border: `2px solid ${C.ink}15`,
              }}
            >
              {w}{" "}
              <span style={{ fontSize: 9, opacity: 0.6 }}>
                {wordAcc}% ({stat.attempts}x)
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function WordGroupList({ progress }) {
  const ws = progress.wordStats || {};

  const now = Date.now();
  const reviewWarningCutoff = now - 5 * 24 * 60 * 60 * 1000;
  const needsReview = Object.keys(progress.mastered).filter((w) => {
    const stat = ws[w];
    const lastSeen = stat ? stat.lastSeen : progress.mastered[w];
    return lastSeen && lastSeen < reviewWarningCutoff;
  });

  const strugglingWords = ALL_WORDS.filter((w) => {
    const stat = ws[w];
    if (!stat || stat.attempts < 3) return false;
    return stat.correct / stat.attempts < 0.6;
  }).sort((a, b) => {
    const aAcc = ws[a].correct / ws[a].attempts;
    const bAcc = ws[b].correct / ws[b].attempts;
    return aAcc - bAcc;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <NeedsReviewAlert needsReview={needsReview} ws={ws} now={now} />
      <StrugglingWordsAlert words={strugglingWords} ws={ws} />

      {GROUP_NAMES.map((gn) => {
        const words = WORD_GROUPS[gn];
        const gm = words.filter((w) => progress.mastered[w]).length;
        const groupPct = Math.round((gm / words.length) * 100);
        const isComplete = gm === words.length;
        return (
          <div
            key={gn}
            className="toy-block"
            style={{
              ...cardStyle(isComplete ? C.green : undefined),
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  color: C.text,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {gn}
              </span>
              <span
                style={{
                  fontFamily: FONT,
                  color: isComplete ? C.green : C.accent,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {isComplete ? "✓ Complete" : `${gm}/${words.length}`}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: C.surface,
                borderRadius: 3,
                marginBottom: 10,
                overflow: "hidden",
                border: `1px solid ${C.ink}15`,
              }}
            >
              <div
                style={{
                  width: `${groupPct}%`,
                  height: "100%",
                  background: isComplete ? C.green : C.accent,
                  borderRadius: 3,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {words.map((w) => {
                const stat = ws[w];
                const hasStats = stat && stat.attempts > 0;
                const wordAcc = hasStats
                  ? Math.round((stat.correct / stat.attempts) * 100)
                  : null;
                const sessionsLeft = hasStats
                  ? Math.max(
                      0,
                      MASTERY_SESSIONS - (stat.sessionsCorrect || 0),
                    )
                  : MASTERY_SESSIONS;
                return (
                  <span
                    key={w}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: FONT,
                      background: progress.mastered[w]
                        ? `${C.green}18`
                        : progress.learning[w]
                          ? `${C.accent}12`
                          : C.surface,
                      color: progress.mastered[w]
                        ? C.green
                        : progress.learning[w]
                          ? C.accent
                          : `${C.text}80`,
                      border: `2px solid ${
                        progress.mastered[w]
                          ? `${C.green}30`
                          : progress.learning[w]
                            ? `${C.accent}25`
                            : `${C.ink}15`
                      }`,
                    }}
                    title={
                      hasStats
                        ? `${wordAcc}% accuracy, ${stat.attempts} attempts, ${sessionsLeft} sessions to mastery`
                        : "Not practiced yet"
                    }
                  >
                    {progress.mastered[w] && "★ "}
                    {w}
                    {hasStats && !progress.mastered[w] && (
                      <span
                        style={{ fontSize: 8, opacity: 0.6, marginLeft: 2 }}
                      >
                        {wordAcc}%
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default WordGroupList;
