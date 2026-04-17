import { C } from "../constants";

function Btn({
  children,
  color = C.accent,
  onClick,
  style = {},
  small = false,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: color === C.accent || color === C.green ? C.bg : "#fff",
        border: "none",
        borderRadius: small ? 12 : 16,
        padding: small ? "8px 18px" : "12px 28px",
        fontSize: small ? 13 : 16,
        fontWeight: 800,
        cursor: "pointer",
        fontFamily: "'Russo One', sans-serif",
        letterSpacing: 2,
        boxShadow: `0 4px 15px ${color}50`,
        transition: "transform 0.15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default Btn;
