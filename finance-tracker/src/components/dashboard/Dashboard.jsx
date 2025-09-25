import React from 'react';
import { Wallet, PiggyBank, Target, Zap, TrendingUp, Award, Calendar } from 'lucide-react';
import Layout from '../layout/Layout';
import StatsCard from './StatsCard';
import ProgressBar from './ProgressBar';
import RecentTransactions from './RecentTransactions';
import DailyTasks from './DailyTasks';
import QuickActions from './QuickActions';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const enhancedStatsData = [
    {
      title: "Account Balance",
      value: "₦12,450",
      icon: Wallet,
      progressValue: 25,
      progressMax: 100,
      goalText: "Goal: ₦50,000 (25%)",
      progressColor: "#10b981",
      bgColor: "#f0fdf4",
      iconColor: "#10b981"
    },
    {
      title: "Experience Points",
      value: "2,340 XP",
      icon: Zap,
      progressValue: 78,
      progressMax: 100,
      goalText: "Next level: 760 XP to go",
      progressColor: "#f59e0b",
      bgColor: "#fefbf2",
      iconColor: "#f59e0b"
    },
    {
      title: "Current Level",
      value: "Level 5",
      subtitle: "Money Master",
      description: "Keep saving to level up!",
      icon: Award,
      bgColor: "#f3f4f6",
      valueColor: "#8b5cf6",
      iconColor: "#8b5cf6"
    },
    {
      title: "Weekly Spending",
      value: "₦3,200",
      icon: TrendingUp,
      progressValue: 21,
      progressMax: 100,
      goalText: "Budget: ₦15,000 monthly",
      progressColor: "#ef4444",
      bgColor: "#fef2f2",
      iconColor: "#ef4444"
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, Alex!</h1>
        <p className="welcome-subtitle">
          You're doing amazing! Keep up the great work on your financial journey.
        </p>
      </div>

      {/* Enhanced Stat Cards */}
      <div className="enhanced-stats-section">
        <h2 className="section-title">Enhanced Stat Cards</h2>
        <div className="enhanced-stats-grid">
          {enhancedStatsData.map((stat, index) => (
            <div 
              key={index} 
              className="enhanced-stat-card"
              style={{ backgroundColor: stat.bgColor }}
            >
              <div className="enhanced-card-header">
                <div className="enhanced-card-title">
                  {stat.title}
                </div>
                <div className="enhanced-card-icon" style={{ color: stat.iconColor }}>
                  <stat.icon size={24} />
                </div>
              </div>
              
              <div className="enhanced-card-content">
                <div 
                  className="enhanced-stat-value"
                  style={{ color: stat.valueColor || '#111827' }}
                >
                  {stat.value}
                </div>
                
                {stat.subtitle && (
                  <div className="enhanced-stat-subtitle" style={{ color: stat.valueColor || '#8b5cf6' }}>
                    {stat.subtitle}
                  </div>
                )}
                
                {stat.progressValue !== undefined && (
                  <div className="progress-section">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${stat.progressValue}%`,
                          backgroundColor: stat.progressColor 
                        }}
                      />
                    </div>
                    <div className="progress-text">{stat.goalText}</div>
                  </div>
                )}
                
                {stat.description && (
                  <div className="card-description">{stat.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Original Stats Grid for comparison */}
      <div className="original-stats-section">
        <h2 className="section-title">Original Stats (for comparison)</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Wallet size={28} />
            </div>
            <div>
              <h3 className="stat-title">Total Balance</h3>
              <p className="stat-value">₦125,430</p>
              <span className="stat-change positive">+12.5%</span>
            </div>
          </div>
          {/* Add other original cards as needed */}
        </div>
      </div>

      {/* Dashboard Main Grid */}
      <div className="dashboard-grid">
        <div className="progress-card">📊 Progress Tracker (Demo)</div>
        <div className="tasks-card">✅ Daily Tasks (Demo)</div>
        <div className="transactions-card">💳 Recent Transactions (Demo)</div>
        <div className="quick-actions-card">⚡ Quick Actions (Demo)</div>
      </div>
    </div>
  );
};

export default Dashboard;