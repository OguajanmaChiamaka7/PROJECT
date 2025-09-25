import React from 'react';
import { Trophy, PiggyBank, Target, Zap, Users, BookOpen, Award } from 'lucide-react';
import '../../styles/Badges.css';

const Badges = () => {
  const achievements = [
    {
      id: 1,
      title: 'First Saver',
      icon: <PiggyBank size={24} />,
      unlocked: true
    },
    {
      id: 2,
      title: 'Goal Crusher',
      icon: <Target size={24} />,
      unlocked: true
    },
    {
      id: 3,
      title: 'Streak Master',
      icon: <Zap size={24} />,
      unlocked: false
    },
    {
      id: 4,
      title: 'Community Helper',
      icon: <Users size={24} />,
      unlocked: false
    },
    {
      id: 5,
      title: 'Quiz Master',
      icon: <BookOpen size={24} />,
      unlocked: true
    },
    {
      id: 6,
      title: 'Budget Pro',
      icon: <Award size={24} />,
      unlocked: false
    }
  ];

  return (
    <div className="achievements-container">
      {/* Enhanced Achievements */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Badges</h3>
          <Trophy className="card-icon" />
        </div>
        <div className="achievement-grid">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
              <div className={`achievement-icon ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                {achievement.icon}
              </div>
              <p className={`achievement-title ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
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