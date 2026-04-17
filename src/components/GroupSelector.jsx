import { GROUP_NAMES, C } from "../constants";

function GroupSelector({ selected, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "0 8px",
      }}
    >
      {GROUP_NAMES.map((g, i) => (
        <button
          key={g}
          onClick={() => onChange(i)}
          style={{
            background: i === selected ? C.accent : C.panel,
            color: i === selected ? C.bg : C.muted,
            border: `2px solid ${i === selected ? C.accent : "transparent"}`,
            borderRadius: 20,
            padding: "5px 12px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 11,
            fontFamily: "'Russo One', sans-serif",
            letterSpacing: 1,
            transition: "all 0.2s",
          }}
        >
          {g.split("–")[0].trim()}
        </button>
      ))}
    </div>
  );
}

export default GroupSelector;
