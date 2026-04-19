import { C, FONT } from "../constants";
import HeroProfile from "./HeroProfile";
import DailyStreak from "./DailyStreak";
import StatsRow from "./StatsRow";
import HeroPowerBar from "./HeroPowerBar";
import AchievementsList from "./AchievementsList";
import WordGroupList from "./WordGroupList";
import DailyReminderSettings from "./DailyReminderSettings";

function ProgressScreen({ progress, kidName, onBack }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.secondary} 0%, #E0F2FE 50%, ${C.green} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          padding: "24px 20px 40px",
          paddingTop: "max(24px, env(safe-area-inset-top))",
        }}
      >
        {/* Header */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <button
            className="toy-block toy-pressable"
            onClick={onBack}
            style={{
              padding: "8px 16px",
              color: C.text,
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 700,
              background: C.surface,
              borderWidth: "3px",
              boxShadow: `3px 4px 0px ${C.ink}`,
              borderRadius: "16px",
            }}
          >
            ← Back
          </button>
          <div
            style={{
              fontSize: 18,
              fontFamily: FONT,
              color: C.text,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Hero Stats
          </div>
          <div style={{ width: 70 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <HeroProfile progress={progress} kidName={kidName} />
          <StatsRow progress={progress} />
          <HeroPowerBar progress={progress} />
          <DailyStreak progress={progress} />
          <AchievementsList progress={progress} />
          <WordGroupList progress={progress} />
          <DailyReminderSettings />
        </div>
      </div>
    </div>
  );
}

export default ProgressScreen;
