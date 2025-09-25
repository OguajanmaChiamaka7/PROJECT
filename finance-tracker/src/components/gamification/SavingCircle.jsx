import React, { useState, useEffect } from 'react';
import { PiggyBank, Users, Trophy, MessageCircle, Plus, Target, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSavingsCircle } from '../../context/SavingsCircleContext';
import '../../styles/SavingCircle.css';

const SavingsCircle = () => {
  const [activeTab, setActiveTab] = useState('circles');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const {
    circles,
    leaderboard,
    userStats,
    loadSavingsCircles,
    loadLeaderboard,
    joinCircle,
    createCircle
  } = useSavingsCircle();

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          loadSavingsCircles(),
          loadLeaderboard()
        ]);
      } catch (err) {
        console.error('Error loading savings circle data:', err);
        setError('Failed to load savings circle data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="savings-circle-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading savings circles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="savings-circle-container">
        <div className="error-state">
          <AlertCircle size={48} className="error-icon" />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const CircleCard = ({ circle }) => (
    <div className="circle-card">
      <div className="circle-header">
        <div className="circle-info">
          <span className="circle-icon">{circle.icon}</span>
          <div>
            <h3 className="circle-name">{circle.name}</h3>
            <p className="circle-members">
              <Users size={14} />
              {circle.members} members
            </p>
          </div>
        </div>
        <div className="circle-stats">
          <span className="days-left">{circle.daysLeft} days left</span>
        </div>
      </div>

      <div className="circle-progress">
        <div className="progress-info">
          <span className="current-amount">{formatAmount(circle.currentAmount)}</span>
          <span className="goal-amount">Goal: {formatAmount(circle.goalAmount)}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${circle.progress}%` }}
          ></div>
        </div>
        <div className="contribution-info">
          Your contribution: {formatAmount(circle.yourContribution)}
        </div>
      </div>

      <div className="circle-actions">
        <button className="btn btn-contribute">
          <PiggyBank size={16} />
          Contribute
        </button>
        <button className="btn btn-chat">
          <MessageCircle size={16} />
          Group Chat
        </button>
      </div>
    </div>
  );

  return (
    <div className="savings-circle-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <PiggyBank className="header-icon" />
          <div>
            <h1 className="page-title">CommunitySave</h1>
            <p className="page-subtitle">Build wealth together with trusted friends</p>
          </div>
        </div>
        <div className="user-level">
          <Target className="level-icon" />
          <span>Level {userStats?.level || 1} Saver</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
          onClick={() => setActiveTab('updates')}
        >
          <TrendingUp size={16} />
          Status Updates
        </button>
        <button 
          className={`tab ${activeTab === 'circles' ? 'active' : ''}`}
          onClick={() => setActiveTab('circles')}
        >
          <PiggyBank size={16} />
          Savings Circles
        </button>
        <button 
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={16} />
          Leaderboard
        </button>
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageCircle size={16} />
          Community Chat
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'circles' && (
          <div className="circles-section">
            <div className="section-header">
              <div className="section-title">
                <PiggyBank className="section-icon" />
                <h2>Your Savings Circles</h2>
              </div>
              <button className="btn btn-create">
                <Plus size={16} />
                Create Circle
              </button>
            </div>

            <div className="circles-grid">
              {circles.length === 0 ? (
                <div className="empty-state">
                  <PiggyBank size={48} className="empty-icon" />
                  <h3>No Savings Circles Yet</h3>
                  <p>Join or create your first savings circle to start building wealth with friends!</p>
                  <button className="btn btn-primary">
                    <Plus size={16} />
                    Create Your First Circle
                  </button>
                </div>
              ) : (
                circles.map(circle => (
                  <CircleCard key={circle.id} circle={circle} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <div className="section-header">
              <div className="section-title">
                <Trophy className="section-icon" />
                <h2>Community Leaderboard</h2>
              </div>
            </div>

            <div className="leaderboard-list">
              {leaderboard.length === 0 ? (
                <div className="empty-state">
                  <Trophy size={48} className="empty-icon" />
                  <h3>No Leaderboard Data</h3>
                  <p>Start saving and completing tasks to appear on the leaderboard!</p>
                </div>
              ) : (
                leaderboard.map((user, index) => (
                  <div key={user.id} className={`leaderboard-item ${user.id === currentUser?.uid ? 'current-user' : ''}`}>
                    <div className="rank">#{index + 1}</div>
                    <div className="user-info">
                      <span className="badge">{user.badge || '🏅'}</span>
                      <div>
                        <span className="username">{user.displayName || 'Anonymous User'}</span>
                        <span className="user-level">Level {user.level || 1}</span>
                      </div>
                    </div>
                    <div className="points">{user.xp || 0} XP</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="updates-section">
            <div className="section-header">
              <div className="section-title">
                <TrendingUp className="section-icon" />
                <h2>Recent Updates</h2>
              </div>
            </div>
            <div className="coming-soon">
              <p>Status updates coming soon!</p>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="chat-section">
            <div className="section-header">
              <div className="section-title">
                <MessageCircle className="section-icon" />
                <h2>Community Chat</h2>
              </div>
            </div>
            <div className="coming-soon">
              <p>Community chat coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsCircle;