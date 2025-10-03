// import React, { useState, useEffect } from 'react';
// import { db } from '../../services/firebase';
// import {
//   collection,
//   doc,
//   addDoc,
//   updateDoc,
//   onSnapshot,
//   query,
//   orderBy,
//   limit,
//   serverTimestamp,
//   increment,
//   arrayUnion,
//   where
// } from 'firebase/firestore';
// import { useAuth } from '../../context/AuthContext';
// import { useGamification } from '../../context/GamificationContext';
// import './Community.css';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Send, TrendingUp, Users, Award, MessageCircle, ArrowLeft, Check, CheckCheck, Flame, Target, Trophy, Star, Zap, Crown } from 'lucide-react';
import './Community.css';
import { db } from '../../services/firebase';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';

const CommunitySavingsApp = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [statusText, setStatusText] = useState('');
  const chatEndRef = useRef(null);

  // Mock data - replace with Firebase data
  const [myStatus, setMyStatus] = useState({
    viewed: false,
    hasStatus: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    progress: 65,
    saved: 325000,
    goal: 500000,
    streak: 12
  });

  const [statuses, setStatuses] = useState([
    {
      id: 1,
      userName: 'Sarah Johnson',
      avatar: '👩',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      viewed: false,
      progress: 80,
      saved: 800000,
      goal: 1000000,
      streak: 30,
      text: 'Just hit 80% of my goal! Consistency is key!'
    },
    {
      id: 2,
      userName: 'Michael Chen',
      avatar: '👨',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      viewed: true,
      progress: 45,
      saved: 225000,
      goal: 500000,
      streak: 15,
      text: 'Halfway there! Small wins add up.'
    }
  ]);

  const [savingsCircles, setSavingsCircles] = useState([
    {
      id: 1,
      name: 'Family Vacation Fund',
      icon: '✈️',
      members: 5,
      lastMessage: 'Great job everyone! We are 75% there',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      unread: 3,
      progress: 75,
      currentAmount: 750000,
      goalAmount: 1000000,
      messages: [
        { id: 1, userId: 'other', userName: 'John', text: 'Just added my contribution for this month!', timestamp: new Date(Date.now() - 60 * 60 * 1000), read: true },
        { id: 2, userId: 'me', text: 'Amazing! We are making great progress', timestamp: new Date(Date.now() - 30 * 60 * 1000), read: true },
        { id: 3, userId: 'other', userName: 'Sarah', text: 'Great job everyone! We are 75% there', timestamp: new Date(Date.now() - 10 * 60 * 1000), read: false }
      ]
    },
    {
      id: 2,
      name: 'Emergency Fund Squad',
      icon: '🏥',
      members: 8,
      lastMessage: 'Remember to save this week!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: 0,
      progress: 60,
      currentAmount: 480000,
      goalAmount: 800000,
      messages: [
        { id: 1, userId: 'other', userName: 'Mike', text: 'This is such a great idea!', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), read: true },
        { id: 2, userId: 'other', userName: 'Lisa', text: 'Remember to save this week!', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: true }
      ]
    },
    {
      id: 3,
      name: 'New Business Fund',
      icon: '💼',
      members: 3,
      lastMessage: 'You: Added my weekly contribution',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: 0,
      progress: 35,
      currentAmount: 175000,
      goalAmount: 500000,
      messages: [
        { id: 1, userId: 'me', text: 'Added my weekly contribution', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), read: true }
      ]
    }
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'You', level: 12, xp: 2450, avatar: '🎯', isYou: true },
    { rank: 2, name: 'Sarah Johnson', level: 11, xp: 2200, avatar: '👩' },
    { rank: 3, name: 'Michael Chen', level: 10, xp: 1980, avatar: '👨' },
    { rank: 4, name: 'Lisa Wang', level: 9, xp: 1750, avatar: '👱‍♀️' },
    { rank: 5, name: 'David Kim', level: 8, xp: 1520, avatar: '👨‍💼' }
  ]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat, newMessage]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Yesterday';
    return `${days}d`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const updatedCircles = savingsCircles.map(circle => {
      if (circle.id === selectedChat.id) {
        return {
          ...circle,
          messages: [...circle.messages, {
            id: circle.messages.length + 1,
            userId: 'me',
            text: newMessage,
            timestamp: new Date(),
            read: false
          }],
          lastMessage: `You: ${newMessage}`,
          timestamp: new Date()
        };
      }
      return circle;
    });

    setSavingsCircles(updatedCircles);
    setSelectedChat(updatedCircles.find(c => c.id === selectedChat.id));
    setNewMessage('');
  };

  const StatusesTab = () => (
    <div className="statuses-container">
      <div className="my-status-container" onClick={() => setShowStatusModal(true)}>
        <div className={`status-ring ${myStatus.hasStatus && !myStatus.viewed ? 'unviewed' : 'viewed'}`}>
          <div className="status-avatar my-avatar">
            <Camera size={20} color="white" />
          </div>
        </div>
        <div className="status-info">
          <h3>My Status</h3>
          <p>{myStatus.hasStatus ? formatTimeAgo(myStatus.timestamp) : 'Tap to add status update'}</p>
        </div>
        <Plus size={20} color="#10b981" />
      </div>

      <div className="recent-updates-label">
        <p>Recent updates</p>
      </div>

      {statuses.map(status => (
        <div key={status.id} className="status-item" onClick={() => alert('View status')}>
          <div className={`status-ring ${!status.viewed ? 'unviewed' : 'viewed'}`}>
            <div className="status-avatar">{status.avatar}</div>
          </div>
          <div className="status-info">
            <h3>{status.userName}</h3>
            <p>{formatTimeAgo(status.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const ChatsTab = () => (
    <div className="chats-container">
      {savingsCircles.map(circle => (
        <div
          key={circle.id}
          className="chat-item"
          onClick={() => setSelectedChat(circle)}
        >
          <div className="chat-avatar">{circle.icon}</div>
          <div className="chat-info">
            <div className="chat-header">
              <h3>{circle.name}</h3>
              <span className="chat-time">{formatTimeAgo(circle.timestamp)}</span>
            </div>
            <div className="chat-preview">
              <p>{circle.lastMessage}</p>
              {circle.unread > 0 && (
                <div className="unread-badge">{circle.unread}</div>
              )}
            </div>
          </div>
        </div>
      ))}

      <button className="fab" onClick={() => setShowCreateCircle(true)}>
        <Plus size={24} color="white" />
      </button>
    </div>
  );

  const LeaderboardTab = () => (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>Top Savers This Month</h2>
        <Award size={24} color="#10b981" />
      </div>
      
      {leaderboard.map(user => (
        <div key={user.rank} className={`leaderboard-item ${user.isYou ? 'you' : ''}`}>
          <div className={`rank-badge ${user.rank <= 3 ? `top-${user.rank}` : ''}`}>
            {user.rank}
          </div>
          <div className="user-avatar">{user.avatar}</div>
          <div className="user-info">
            <h3>{user.name}</h3>
            <p>Level {user.level}</p>
          </div>
          <div className="xp-badge">{user.xp.toLocaleString()} XP</div>
        </div>
      ))}
    </div>
  );

  const ChatView = () => {
    if (!selectedChat) return null;

    return (
      <div className="chat-view">
        <div className="chat-view-header">
          <button className="back-btn" onClick={() => setSelectedChat(null)}>←</button>
          <div className="chat-avatar">{selectedChat.icon}</div>
          <div className="chat-header-info">
            <h3>{selectedChat.name}</h3>
            <p>{selectedChat.members} members</p>
          </div>
        </div>

        <div className="progress-banner">
          <div className="progress-info">
            <TrendingUp size={16} color="#10b981" />
            <span>₦{selectedChat.currentAmount.toLocaleString()} / ₦{selectedChat.goalAmount.toLocaleString()}</span>
          </div>
          <div className="progress-bar-mini">
            <div className="progress-fill-mini" style={{ width: `${selectedChat.progress}%` }} />
          </div>
        </div>

        <div className="chat-messages">
          {selectedChat.messages.map(msg => (
            <div key={msg.id} className={`message ${msg.userId === 'me' ? 'my-message' : 'other-message'}`}>
              {msg.userId !== 'me' && <p className="message-sender">{msg.userName}</p>}
              <div className="message-bubble">
                <p>{msg.text}</p>
                <div className="message-meta">
                  <span>{formatTimeAgo(msg.timestamp)}</span>
                  {msg.userId === 'me' && (
                    msg.read ? <CheckCheck size={14} color="#10b981" /> : <Check size={14} color="#9ca3af" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input">
          <button className="attach-btn">
            <Plus size={20} color="#10b981" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
          />
          <button className="send-btn" onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send size={20} color="white" />
          </button>
        </div>
      </div>
    );
  };

  const StatusModal = () => {
    if (!showStatusModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Share Your Progress</h2>
            <button onClick={() => setShowStatusModal(false)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="status-preview">
              <div className="progress-card">
                <div className="progress-circle">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${myStatus.progress}, 100`}
                    />
                  </svg>
                  <div className="progress-text">{myStatus.progress}%</div>
                </div>
                <div className="progress-details">
                  <p className="saved-amount">₦{myStatus.saved.toLocaleString()}</p>
                  <p className="goal-amount">Goal: ₦{myStatus.goal.toLocaleString()}</p>
                  <div className="streak-badge">
                    🔥 {myStatus.streak} day streak
                  </div>
                </div>
              </div>
            </div>
            <textarea
              placeholder="Add a caption... (optional)"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={() => setShowStatusModal(false)}>
              Cancel
            </button>
            <button className="share-btn" onClick={() => {
              alert('Status shared!');
              setShowStatusModal(false);
              setStatusText('');
            }}>
              Share Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CreateCircleModal = () => {
    if (!showCreateCircle) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowCreateCircle(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Create Savings Circle</h2>
            <button onClick={() => setShowCreateCircle(false)}>✕</button>
          </div>
          <div className="modal-body">
            <input type="text" placeholder="Circle name" className="input-field" />
            <input type="text" placeholder="Goal amount (₦)" className="input-field" />
            <textarea placeholder="Description" rows={3} />
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={() => setShowCreateCircle(false)}>
              Cancel
            </button>
            <button className="share-btn" onClick={() => {
              alert('Circle created!');
              setShowCreateCircle(false);
            }}>
              Create Circle
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {selectedChat ? (
        <ChatView />
      ) : (
        <>
          <div className="app-header">
            <h1>MoniUp Community</h1>
          </div>

          <div className="tab-bar">
            <button
              className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
              onClick={() => setActiveTab('chats')}
            >
              <MessageCircle size={20} />
              <span>Circles</span>
            </button>
            <button
              className={`tab ${activeTab === 'status' ? 'active' : ''}`}
              onClick={() => setActiveTab('status')}
            >
              <TrendingUp size={20} />
              <span>Status</span>
            </button>
            <button
              className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Award size={20} />
              <span>Leaderboard</span>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'chats' && <ChatsTab />}
            {activeTab === 'status' && <StatusesTab />}
            {activeTab === 'leaderboard' && <LeaderboardTab />}
          </div>
        </>
      )}

      <StatusModal />
      <CreateCircleModal />
    </div>
  );
};

export default CommunitySavingsApp;