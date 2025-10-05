import React from "react";
import {
  Trophy,
  PiggyBank,
  Target,
  Zap,
  Users,
  BookOpen,
  Award,
} from "lucide-react";
import "../../styles/Badges.css";
import { useGamification } from "../../context/GamificationContext";

// 👇 Centralized badge definitions (can also live in Firestore if you prefer)
const badgeDefinitions = [
  { id: "first_saver", title: "First Saver", icon: <PiggyBank size={24} />, xp: 50, condition: (xp, streak) => xp >= 50 },
  { id: "goal_crusher", title: "Goal Crusher", icon: <Target size={24} />, xp: 50, condition: (xp, streak) => xp >= 100 },
  { id: "streak_master", title: "Streak Master", icon: <Zap size={24} />, xp: 100, condition: (xp, streak) => streak >= 7 },
  { id: "community_helper", title: "Community Helper", icon: <Users size={24} />, xp: 100, condition: (xp, streak) => xp >= 200 },
  { id: "quiz_master", title: "Quiz Master", icon: <BookOpen size={24} />, xp: 150, condition: (xp, streak) => xp >= 300 },
  { id: "budget_pro", title: "Budget Pro", icon: <Award size={24} />, xp: 150, condition: (xp, streak) => xp >= 500 },
];

export const BadgesRow = () => {
  const { xp, streak } = useGamification();

  const unlockedBadges = badgeDefinitions.filter((badge) =>
    badge.condition(xp, streak)
  );

  const totalXP = unlockedBadges.reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="badges-row">
      {unlockedBadges.map((badge) => (
        <div key={badge.id} className="badge-icon">
          {badge.icon}
        </div>
      ))}
      <span className="xp-text">{totalXP} XP</span>
    </div>
  );
};

const Badges = () => {
  const { xp, streak } = useGamification();

  return (
    <div className="achievements-container">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Badges</h3>
          <Trophy className="card-icon" />
        </div>
        <div className="achievement-grid">
          {badgeDefinitions.map((badge) => {
            const unlocked = badge.condition(xp, streak);
            return (
              <div
                key={badge.id}
                className={`achievement-item ${unlocked ? "unlocked" : "locked"}`}
              >
                <div className={`achievement-icon ${unlocked ? "unlocked" : "locked"}`}>
                  {badge.icon}
                </div>
                <p className={`achievement-title ${unlocked ? "unlocked" : "locked"}`}>
                  {badge.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Badges;
