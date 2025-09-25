import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  where
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import './Community.css';

const CommunitySavingsApp = () => {
  const { currentUser } = useAuth();
  const { userStats, addXP } = useGamification();
  const [activeTab, setActiveTab] = useState('status');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [includeChart, setIncludeChart] = useState(false);
  const [includeStreak, setIncludeStreak] = useState(false);

  // Firebase state
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [savingsCircles, setSavingsCircles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Firebase listeners and data fetching
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to status updates
    const statusQuery = query(
      collection(db, 'communityStatus'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    unsubscribers.push(
      onSnapshot(statusQuery, (snapshot) => {
        const updates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setStatusUpdates(updates);
      })
    );

    // Listen to savings circles
    const circlesQuery = query(
      collection(db, 'savingsCircles'),
      where('members', 'array-contains', currentUser.uid)
    );
    unsubscribers.push(
      onSnapshot(circlesQuery, (snapshot) => {
        const circles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavingsCircles(circles);
      })
    );

    // Listen to chat messages
    const chatQuery = query(
      collection(db, 'communityChat'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    unsubscribers.push(
      onSnapshot(chatQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })).reverse();
        setChatMessages(messages);
      })
    );

    // Listen to leaderboard
    const leaderboardQuery = query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      limit(10)
    );
    unsubscribers.push(
      onSnapshot(leaderboardQuery, (snapshot) => {
        const leaders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeaderboard(leaders);
      })
    );

    // Listen to online users count
    const onlineQuery = query(
      collection(db, 'users'),
      where('lastActive', '>', new Date(Date.now() - 5 * 60 * 1000)) // Last 5 minutes
    );
    unsubscribers.push(
      onSnapshot(onlineQuery, (snapshot) => {
        setOnlineCount(snapshot.docs.length);
      })
    );

    setLoading(false);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  // Firebase functions
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'communityChat'), {
        text: newMessage,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        avatar: '🎯',
        createdAt: serverTimestamp()
      });

      setNewMessage('');

      // Award XP for community engagement
      await addXP(5, 'Sent community message');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createStatusUpdate = async () => {
    if (!statusText.trim() || !currentUser) return;

    try {
      const statusData = {
        text: statusText,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userLevel: userStats.level,
        avatar: '🎯',
        includeChart,
        includeStreak,
        reactions: {
          heart: 0,
          fire: 0,
          clap: 0
        },
        comments: [],
        createdAt: serverTimestamp()
      };

      if (includeChart) {
        statusData.progressData = {
          current: userStats.totalSaved || 0,
          goal: userStats.savingsGoal || 100000
        };
      }

      if (includeStreak) {
        statusData.streakData = {
          days: userStats.savingStreak || 0,
          amount: userStats.dailySavingAmount || 500
        };
      }

      await addDoc(collection(db, 'communityStatus'), statusData);

      // Award XP for sharing progress
      await addXP(10, 'Shared progress update');

      setStatusText('');
      setIncludeChart(false);
      setIncludeStreak(false);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error creating status update:', error);
    }
  };

  const reactToPost = async (postId, reactionType) => {
    if (!currentUser) return;

    try {
      const postRef = doc(db, 'communityStatus', postId);
      await updateDoc(postRef, {
        [`reactions.${reactionType}`]: increment(1),
        [`reactedUsers.${reactionType}`]: arrayUnion(currentUser.uid)
      });
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const joinSavingsCircle = async (circleId) => {
    if (!currentUser) return;

    try {
      const circleRef = doc(db, 'savingsCircles', circleId);
      await updateDoc(circleRef, {
        members: arrayUnion(currentUser.uid),
        memberCount: increment(1)
      });

      await addXP(15, 'Joined savings circle');
    } catch (error) {
      console.error('Error joining circle:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'now';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="community-savings-app loading">
        <div className="loading-spinner"></div>
        <p>Loading community...</p>
      </div>
    );
  }

  const StatusUpdatesTab = () => (
    <div className="tab-content">
      <div className="status-header">
        <h2>💫 Community Status Updates</h2>
        <button className="add-status-btn" onClick={() => setShowStatusModal(true)}>
          + Share Your Progress
        </button>
      </div>

      <div className="status-stories">
        <div className="story-item your-story" onClick={() => setShowStatusModal(true)}>
          <div className="story-ring">
            <div className="avatar you-avatar">🎯</div>
          </div>
          <span>Your Story</span>
        </div>

        {statusUpdates.slice(0, 4).map(update => (
          <div key={update.id} className="story-item viewed">
            <div className="story-ring viewed">
              <div className="avatar">{update.avatar}</div>
            </div>
            <span>{update.userName?.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      <div className="status-feed">
        {statusUpdates.length === 0 ? (
          <div className="empty-state">
            <p>No status updates yet. Be the first to share your progress!</p>
          </div>
        ) : (
          statusUpdates.map(update => (
            <div key={update.id} className="status-update">
              <div className="status-header-info">
                <div className="avatar">{update.avatar}</div>
                <div className="status-info">
                  <h3>{update.userName}</h3>
                  <span className="time">{formatTimeAgo(update.createdAt)}</span>
                </div>
                <span className="level-badge">Level {update.userLevel || 1}</span>
              </div>
              <div className="status-content">
                <p>{update.text}</p>
                {update.progressData && (
                  <div className="progress-visual">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{width: `${(update.progressData.current / update.progressData.goal) * 100}%`}}
                      ></div>
                    </div>
                    <span>₦{update.progressData.current?.toLocaleString()} / ₦{update.progressData.goal?.toLocaleString()}</span>
                  </div>
                )}
                {update.streakData && (
                  <div className="streak-visual">
                    <div className="streak-counter">🔥 {update.streakData.days} Day Streak</div>
                    <div className="daily-amount">₦{update.streakData.amount}/day</div>
                  </div>
                )}
              </div>
              <div className="status-reactions">
                <button
                  className="reaction-btn"
                  onClick={() => reactToPost(update.id, 'heart')}
                >
                  ❤️ {update.reactions?.heart || 0}
                </button>
                <button
                  className="reaction-btn"
                  onClick={() => reactToPost(update.id, 'fire')}
                >
                  🔥 {update.reactions?.fire || 0}
                </button>
                <button
                  className="reaction-btn"
                  onClick={() => reactToPost(update.id, 'clap')}
                >
                  👏 {update.reactions?.clap || 0}
                </button>
                <button className="comment-btn">💬 Comment</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const SavingsCirclesTab = () => (
    <div className="tab-content">
      <div className="circles-header">
        <h2>🔄 Your Savings Circles</h2>
        <button className="create-circle-btn">+ Create Circle</button>
      </div>

      <div className="circles-grid">
        {savingsCircles.length === 0 ? (
          <div className="empty-state">
            <p>You haven't joined any savings circles yet. Create one or join existing circles to start saving together!</p>
          </div>
        ) : (
          savingsCircles.map(circle => {
            const userContribution = circle.contributions?.[currentUser?.uid] || 0;
            const progressPercentage = (circle.currentAmount / circle.goalAmount) * 100;

            return (
              <div key={circle.id} className="circle-card">
                <div className="circle-header">
                  <h3>{circle.icon} {circle.name}</h3>
                  <span className="members-count">{circle.memberCount || circle.members?.length || 0} members</span>
                </div>
                <div className="circle-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${Math.min(progressPercentage, 100)}%`}}></div>
                  </div>
                  <div className="progress-text">
                    <span className="current">₦{(circle.currentAmount || 0).toLocaleString()}</span>
                    <span className="goal">Goal: ₦{(circle.goalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="your-contribution">
                    Your contribution: ₦{userContribution.toLocaleString()}
                  </div>
                </div>
                <div className="circle-actions">
                  <button className="contribute-btn">💰 Contribute</button>
                  <button className="chat-btn">💬 Group Chat</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const LeaderboardTab = () => (
    <div className="tab-content">
      <div className="leaderboard-header">
        <h2>🏆 Community Leaderboard</h2>
        <div className="leaderboard-period">
          <button className="period-btn active">This Month</button>
          <button className="period-btn">All Time</button>
        </div>
      </div>

      <div className="leaderboard-list">
        {leaderboard.length === 0 ? (
          <div className="empty-state">
            <p>Leaderboard is loading...</p>
          </div>
        ) : (
          leaderboard.map((user, index) => {
            const isCurrentUser = user.id === currentUser?.uid;
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';

            return (
              <div key={user.id} className={`leaderboard-item ${rankClass} ${isCurrentUser ? 'you' : ''}`}>
                <div className="rank-number">{index + 1}</div>
                <div className={`avatar ${isCurrentUser ? 'you-avatar' : ''}`}>
                  {isCurrentUser ? '🎯' : '😊'}
                </div>
                <div className="player-info">
                  <h3>{isCurrentUser ? 'You' : user.displayName || 'Anonymous'}</h3>
                  <span className="level">Level {user.level || 1}</span>
                </div>
                <div className="xp-amount">{(user.xp || 0).toLocaleString()} XP</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const ChatTab = () => (
    <div className="tab-content">
      <div className="chat-header">
        <h2>💬 Community Chat</h2>
        <div className="online-count">🟢 {onlineCount} online</div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            chatMessages.map((message) => {
              const isCurrentUser = message.userId === currentUser?.uid;
              return (
                <div key={message.id} className={`message ${isCurrentUser ? 'your-message' : 'other-message'}`}>
                  {!isCurrentUser && <div className="avatar">{message.avatar}</div>}
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender">{isCurrentUser ? 'You' : message.userName}</span>
                      <span className="time">{formatTimeAgo(message.createdAt)}</span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                  {isCurrentUser && <div className="avatar you-avatar">{message.avatar}</div>}
                </div>
              );
            })
          )}
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!currentUser}
            />
            <button
              onClick={sendMessage}
              className="send-btn"
              disabled={!currentUser || !newMessage.trim()}
            >
              📤
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const StatusModal = () => (
    showStatusModal && (
      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>📊 Share Your Progress</h2>
            <button className="close-btn" onClick={() => setShowStatusModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <textarea
              placeholder="What's your savings update? Share your progress, goals, or milestones!"
              rows="4"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
            ></textarea>
            <div className="modal-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeChart}
                  onChange={(e) => setIncludeChart(e.target.checked)}
                /> Include progress chart
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeStreak}
                  onChange={(e) => setIncludeStreak(e.target.checked)}
                /> Add savings streak
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={() => setShowStatusModal(false)}>Cancel</button>
            <button
              className="post-btn"
              onClick={createStatusUpdate}
              disabled={!statusText.trim()}
            >
              📸 Post Update
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'status':
        return <StatusUpdatesTab />;
      case 'circles':
        return <SavingsCirclesTab />;
      case 'leaderboard':
        return <LeaderboardTab />;
      case 'chat':
        return <ChatTab />;
      default:
        return <StatusUpdatesTab />;
    }
  };

  return (
    <div className="community-savings-app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>💰 CommunitySave</h1>
          <div className="user-profile">
            <div className="avatar you-avatar">🎯</div>
            <span>{currentUser?.displayName || 'You'} (Level {userStats.level})</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          📊 Status Updates
        </button>
        <button 
          className={`nav-tab ${activeTab === 'circles' ? 'active' : ''}`}
          onClick={() => setActiveTab('circles')}
        >
          🔄 Savings Circles
        </button>
        <button 
          className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Community Chat
        </button>
      </nav>

      {/* Tab Content */}
      {renderActiveTab()}

      {/* Status Modal */}
      <StatusModal />
    </div>
  );
};

export default CommunitySavingsApp;