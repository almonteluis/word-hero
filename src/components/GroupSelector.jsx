import { GROUP_NAMES, C, FONT, RADIUS } from "../constants";

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
            color: i === selected ? C.textLight : C.text,
            border: "none",
            borderBottom: i === selected ? `4px solid ${C.accent}cc` : `3px solid ${C.border}`,
            borderRadius: RADIUS.button,
            padding: "5px 14px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 12,
            fontFamily: FONT,
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
