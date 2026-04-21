import { C, FONT, RADIUS, SHADOW, WORD_GROUPS } from "../../constants";

const GROUP_DEFS = [
  { key: "mastered", label: "Mastered", emoji: "✅", color: C.green },
  { key: "learning", label: "Learning", emoji: "📝", color: C.accent },
];

export default function GroupedWordList({ words, progress, variant, onWordTap, emptyMessage }) {
  const set = new Set(words);
  const groups = Object.entries(WORD_GROUPS)
    .map(([name, list]) => ({
      name,
      words: list.filter((w) => set.has(w)),
    }))
    .filter((g) => g.words.length > 0);

  const groupDef = GROUP_DEFS.find((d) => d.key === variant) || GROUP_DEFS[0];

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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {groups.map((g) => (
        <div
          key={g.name}
          className="toy-block"
          style={{
            background: C.surface,
            borderWidth: 3,
            boxShadow: `3px 4px 0 ${C.ink}`,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: g.words.length ? 12 : 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: groupDef.color,
                border: `2px solid ${C.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {groupDef.emoji}
            </div>
            <div
              style={{
                flex: 1,
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 700,
                color: C.text,
              }}
            >
              {g.name}
            </div>
            <div
              style={{
                background: groupDef.color,
                borderRadius: RADIUS.pill,
                padding: "2px 10px",
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                color: C.ink,
                border: `2px solid ${C.ink}`,
              }}
            >
              {g.words.length}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {g.words.map((w) => (
              <button
                key={w}
                onClick={() => onWordTap(w)}
                className="toy-pressable"
                style={{
                  background: groupDef.color,
                  border: `2px solid ${C.ink}`,
                  borderRadius: RADIUS.pill,
                  padding: "8px 18px",
                  minHeight: 44,
                  minWidth: 44,
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.ink,
                  boxShadow: SHADOW.toyXs,
                  cursor: "pointer",
                }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
