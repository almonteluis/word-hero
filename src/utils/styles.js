import { C, RADIUS } from "../constants";

export function cardStyle(borderColor) {
  return {
    background: C.surface,
    border: `3px solid ${borderColor || C.ink}`,
    boxShadow: `3px 4px 0px ${C.ink}`,
    borderRadius: RADIUS.card,
  };
}

export function statPillStyle(color) {
  return {
    ...cardStyle(),
    padding: "8px 6px",
    textAlign: "center",
    flex: 1,
    minWidth: 0,
  };
}
