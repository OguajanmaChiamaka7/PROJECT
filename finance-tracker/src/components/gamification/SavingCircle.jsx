import React, { useState } from 'react';
import { PiggyBank, Users, Trophy, MessageCircle, Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import '../../styles/SavingCircle.css';


const SavingsCircle = () => {
  const [activeTab, setActiveTab] = useState('circles');

  // Mock data for savings circles
  const savingsCircles = [
    {
      id: 1,
      name: 'Emergency Fund',
      icon: '🚨',
      members: 12,
      currentAmount: 45000,
      goalAmount: 100000,
      yourContribution: 8500,
      progress: 45,
      daysLeft: 180
    },
    {
      id: 2,
      name: 'Vacation Squad',
      icon: '✈️',
      members: 8,
      currentAmount: 120000,
      goalAmount: 200000,
      yourContribution: 15000,
      progress: 60,
      daysLeft: 120
    },
    {
      id: 3,
      name: 'Car Fund Circle',
      icon: '🚗',
      members: 6,
      currentAmount: 125000,
      goalAmount: 500000,
      yourContribution: 20000,
      progress: 25,
      daysLeft: 365
    },
    {
      id: 4,
      name: 'Dream House Fund',
      icon: '🏠',
      members: 15,
      currentAmount: 2500000,
      goalAmount: 5000000,
      yourContribution: 150000,
      progress: 50,
      daysLeft: 730
    }
  ];

  // Mock leaderboard data
  const leaderboard = [
    { id: 1, name: 'Sarah M.', level: 8, points: 2850, badge: '💎' },
    { id: 2, name: 'John K.', level: 7, points: 2340, badge: '🏆' },
    { id: 3, name: 'You', level: 5, points: 1890, badge: '🎯' },
    { id: 4, name: 'Mary L.', level: 6, points: 1750, badge: '⭐' },
    { id: 5, name: 'David R.', level: 4, points: 1620, badge: '🌟' }
  ];

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
          <span>Level 5 Saver</span>
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
              {savingsCircles.map(circle => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
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
              {leaderboard.map((user, index) => (
                <div key={user.id} className={`leaderboard-item ${user.name === 'You' ? 'current-user' : ''}`}>
                  <div className="rank">#{index + 1}</div>
                  <div className="user-info">
                    <span className="badge">{user.badge}</span>
                    <div>
                      <span className="username">{user.name}</span>
                      <span className="user-level">Level {user.level}</span>
                    </div>
                  </div>
                  <div className="points">{user.points} pts</div>
                </div>
              ))}
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