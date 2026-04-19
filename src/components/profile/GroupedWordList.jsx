import { C, FONT, WORD_GROUPS } from "../../constants";
import { getWordStats } from "../../utils/progress";

function formatDate(ms) {
  if (!ms) return null;
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function GroupedWordList({ words, progress, variant, onWordTap, emptyMessage }) {
  // Build groups in the original WORD_GROUPS order, keeping only entries in `words`
  const set = new Set(words);
  const groups = Object.entries(WORD_GROUPS)
    .map(([name, list]) => ({
      name,
      words: list.filter((w) => set.has(w)),
    }))
    .filter((g) => g.words.length > 0);

  if (groups.length === 0) {
    return (
      <div
        style={{
          padding: "40px 16px",
          textAlign: "center",
          color: C.muted,
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {groups.map((g) => (
        <div key={g.name}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              letterSpacing: 0.5,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            {g.name} · {g.words.length}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 6,
            }}
          >
            {g.words.map((w) => (
              <WordRow
                key={w}
                word={w}
                progress={progress}
                variant={variant}
                onClick={() => onWordTap(w)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WordRow({ word, progress, variant, onClick }) {
  const ws = getWordStats(progress, word);
  const mastered = progress.mastered?.[word];
  const accuracy =
    ws.attempts > 0 ? Math.round((ws.correct / ws.attempts) * 100) : null;

  const right =
    variant === "mastered" ? (
      <div
        style={{
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 700,
          color: C.muted,
        }}
      >
        {formatDate(mastered)}
      </div>
    ) : (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {accuracy !== null && (
          <span
            style={{
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 700,
              color: accuracy >= 80 ? C.text : C.muted,
            }}
          >
            {accuracy}%
          </span>
        )}
        <span
          style={{
            background: C.accent,
            color: C.ink,
            border: `2px solid ${C.ink}`,
            borderRadius: 10,
            padding: "2px 8px",
            fontFamily: FONT,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {Math.min(ws.sessionsCorrect || 0, 3)}/3
        </span>
      </div>
    );

  return (
    <button
      onClick={onClick}
      className="toy-pressable"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "10px 14px",
        background: C.surface,
        border: `2px solid ${C.ink}`,
        borderRadius: 14,
        boxShadow: `2px 2px 0 ${C.ink}`,
        cursor: "pointer",
        fontFamily: FONT,
        textAlign: "left",
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          letterSpacing: 1,
        }}
      >
        {word}
      </span>
      {right}
    </button>
  );
}
