import { useMemo } from "react";
import { C, FONT, RADIUS, SHADOW, getWordBank } from "../constants";
import { checkMastery, getWordStats } from "../utils/progress";

const GROUP_DEFS = [
  { key: "mastered", label: "Mastered", color: C.green },
  { key: "learning", label: "Learning", color: C.accent },
  { key: "new", label: "Not Started", color: C.panel },
];

export default function DictionaryScreen({ progress, lang = "en" }) {
  const { ALL_WORDS } = getWordBank(lang);

  const groups = useMemo(() => {
    const buckets = { mastered: [], learning: [], new: [] };

    ALL_WORDS.forEach((w) => {
      const word = typeof w === "object" ? w.word : w;
      if (progress.mastered?.[word]) {
        buckets.mastered.push(word);
      } else {
        const ws = getWordStats(progress, word);
        if (checkMastery(ws)) {
          buckets.mastered.push(word);
        } else if (progress.learning?.[word]) {
          buckets.learning.push(word);
        } else {
          buckets.new.push(word);
        }
      }
    });

    return GROUP_DEFS.map((def) => ({ ...def, words: buckets[def.key] }));
  }, [ALL_WORDS, progress]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 90 }}>
      <div
        style={{
          maxWidth: 400,
          margin: "0 auto",
          padding: "64px 16px 16px",
          paddingTop: "max(64px, calc(20px + env(safe-area-inset-top)))",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 700,
            color: C.text,
            marginBottom: 20,
          }}
        >
          📖 My Words
        </div>

        {groups.map((group) => (
          <div key={group.key} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
                color: C.text,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: group.color,
                  border: `2px solid ${C.ink}`,
                }}
              />
              {group.label} · {group.words.length}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {group.words.map((w) => (
                <div
                  key={w}
                  style={{
                    background: group.color,
                    border: `3px solid ${C.ink}`,
                    borderRadius: RADIUS.pill,
                    padding: "6px 16px",
                    fontFamily: FONT,
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.text,
                    boxShadow: SHADOW.toyXs,
                  }}
                >
                  {w}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
