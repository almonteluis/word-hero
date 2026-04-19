import { useState } from "react";
import { C, FONT, RADIUS, getWordBank } from "../constants";
import { checkMastery, getWordStats } from "../utils/progress";

export default function DictionaryScreen({ progress, lang = "en" }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const { WORD_GROUPS, ALL_WORDS } = getWordBank(lang);

  const toggleGroup = (name) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  const query = search.toLowerCase().trim();
  const hasSearch = query.length > 0;

  // Build group data with word statuses
  // Spanish entries are objects {word, en}, English are plain strings
  const getWordText = (w) => (typeof w === "object" ? w.word : w);

  const groups = Object.entries(WORD_GROUPS).map(([name, words]) => {
    const filtered = hasSearch
      ? words.filter((w) => getWordText(w).includes(query))
      : words;
    return { name, words: filtered, total: words.length };
  }).filter((g) => g.words.length > 0);

  // Global search results (flat list when searching)
  const flatResults = hasSearch
    ? ALL_WORDS.filter((w) => w.includes(query))
    : [];

  const getWordStatus = (word) => {
    const ws = getWordStats(progress, word);
    if (progress.mastered?.[word]) return { label: "Mastered", color: C.green, icon: "✓" };
    if (checkMastery(ws)) return { label: "Mastered", color: C.green, icon: "✓" };
    if (progress.learning?.[word]) return { label: "Learning", color: C.accent, icon: "⚡" };
    return { label: "New", color: C.muted, icon: "·" };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.secondary} 0%, #E0F2FE 50%, ${C.green} 100%)`,
        paddingBottom: 90,
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
          padding: "20px 16px",
          paddingTop: "max(20px, env(safe-area-inset-top))",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            marginBottom: 16,
          }}
        >
          📖 Dictionary
        </div>

        {/* Search bar */}
        <div
          className="toy-block"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            marginBottom: 16,
            borderWidth: "3px",
            boxShadow: `3px 4px 0px ${C.ink}`,
          }}
        >
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontFamily: FONT,
              fontSize: 15,
              color: C.text,
              background: "transparent",
            }}
          />
          {hasSearch && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: C.panel,
                border: `2px solid ${C.ink}`,
                borderRadius: RADIUS.small,
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 600,
                color: C.text,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search results count */}
        {hasSearch && (
          <div
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: C.muted,
              marginBottom: 12,
            }}
          >
            {flatResults.length} word{flatResults.length !== 1 ? "s" : ""} found
          </div>
        )}

        {/* Word groups */}
        {groups.map((group) => {
          const isOpen = hasSearch || expanded[group.name];
          return (
            <div
              key={group.name}
              className="toy-block"
              style={{
                marginBottom: 10,
                borderWidth: "3px",
                boxShadow: `3px 4px 0px ${C.ink}`,
                overflow: "hidden",
              }}
            >
              {/* Group header */}
              <button
                onClick={() => !hasSearch && toggleGroup(group.name)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: C.surface,
                  border: "none",
                  cursor: hasSearch ? "default" : "pointer",
                  fontFamily: FONT,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                    {group.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      fontWeight: 500,
                    }}
                  >
                    ({group.words.length}/{group.total})
                  </span>
                </div>
                {!hasSearch && (
                  <span
                    style={{
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "",
                      color: C.muted,
                      fontSize: 14,
                    }}
                  >
                    ▼
                  </span>
                )}
              </button>

              {/* Word list */}
              {isOpen && (
                <div
                  style={{
                    padding: "4px 12px 12px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {group.words.map((entry) => {
                    const word = getWordText(entry);
                    const translation = typeof entry === "object" ? entry.en : null;
                    const status = getWordStatus(progress, word);
                    return (
                      <div
                        key={word}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: `${status.color}30`,
                          border: `2px solid ${status.color}`,
                          borderRadius: RADIUS.small,
                          padding: "4px 10px",
                          fontFamily: FONT,
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.text,
                        }}
                      >
                        <span style={{ fontSize: 10 }}>{status.icon}</span>
                        {word}
                        {translation && (
                          <span style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>
                            ({translation})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {groups.length === 0 && hasSearch && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              fontFamily: FONT,
              color: C.muted,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              No words found for "{search}"
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Try a different search term
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
