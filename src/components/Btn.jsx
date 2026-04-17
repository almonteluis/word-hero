import { C, FONT, RADIUS } from "../constants";

function Btn({
  children,
  color = C.primary,
  onClick,
  style = {},
  small = false,
}) {
  const isLightFill = color === C.primary || color === C.sun || color === C.panel;
  // 3D bottom border: darker shade of the fill color
  const borderDark = `${color}cc`;

  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: isLightFill ? C.text : C.textLight,
        border: "none",
        borderBottom: `4px solid ${borderDark}`,
        borderRadius: RADIUS.button,
        padding: small ? "8px 20px" : "12px 28px",
        fontSize: small ? 14 : 16,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: FONT,
        transition: "transform 0.15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default Btn;
