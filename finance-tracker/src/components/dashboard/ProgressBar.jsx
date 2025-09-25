import React from "react";
import Card from '../ui/Card';
import Button from '../ui/Button';
import '../../styles/ProgressBar.css';

const ProgressItem = ({ title, progress, current, target, color, level, xp, badge }) => {
  const getProgressBarClass = () => {
    return `progress-bar-fill progress-${color}`;
  };

  const getBadgeIcon = (badgeType) => {
    const badges = {
      'saver': '💰',
      'budgeter': '📊',
      'investor': '📈',
      'achiever': '🏆',
      'starter': '⭐'
    };
    return badges[badgeType] || '🎯';
  };

  return (
    <div className="progress-item">
      <div className="progress-header">
        <div className="progress-title-section">
          <div className="progress-badge">
            <span className="badge-icon">{getBadgeIcon(badge)}</span>
            <span className="level-text">Level {level}</span>
          </div>
          <h3 className="progress-title">{title}</h3>
        </div>
        <div className="progress-stats">
          <span className="current-target">{current} / {target}</span>
          <span className="xp-earned">+{xp} XP</span>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar-background">
          <div 
            className={getProgressBarClass()} 
            style={{ width: `${progress}%` }}
          >
            <div className="progress-shimmer"></div>
          </div>
        </div>
      </div>
      
      <div className="progress-footer">
        <span className="progress-percentage">{progress}% Complete</span>
        <div className="achievement-indicator">
          {progress >= 100 ? (
            <span className="achievement-complete">🎉 Goal Achieved!</span>
          ) : progress >= 75 ? (
            <span className="achievement-close">🔥 Almost there!</span>
          ) : progress >= 50 ? (
            <span className="achievement-halfway">💪 Halfway done!</span>
          ) : (
            <span className="achievement-start">🚀 Keep going!</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgressBar = () => {
  const progressData = [
    {
      title: "Emergency Fund Quest",
      progress: 75,
      current: "₦375,000",
      target: "₦500,000",
      color: "emerald",
      level: 3,
      xp: 150,
      badge: "saver"
    },
    {
      title: "Budget Master Challenge",
      progress: 60,
      current: "₦48,000",
      target: "₦80,000",
      color: "blue",
      level: 2,
      xp: 120,
      badge: "budgeter"
    },
    {
      title: "Investment Warrior Path",
      progress: 45,
      current: "₦225,000",
      target: "₦500,000",
      color: "purple",
      level: 2,
      xp: 90,
      badge: "investor"
    },
    {
      title: "Savings Streak",
      progress: 90,
      current: "27 days",
      target: "30 days",
      color: "orange",
      level: 4,
      xp: 200,
      badge: "achiever"
    }
  ];

  const totalXP = progressData.reduce((sum, item) => sum + item.xp, 0);

  return (
    <Card 
      title={
        <div className="card-title-section">
          <span>🎮 Your Financial Journey</span>
          <div className="total-xp">Total XP: {totalXP}</div>
        </div>
      }
      action={
        <Button variant="primary" size="sm">
          View Achievements
        </Button>
      }
    >
      <div className="progress-container">
        {progressData.map((item, index) => (
          <ProgressItem key={index} {...item} />
        ))}
        
        <div className="overall-progress">
          <h4>🏆 Overall Progress Score</h4>
          <div className="score-display">
            <span className="score-number">{Math.round(progressData.reduce((sum, item) => sum + item.progress, 0) / progressData.length)}</span>
            <span className="score-label">Average Completion</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressBar;