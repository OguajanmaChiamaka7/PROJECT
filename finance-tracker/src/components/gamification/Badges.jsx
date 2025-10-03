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

// 👇 Shared achievements data
const achievements = [
  { id: 1, title: "First Saver", icon: <PiggyBank size={24} />, unlocked: true, xp: 50 },
  { id: 2, title: "Goal Crusher", icon: <Target size={24} />, unlocked: true, xp: 50 },
  { id: 3, title: "Streak Master", icon: <Zap size={24} />, unlocked: false, xp: 100 },
  { id: 4, title: "Community Helper", icon: <Users size={24} />, unlocked: false, xp: 100 },
  { id: 5, title: "Quiz Master", icon: <BookOpen size={24} />, unlocked: true, xp: 150 },
  { id: 6, title: "Budget Pro", icon: <Award size={24} />, unlocked: false, xp: 150 },
];

const totalXP = achievements
  .filter((a) => a.unlocked)
  .reduce((sum, a) => sum + a.xp, 0);

// ✅ Exported separately
export const BadgesRow = () => {
  return (
    <div className="badges-row">
      {achievements
        .filter((a) => a.unlocked)
        .map((badge) => (
          <div key={badge.id} className="badge-icon">
            {badge.icon}
          </div>
        ))}
      <span className="xp-text">{totalXP} XP</span>
    </div>
  );
};

// ✅ Default export
const Badges = () => {
  return (
    <div className="achievements-container">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Badges</h3>
          <Trophy className="card-icon" />
        </div>
        <div className="achievement-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-item ${
                achievement.unlocked ? "unlocked" : "locked"
              }`}
            >
              <div
                className={`achievement-icon ${
                  achievement.unlocked ? "unlocked" : "locked"
                }`}
              >
                {achievement.icon}
              </div>
              <p
                className={`achievement-title ${
                  achievement.unlocked ? "unlocked" : "locked"
                }`}
              >
                {achievement.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Badges;
