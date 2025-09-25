import React, { useState, useEffect } from 'react';
import './Community.css';

const CommunitySavingsApp = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Sarah Johnson',
      text: 'Just completed my emergency fund! 🎉 Thanks for all the motivation, everyone!',
      time: '10:30 AM',
      avatar: '😊',
      isYou: false
    },
    {
      id: 2,
      sender: 'Michael Chen',
      text: 'Congratulations Sarah! 👏 That\'s amazing!',
      time: '10:32 AM',
      avatar: '😎',
      isYou: false
    },
    {
      id: 3,
      sender: 'You',
      text: 'So inspiring! I\'m halfway to my vacation fund goal 🏝️',
      time: '10:35 AM',
      avatar: '🎯',
      isYou: true
    },
    {
      id: 4,
      sender: 'Emma Davis',
      text: 'Anyone want to start a house deposit circle? 🏠',
      time: '10:38 AM',
      avatar: '👩',
      isYou: false
    },
    {
      id: 5,
      sender: 'John Smith',
      text: 'Count me in Emma! I\'ve been looking for a good savings group',
      time: '10:40 AM',
      avatar: '👨',
      isYou: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(24);

  // Auto-update online count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(20 + Math.floor(Math.random() * 10));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      const message = {
        id: messages.length + 1,
        sender: 'You',
        text: newMessage,
        time: timeString,
        avatar: '🎯',
        isYou: true
      };

      setMessages([...messages, message]);
      setNewMessage('');

      // Simulate response
      setTimeout(() => {
        const responses = [
          { sender: 'Sarah Johnson', text: "That's awesome! Keep it up! 💪", avatar: '😊' },
          { sender: 'Michael Chen', text: "Love the motivation! Let's keep pushing! 🚀", avatar: '😎' },
          { sender: 'Emma Davis', text: "Such inspiring progress! 🌟", avatar: '👩' }
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage = {
          id: messages.length + 2,
          sender: randomResponse.sender,
          text: randomResponse.text,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          avatar: randomResponse.avatar,
          isYou: false
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

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
        
        <div className="story-item viewed">
          <div className="story-ring viewed">
            <div className="avatar">😊</div>
          </div>
          <span>Sarah</span>
        </div>
        
        <div className="story-item unviewed">
          <div className="story-ring unviewed">
            <div className="avatar">😎</div>
          </div>
          <span>Michael</span>
        </div>
        
        <div className="story-item unviewed">
          <div className="story-ring unviewed">
            <div className="avatar">👩</div>
          </div>
          <span>Emma</span>
        </div>
      </div>

      <div className="status-feed">
        <div className="status-update">
          <div className="status-header-info">
            <div className="avatar">😊</div>
            <div className="status-info">
              <h3>Sarah Johnson</h3>
              <span className="time">2 hours ago</span>
            </div>
            <span className="level-badge">Level 7</span>
          </div>
          <div className="status-content">
            <p>🎉 Just hit my emergency fund goal! ₦100,000 saved! Next stop: vacation fund 🏝️</p>
            <div className="progress-visual">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '100%'}}></div>
              </div>
              <span>₦100,000 / ₦100,000</span>
            </div>
          </div>
          <div className="status-reactions">
            <button className="reaction-btn">❤️ 12</button>
            <button className="reaction-btn">🔥 8</button>
            <button className="reaction-btn">👏 15</button>
            <button className="comment-btn">💬 Comment</button>
          </div>
        </div>

        <div className="status-update">
          <div className="status-header-info">
            <div className="avatar">😎</div>
            <div className="status-info">
              <h3>Michael Chen</h3>
              <span className="time">5 hours ago</span>
            </div>
            <span className="level-badge">Level 6</span>
          </div>
          <div className="status-content">
            <p>Consistency is key! 📈 Day 30 of saving ₦500 daily. Small steps, big dreams!</p>
            <div className="streak-visual">
              <div className="streak-counter">🔥 30 Day Streak</div>
              <div className="daily-amount">₦500/day</div>
            </div>
          </div>
          <div className="status-reactions">
            <button className="reaction-btn">💪 20</button>
            <button className="reaction-btn">🔥 5</button>
            <button className="comment-btn">💬 Comment</button>
          </div>
        </div>

        <div className="status-update">
          <div className="status-header-info">
            <div className="avatar">👩</div>
            <div className="status-info">
              <h3>Emma Davis</h3>
              <span className="time">1 day ago</span>
            </div>
            <span className="level-badge">Level 4</span>
          </div>
          <div className="status-content">
            <p>Joined my first savings circle today! 🤝 Excited to save for my dream car with amazing people!</p>
            <div className="circle-preview">
              <span className="circle-name">🚗 Car Fund Circle</span>
              <span className="circle-members">8 members</span>
            </div>
          </div>
          <div className="status-reactions">
            <button className="reaction-btn">🎉 18</button>
            <button className="reaction-btn">👏 10</button>
            <button className="comment-btn">💬 Comment</button>
          </div>
        </div>
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
        <div className="circle-card">
          <div className="circle-header">
            <h3>🚨 Emergency Fund</h3>
            <span className="members-count">12 members</span>
          </div>
          <div className="circle-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '45%'}}></div>
            </div>
            <div className="progress-text">
              <span className="current">₦45,000</span>
              <span className="goal">Goal: ₦100,000</span>
            </div>
            <div className="your-contribution">Your contribution: ₦8,500</div>
          </div>
          <div className="circle-actions">
            <button className="contribute-btn">💰 Contribute</button>
            <button className="chat-btn">💬 Group Chat</button>
          </div>
        </div>

        <div className="circle-card">
          <div className="circle-header">
            <h3>🏝️ Vacation Squad</h3>
            <span className="members-count">8 members</span>
          </div>
          <div className="circle-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '60%'}}></div>
            </div>
            <div className="progress-text">
              <span className="current">₦120,000</span>
              <span className="goal">Goal: ₦200,000</span>
            </div>
            <div className="your-contribution">Your contribution: ₦15,000</div>
          </div>
          <div className="circle-actions">
            <button className="contribute-btn">💰 Contribute</button>
            <button className="chat-btn">💬 Group Chat</button>
          </div>
        </div>

        <div className="circle-card">
          <div className="circle-header">
            <h3>🚗 Car Fund Circle</h3>
            <span className="members-count">6 members</span>
          </div>
          <div className="circle-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '25%'}}></div>
            </div>
            <div className="progress-text">
              <span className="current">₦125,000</span>
              <span className="goal">Goal: ₦500,000</span>
            </div>
            <div className="your-contribution">Your contribution: ₦20,000</div>
          </div>
          <div className="circle-actions">
            <button className="contribute-btn">💰 Contribute</button>
            <button className="chat-btn">💬 Group Chat</button>
          </div>
        </div>
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
        <div className="leaderboard-item rank-1">
          <div className="rank-number">1</div>
          <div className="avatar">😊</div>
          <div className="player-info">
            <h3>Sarah Johnson</h3>
            <span className="level">Level 7</span>
          </div>
          <div className="xp-amount">4,250 XP</div>
        </div>
        
        <div className="leaderboard-item rank-2">
          <div className="rank-number">2</div>
          <div className="avatar">😎</div>
          <div className="player-info">
            <h3>Michael Chen</h3>
            <span className="level">Level 6</span>
          </div>
          <div className="xp-amount">3,890 XP</div>
        </div>
        
        <div className="leaderboard-item rank-3 you">
          <div className="rank-number">3</div>
          <div className="avatar you-avatar">🎯</div>
          <div className="player-info">
            <h3>You</h3>
            <span className="level">Level 5</span>
          </div>
          <div className="xp-amount">2,340 XP</div>
        </div>
        
        <div className="leaderboard-item">
          <div className="rank-number">4</div>
          <div className="avatar">👩</div>
          <div className="player-info">
            <h3>Emma Davis</h3>
            <span className="level">Level 4</span>
          </div>
          <div className="xp-amount">2,100 XP</div>
        </div>
        
        <div className="leaderboard-item">
          <div className="rank-number">5</div>
          <div className="avatar">👨</div>
          <div className="player-info">
            <h3>John Smith</h3>
            <span className="level">Level 4</span>
          </div>
          <div className="xp-amount">1,850 XP</div>
        </div>
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
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.isYou ? 'your-message' : 'other-message'}`}>
              {!message.isYou && <div className="avatar">{message.avatar}</div>}
              <div className="message-content">
                <div className="message-header">
                  <span className="sender">{message.sender}</span>
                  <span className="time">{message.time}</span>
                </div>
                <p>{message.text}</p>
              </div>
              {message.isYou && <div className="avatar you-avatar">{message.avatar}</div>}
            </div>
          ))}
        </div>
        
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="send-btn">📤</button>
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
            <textarea placeholder="What's your savings update? Share your progress, goals, or milestones!" rows="4"></textarea>
            <div className="modal-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Include progress chart
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> Add savings streak
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={() => setShowStatusModal(false)}>Cancel</button>
            <button className="post-btn">📸 Post Update</button>
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
            <span>You (Level 5)</span>
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