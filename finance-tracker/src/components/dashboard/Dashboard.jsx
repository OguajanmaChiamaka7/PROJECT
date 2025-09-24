import React, { useEffect, useState } from 'react';
import { Wallet, PiggyBank, Target, Zap, TrendingUp, Award, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTransaction } from '../../context/TransactionContext';
import { useGoals } from '../../context/GoalsContext';
import { useGamification } from '../../context/GamificationContext';
import StatsCard from './StatsCard';
import ProgressBar from './ProgressBar';
import RecentTransactions from './RecentTransactions';
import DailyTasks from './DailyTasks';
import QuickActions from './QuickActions';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { getTotalByType, analytics, loadAnalytics } = useTransaction();
  const { goals, getTotalSaved, getTotalTargeted } = useGoals();
  const { userStats, getRecentBadges } = useGamification();

  // Load analytics on component mount
  useEffect(() => {
    if (currentUser?.uid) {
      loadAnalytics();
    }
  }, [currentUser?.uid]);

  // Calculate real-time stats
  const balance = currentUser?.balance || 0;
  const monthlyIncome = getTotalByType('income', 'month');
  const monthlyExpenses = getTotalByType('expense', 'month');
  const totalSaved = getTotalSaved();
  const totalTargeted = getTotalTargeted();
  const savingsProgress = totalTargeted > 0 ? (totalSaved / totalTargeted) * 100 : 0;

  // Previous month comparison (mock for now - you can implement this with analytics)
  const previousMonthExpenses = monthlyExpenses * 0.92; // Mock 8% increase
  const expenseChange = previousMonthExpenses > 0
    ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses * 100).toFixed(1)
    : 0;

  const quickStatsData = [
    {
      title: "Total Balance",
      value: `₦${balance.toLocaleString()}`,
      change: "+12.5%", // This could be calculated from analytics
      icon: Wallet,
      bgColor: "#f0fdf4",
      iconColor: "#10b981",
      changeColor: "#10b981"
    },
    {
      title: "This Month",
      value: `₦${monthlyExpenses.toLocaleString()}`,
      change: `${expenseChange >= 0 ? '+' : ''}${expenseChange}%`,
      icon: TrendingUp,
      bgColor: expenseChange >= 0 ? "#fef3f2" : "#f0fdf4",
      iconColor: expenseChange >= 0 ? "#ef4444" : "#10b981",
      changeColor: expenseChange >= 0 ? "#ef4444" : "#10b981"
    },
    {
      title: "Savings Goal",
      value: `${Math.round(savingsProgress)}%`,
      change: "+5.2%", // This could be calculated from goals progress
      icon: Target,
      bgColor: "#f0f9ff",
      iconColor: "#0ea5e9",
      changeColor: "#10b981"
    },
    {
      title: "XP Points",
      value: userStats.xp.toLocaleString(),
      change: "+150", // This could be calculated from recent XP gains
      icon: Zap,
      bgColor: "#fefbf2",
      iconColor: "#f59e0b",
      changeColor: "#10b981"
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back, {currentUser?.displayName || 'User'}! 👋
          </h1>
          <p className="welcome-subtitle">
            Level {userStats.level} • {userStats.xp} XP • Here's your financial overview today.
          </p>
        </div>
        <div className="header-actions">
          <div className="date-display">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-section">
        <div className="quick-stats-grid">
          {quickStatsData.map((stat, index) => (
            <div
              key={index}
              className="quick-stat-card"
              style={{ backgroundColor: stat.bgColor }}
            >
              <div className="stat-header">
                <div className="stat-info">
                  <h3 className="stat-title">{stat.title}</h3>
                  <div className="stat-value">{stat.value}</div>
                </div>
                <div className="stat-icon" style={{ color: stat.iconColor }}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="stat-footer">
                <span
                  className={`stat-change ${stat.changeColor === '#10b981' ? 'positive' : 'negative'}`}
                  style={{ color: stat.changeColor }}
                >
                  {stat.change}
                </span>
                <span className="stat-period">vs last month</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Progress & Goals Card */}
          <div className="dashboard-card progress-goals-card">
            <div className="card-header">
              <h3 className="card-title">Progress & Goals</h3>
              <button className="card-action">View All</button>
            </div>
            <div className="card-content">
              <ProgressBar />
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="dashboard-card transactions-card">
            <div className="card-header">
              <h3 className="card-title">Recent Transactions</h3>
              <button className="card-action">View All</button>
            </div>
            <div className="card-content">
              <RecentTransactions />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Daily Tasks Card */}
          <div className="dashboard-card tasks-card">
            <div className="card-header">
              <h3 className="card-title">Daily Tasks</h3>
              <span className="tasks-count">3 pending</span>
            </div>
            <div className="card-content">
              <DailyTasks />
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="dashboard-card quick-actions-card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-content">
              <QuickActions />
            </div>
          </div>

          {/* Achievement Card */}
          <div className="dashboard-card achievement-card">
            <div className="card-header">
              <h3 className="card-title">Latest Achievement</h3>
            </div>
            <div className="card-content">
              <div className="achievement-content">
                {getRecentBadges(1).length > 0 ? (
                  <>
                    <div className="achievement-icon">
                      {getRecentBadges(1)[0].icon}
                    </div>
                    <div className="achievement-text">
                      <h4>{getRecentBadges(1)[0].name}</h4>
                      <p>{getRecentBadges(1)[0].description}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="achievement-icon">🎯</div>
                    <div className="achievement-text">
                      <h4>Get Started</h4>
                      <p>Complete your first transaction to earn your first badge!</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;