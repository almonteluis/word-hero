import { C } from "../constants";

const GlobalStyles = () => (
  <style>{`
    @keyframes starPulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.5); }
    }
    @keyframes cardEnter {
      0% { opacity: 0; transform: scale(0.88) translateY(28px); }
      65% { opacity: 1; transform: scale(1.02) translateY(-4px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes pushRight {
      0% { transform: translateX(0) rotate(0deg) scale(1); opacity: 1; }
      18% { transform: translateX(-8px) rotate(-1.5deg) scale(0.97); opacity: 1; }
      100% { transform: translateX(320px) rotate(22deg) scale(0.82); opacity: 0; }
    }
    @keyframes pushLeft {
      0% { transform: translateX(0) rotate(0deg) scale(1); opacity: 1; }
      18% { transform: translateX(8px) rotate(1.5deg) scale(0.97); opacity: 1; }
      100% { transform: translateX(-320px) rotate(-22deg) scale(0.82); opacity: 0; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
    @keyframes correctPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes floatPlanet {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-14px); }
    }
    @keyframes shootingStarAnim {
      0%,100% { opacity: 0; }
      15%,85% { opacity: 0.85; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    button:active { transform: scale(0.96) !important; }
    input::placeholder { color: ${C.muted}80; }
  `}</style>
);

export default GlobalStyles;
