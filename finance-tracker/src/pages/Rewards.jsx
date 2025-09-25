import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  Target,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Gift,
  CheckCircle,
  Lock,
  Flame,
  Zap,
  Crown,
  Medal,
  Coins,
  Timer,
  BarChart3,
  Plus,
  ArrowUp,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransaction } from '../context/TransactionContext';
import { useGoals } from '../context/GoalsContext';
import { useGamification } from '../context/GamificationContext';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/Rewards.css';

const Rewards = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRewards, setUserRewards] = useState({
    totalXP: 0,
    currentLevel: 1,
    streakDays: 0,
    completedChallenges: [],
    earnedBadges: [],
    weeklyProgress: 0,
    monthlyGoals: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const { transactions } = useTransaction();
  const { goals } = useGoals();
  const { userStats } = useGamification();

  // Sample challenges and rewards data
  const weeklyRewards = [
    {
      id: 1,
      title: 'Transaction Tracker',
      description: 'Add 5 transactions this week',
      xpReward: 50,
      type: 'weekly',
      icon: Plus,
      progress: 3,
      target: 5,
      completed: false,
      category: 'transactions'
    },
    {
      id: 2,
      title: 'Goal Setter',
      description: 'Create 2 new financial goals',
      xpReward: 100,
      type: 'weekly',
      icon: Target,
      progress: 1,
      target: 2,
      completed: false,
      category: 'goals'
    },
    {
      id: 3,
      title: 'Streak Master',
      description: 'Maintain 7-day activity streak',
      xpReward: 150,
      type: 'weekly',
      icon: Flame,
      progress: 4,
      target: 7,
      completed: false,
      category: 'streak'
    }
  ];

  const monthlyRewards = [
    {
      id: 4,
      title: 'Savings Champion',
      description: 'Save ₦50,000 this month',
      xpReward: 500,
      type: 'monthly',
      icon: Trophy,
      progress: 32000,
      target: 50000,
      completed: false,
      category: 'savings'
    },
    {
      id: 5,
      title: 'Budget Master',
      description: 'Stay within budget for the month',
      xpReward: 300,
      type: 'monthly',
      icon: BarChart3,
      progress: 85,
      target: 100,
      completed: false,
      category: 'budget'
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first transaction',
      icon: Star,
      xpReward: 25,
      unlocked: true,
      category: 'milestone'
    },
    {
      id: 2,
      title: 'Goal Achiever',
      description: 'Complete your first financial goal',
      icon: Target,
      xpReward: 100,
      unlocked: false,
      category: 'milestone'
    },
    {
      id: 3,
      title: 'Consistency King',
      description: 'Maintain 30-day streak',
      icon: Crown,
      xpReward: 1000,
      unlocked: false,
      category: 'streak'
    },
    {
      id: 4,
      title: 'Investment Explorer',
      description: 'Add your first investment',
      icon: TrendingUp,
      xpReward: 200,
      unlocked: false,
      category: 'investment'
    }
  ];

  const levelBenefits = [
    {
      level: 1,
      title: 'Beginner',
      minXP: 0,
      benefits: ['Access to basic features', 'Transaction tracking', 'Goal setting'],
      color: '#10b981'
    },
    {
      level: 2,
      title: 'Explorer',
      minXP: 500,
      benefits: ['Analytics dashboard', 'Budget categories', 'Progress reports'],
      color: '#3b82f6'
    },
    {
      level: 3,
      title: 'Achiever',
      minXP: 1500,
      benefits: ['Investment tracking', 'Advanced goals', 'Custom categories'],
      color: '#8b5cf6'
    },
    {
      level: 4,
      title: 'Expert',
      minXP: 3000,
      benefits: ['Portfolio analysis', 'Automated insights', 'Priority support'],
      color: '#f59e0b'
    },
    {
      level: 5,
      title: 'Master',
      minXP: 6000,
      benefits: ['All features unlocked', 'Custom reports', 'Expert consultation'],
      color: '#ef4444'
    }
  ];

  useEffect(() => {
    if (currentUser) {
      loadRewardsData();
      loadLeaderboard();
      calculateProgress();
    }
  }, [currentUser, transactions, goals, userStats]);

  const loadRewardsData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load user rewards data from Firebase
      const rewardsQuery = query(
        collection(db, 'userRewards'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(rewardsQuery);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserRewards(prevRewards => ({ ...prevRewards, ...data }));
      }

      // Load challenges
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const challengesSnapshot = await getDocs(challengesQuery);
      const challengesData = challengesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setChallenges(challengesData);
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboardQuery = query(
        collection(db, 'users'),
        orderBy('totalXP', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(leaderboardQuery);
      const leaderboardData = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: doc.id,
          rank: index + 1,
          name: data.displayName || data.email?.split('@')[0] || 'Anonymous',
          xp: data.totalXP || userStats?.totalXP || 0,
          level: data.currentLevel || userStats?.level || 1,
          streak: data.streakDays || userStats?.streak || 0,
          isCurrentUser: doc.id === currentUser?.uid
        };
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const calculateProgress = () => {
    if (!transactions || !goals) return;

    // Calculate weekly progress based on transactions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyTransactions = transactions.filter(t =>
      new Date(t.date) >= oneWeekAgo
    );

    // Update local state with calculated progress
    setUserRewards(prev => ({
      ...prev,
      totalXP: userStats?.totalXP || 0,
      currentLevel: userStats?.level || 1,
      streakDays: userStats?.streak || 0,
      weeklyProgress: weeklyTransactions.length
    }));
  };

  const claimReward = async (rewardId, xpAmount) => {
    if (!currentUser) return;

    try {
      // Update user's XP and level
      const userRef = doc(db, 'users', currentUser.uid);
      const newXP = (userStats?.totalXP || 0) + xpAmount;
      const newLevel = calculateLevel(newXP);

      await updateDoc(userRef, {
        totalXP: newXP,
        currentLevel: newLevel,
        updatedAt: Timestamp.now()
      });

      // Mark reward as claimed
      const rewardsRef = doc(db, 'userRewards', currentUser.uid);
      await updateDoc(rewardsRef, {
        completedChallenges: [...(userRewards.completedChallenges || []), rewardId],
        updatedAt: Timestamp.now()
      });

      // Show success message or notification
      alert(`Congratulations! You earned ${xpAmount} XP!`);

      // Reload data
      loadRewardsData();
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const calculateLevel = (xp) => {
    for (let i = levelBenefits.length - 1; i >= 0; i--) {
      if (xp >= levelBenefits[i].minXP) {
        return i + 1;
      }
    }
    return 1;
  };

  const getCurrentLevelInfo = () => {
    const currentLevel = userRewards.currentLevel || 1;
    const currentXP = userRewards.totalXP || 0;
    const currentLevelData = levelBenefits[currentLevel - 1];
    const nextLevelData = levelBenefits[currentLevel];

    if (!nextLevelData) {
      return {
        ...currentLevelData,
        progress: 100,
        xpToNext: 0,
        xpInLevel: currentXP - currentLevelData.minXP
      };
    }

    const xpInLevel = currentXP - currentLevelData.minXP;
    const xpToNext = nextLevelData.minXP - currentXP;
    const progress = (xpInLevel / (nextLevelData.minXP - currentLevelData.minXP)) * 100;

    return {
      ...currentLevelData,
      nextLevel: nextLevelData,
      progress: Math.min(progress, 100),
      xpToNext,
      xpInLevel
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderProgressBar = (progress, target, color = '#10b981') => (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min((progress / target) * 100, 100)}%`,
            backgroundColor: color
          }}
        />
      </div>
      <div className="progress-text">
        <span>{progress} / {target}</span>
        <span>{Math.round((progress / target) * 100)}%</span>
      </div>
    </div>
  );

  const currentLevelInfo = getCurrentLevelInfo();

  if (loading) {
    return (
      <div className="rewards-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <Trophy className="header-icon" />
          <div>
            <h1 className="page-title">Rewards & Achievements</h1>
            <p className="page-subtitle">Track your progress and earn rewards</p>
          </div>
        </div>
        <div className="level-indicator">
          <div className="level-badge" style={{ backgroundColor: currentLevelInfo.color }}>
            <Crown size={20} />
            <span>Level {userRewards.currentLevel}</span>
          </div>
          <div className="xp-display">
            <Coins size={16} />
            <span>{userRewards.totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="level-progress-card">
        <div className="level-info">
          <div className="current-level">
            <h3>{currentLevelInfo.title}</h3>
            <p>Level {userRewards.currentLevel}</p>
          </div>
          {currentLevelInfo.nextLevel && (
            <div className="next-level">
              <h4>Next: {currentLevelInfo.nextLevel.title}</h4>
              <p>{currentLevelInfo.xpToNext} XP to go</p>
            </div>
          )}
        </div>
        <div className="level-progress">
          <div className="progress-bar level-bar">
            <div
              className="progress-fill"
              style={{
                width: `${currentLevelInfo.progress}%`,
                backgroundColor: currentLevelInfo.color
              }}
            />
          </div>
        </div>
        <div className="level-benefits">
          <h4>Current Benefits:</h4>
          <ul>
            {currentLevelInfo.benefits.map((benefit, index) => (
              <li key={index}>
                <CheckCircle size={14} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'challenges', label: 'Challenges', icon: Target },
          { key: 'achievements', label: 'Achievements', icon: Award },
          { key: 'leaderboard', label: 'Leaderboard', icon: Trophy }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Flame size={24} />
                </div>
                <div className="stat-content">
                  <h3>Activity Streak</h3>
                  <div className="stat-value">{userRewards.streakDays} days</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Target size={24} />
                </div>
                <div className="stat-content">
                  <h3>Goals Completed</h3>
                  <div className="stat-value">{goals?.filter(g => g.progress >= 100).length || 0}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-content">
                  <h3>Achievements</h3>
                  <div className="stat-value">{achievements.filter(a => a.unlocked).length}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>Rank</h3>
                  <div className="stat-value">#{leaderboard.find(u => u.isCurrentUser)?.rank || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon completed">
                    <Plus size={16} />
                  </div>
                  <div className="activity-content">
                    <span>Added new transaction</span>
                    <small>+10 XP • 2 hours ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon completed">
                    <Target size={16} />
                  </div>
                  <div className="activity-content">
                    <span>Updated savings goal</span>
                    <small>+25 XP • 1 day ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon completed">
                    <CheckCircle size={16} />
                  </div>
                  <div className="activity-content">
                    <span>Completed weekly challenge</span>
                    <small>+150 XP • 3 days ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="challenges-section">
            <div className="challenges-grid">
              <div className="challenge-group">
                <h3>Weekly Challenges</h3>
                {weeklyRewards.map((challenge) => {
                  const Icon = challenge.icon;
                  const completed = challenge.progress >= challenge.target;
                  const claimed = userRewards.completedChallenges?.includes(challenge.id);

                  return (
                    <div key={challenge.id} className={`challenge-card ${completed ? 'completed' : ''} ${claimed ? 'claimed' : ''}`}>
                      <div className="challenge-header">
                        <div className="challenge-icon">
                          <Icon size={20} />
                        </div>
                        <div className="challenge-info">
                          <h4>{challenge.title}</h4>
                          <p>{challenge.description}</p>
                        </div>
                        <div className="challenge-reward">
                          <Coins size={16} />
                          <span>{challenge.xpReward} XP</span>
                        </div>
                      </div>

                      {renderProgressBar(challenge.progress, challenge.target)}

                      <div className="challenge-actions">
                        {completed && !claimed ? (
                          <button
                            className="btn btn-primary"
                            onClick={() => claimReward(challenge.id, challenge.xpReward)}
                          >
                            <Gift size={16} />
                            Claim Reward
                          </button>
                        ) : claimed ? (
                          <button className="btn btn-success" disabled>
                            <CheckCircle size={16} />
                            Claimed
                          </button>
                        ) : (
                          <div className="challenge-progress-text">
                            {challenge.target - challenge.progress} more to go
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="challenge-group">
                <h3>Monthly Challenges</h3>
                {monthlyRewards.map((challenge) => {
                  const Icon = challenge.icon;
                  const completed = challenge.progress >= challenge.target;
                  const claimed = userRewards.completedChallenges?.includes(challenge.id);

                  return (
                    <div key={challenge.id} className={`challenge-card ${completed ? 'completed' : ''} ${claimed ? 'claimed' : ''}`}>
                      <div className="challenge-header">
                        <div className="challenge-icon">
                          <Icon size={20} />
                        </div>
                        <div className="challenge-info">
                          <h4>{challenge.title}</h4>
                          <p>{challenge.description}</p>
                        </div>
                        <div className="challenge-reward">
                          <Coins size={16} />
                          <span>{challenge.xpReward} XP</span>
                        </div>
                      </div>

                      {challenge.category === 'savings' ?
                        renderProgressBar(challenge.progress, challenge.target) :
                        renderProgressBar(challenge.progress, challenge.target)
                      }

                      <div className="challenge-actions">
                        {completed && !claimed ? (
                          <button
                            className="btn btn-primary"
                            onClick={() => claimReward(challenge.id, challenge.xpReward)}
                          >
                            <Gift size={16} />
                            Claim Reward
                          </button>
                        ) : claimed ? (
                          <button className="btn btn-success" disabled>
                            <CheckCircle size={16} />
                            Claimed
                          </button>
                        ) : (
                          <div className="challenge-progress-text">
                            {challenge.category === 'savings' ?
                              formatCurrency(challenge.target - challenge.progress) + ' more to save' :
                              `${challenge.target - challenge.progress}% more to go`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-section">
            <div className="achievements-grid">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                const unlocked = achievement.unlocked;

                return (
                  <div key={achievement.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}>
                    <div className="achievement-icon">
                      <Icon size={32} />
                      {unlocked ? (
                        <CheckCircle className="unlock-indicator" size={16} />
                      ) : (
                        <Lock className="lock-indicator" size={16} />
                      )}
                    </div>
                    <div className="achievement-content">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      <div className="achievement-reward">
                        <Coins size={14} />
                        <span>{achievement.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <div className="leaderboard-header">
              <h3>Top Performers</h3>
              <p>See how you rank against other users</p>
            </div>

            <div className="leaderboard-list">
              {leaderboard.map((user) => (
                <div key={user.id} className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}>
                  <div className="rank-badge">
                    {user.rank <= 3 ? (
                      <Medal className={`medal rank-${user.rank}`} size={20} />
                    ) : (
                      <span className="rank-number">#{user.rank}</span>
                    )}
                  </div>

                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <h4>{user.name}</h4>
                      <div className="user-stats">
                        <span>Level {user.level}</span>
                        <span>•</span>
                        <span>{user.streak} day streak</span>
                      </div>
                    </div>
                  </div>

                  <div className="user-xp">
                    <Coins size={16} />
                    <span>{user.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;