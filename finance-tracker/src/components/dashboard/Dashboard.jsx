import React, { useEffect, useState } from 'react';
import { Wallet, PiggyBank, Target, Zap, TrendingUp, Award, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTransaction } from '../../context/TransactionContext';
import { useGoals } from '../../context/GoalsContext';
import { useGamification } from '../../context/GamificationContext';
import { DashboardService } from '../../services/dashboardService';
import StatsCard from './StatsCard';
import ProgressBar from './ProgressBar';
import RecentTransactions from './RecentTransactions';
import DailyTasks from './DailyTasks';
import QuickActions from './QuickActions';
import WhoAmI from '../debug/WhoAmI';
import FirebaseTest from '../debug/FirebaseTest';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { getTotalByType, analytics, loadAnalytics } = useTransaction();
  const { goals, getTotalSaved, getTotalTargeted } = useGoals();
  const { userStats, getRecentBadges } = useGamification();

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const data = await DashboardService.getDashboardData(currentUser.uid);
      setDashboardData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    loadDashboardData();
  };

  // Load data on component mount and user change
  useEffect(() => {
    if (currentUser?.uid) {
      loadDashboardData();
      loadAnalytics();
    } else {
      setDashboardData(null);
      setLoading(false);
    }
  }, [currentUser?.uid]);

  // Get stats from dashboard data or fallback to context data
  const stats = dashboardData?.stats || {};
  const balance = stats.balance || currentUser?.balance || 0;
  const monthlyIncome = stats.monthlyIncome || getTotalByType('income', 'month');
  const monthlyExpenses = stats.monthlyExpenses || getTotalByType('expense', 'month');
  const totalSaved = stats.totalSaved || getTotalSaved();
  const totalTargeted = stats.totalTargeted || getTotalTargeted();
  const savingsProgress = stats.savingsProgress || (totalTargeted > 0 ? (totalSaved / totalTargeted) * 100 : 0);

  // Changes from previous month (real data from Firebase)
  const expenseChange = stats.expenseChange || 0;
  const incomeChange = stats.incomeChange || 0;
  const savingsProgressChange = stats.savingsChange || 5.2; // Fallback

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
      change: `${savingsProgressChange >= 0 ? '+' : ''}${savingsProgressChange}%`,
      icon: Target,
      bgColor: "#f0f9ff",
      iconColor: "#0ea5e9",
      changeColor: savingsProgressChange >= 0 ? "#10b981" : "#ef4444"
    },
    {
      title: "XP Points",
      value: (stats.xp || userStats.xp || 0).toLocaleString(),
      change: "+150", // This could be calculated from recent XP gains
      icon: Zap,
      bgColor: "#fefbf2",
      iconColor: "#f59e0b",
      changeColor: "#10b981"
    }
  ];

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Loading your financial dashboard...</h2>
          <p>Fetching your latest data from Firebase</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <AlertCircle size={48} className="error-icon" />
          <h2>Unable to Load Dashboard</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Debug Components - Remove in production */}
      {/* <WhoAmI /> */}
      <FirebaseTest />

      {/* Error Banner (for non-critical errors) */}
      {error && dashboardData && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>Some data may be outdated. Last refresh: {lastRefresh.toLocaleTimeString()}</span>
          <button onClick={handleRefresh} className="refresh-btn">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back, {dashboardData?.userProfile?.displayName || currentUser?.displayName || 'User'}! 👋
          </h1>
          <p className="welcome-subtitle">
            Level {stats.level || userStats.level || 1} • {(stats.xp || userStats.xp || 0).toLocaleString()} XP •
            {stats.completedTasks > 0 && ` ${stats.completedTasks}/${stats.totalTasks} tasks completed •`}
            {' '}Here's your financial overview today.
          </p>
          {dashboardData?.lastUpdated && (
            <p className="last-updated">
              Last updated: {dashboardData.lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="header-actions">
          <button
            onClick={handleRefresh}
            className={`refresh-dashboard-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
            title="Refresh dashboard data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
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