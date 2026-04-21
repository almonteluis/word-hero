import { C, FONT, RADIUS } from "../constants";

function Btn({
  children,
  color = C.primary,
  onClick,
  style = {},
  small = false,
}) {
  const isLightFill = color === C.primary || color === C.sun || color === C.panel;

  return (
    <button
      className="toy-block toy-pressable"
      onClick={onClick}
      style={{
        background: color,
        color: isLightFill ? C.text : C.textLight,
        padding: small ? "10px 20px" : "12px 28px",
        minHeight: 44,
        fontSize: small ? 14 : 16,
        fontWeight: 700,
        fontFamily: FONT,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default Btn;
