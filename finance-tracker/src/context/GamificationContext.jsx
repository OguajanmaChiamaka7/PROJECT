import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserProfile,
  updateUserXP,
  getUserBadges,
  awardBadge,
  getDailyTasks,
  completeTask,
  createNotification
} from '../services/firestore';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    balance: 0,
    streak: 0
  });
  const [badges, setBadges] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Badge definitions
  const availableBadges = {
    first_transaction: {
      name: 'First Step',
      description: 'Made your first transaction',
      icon: '🎯',
      xpReward: 50
    },
    transaction_streak_7: {
      name: 'Weekly Warrior',
      description: '7 days of consistent tracking',
      icon: '🔥',
      xpReward: 100
    },
    transaction_streak_30: {
      name: 'Monthly Master',
      description: '30 days of consistent tracking',
      icon: '👑',
      xpReward: 200
    },
    saver_100: {
      name: 'Penny Saver',
      description: 'Saved ₦100',
      icon: '💰',
      xpReward: 75
    },
    saver_1000: {
      name: 'Smart Saver',
      description: 'Saved ₦1,000',
      icon: '💎',
      xpReward: 150
    },
    goal_achiever: {
      name: 'Goal Getter',
      description: 'Completed your first goal',
      icon: '🏆',
      xpReward: 250
    },
    budget_keeper: {
      name: 'Budget Keeper',
      description: 'Stayed within budget for a month',
      icon: '📊',
      xpReward: 200
    },
    level_5: {
      name: 'Rising Star',
      description: 'Reached Level 5',
      icon: '⭐',
      xpReward: 300
    },
    level_10: {
      name: 'Finance Pro',
      description: 'Reached Level 10',
      icon: '🌟',
      xpReward: 500
    }
  };

  // Daily tasks templates
  const dailyTasksTemplates = [
    {
      title: 'Add a Transaction',
      description: 'Record at least one transaction today',
      type: 'transaction',
      xpReward: 25,
      icon: '📝'
    },
    {
      title: 'Check Your Balance',
      description: 'Review your current balance',
      type: 'balance_check',
      xpReward: 15,
      icon: '💳'
    },
    {
      title: 'Review Goals',
      description: 'Check progress on your savings goals',
      type: 'goal_review',
      xpReward: 20,
      icon: '🎯'
    },
    {
      title: 'Categorize Expenses',
      description: 'Review and categorize recent expenses',
      type: 'categorization',
      xpReward: 30,
      icon: '📂'
    }
  ];

  // Load user data
  const loadUserData = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Load user profile for stats
      const profile = await getUserProfile(currentUser.uid);
      setUserStats({
        xp: profile.xp || 0,
        level: profile.level || 1,
        balance: profile.balance || 0,
        streak: profile.streak || 0
      });

      // Load badges
      const userBadges = await getUserBadges(currentUser.uid);
      setBadges(userBadges);

      // Load daily tasks
      const tasks = await getDailyTasks(currentUser.uid);
      setDailyTasks(tasks);

    } catch (err) {
      setError(err.message);
      console.error('Error loading gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (currentUser?.uid) {
      loadUserData();
    } else {
      setUserStats({ xp: 0, level: 1, balance: 0, streak: 0 });
      setBadges([]);
      setDailyTasks([]);
    }
  }, [currentUser?.uid]);

  // Award XP to user
  const awardXP = async (amount, reason) => {
    if (!currentUser?.uid) return;

    try {
      const result = await updateUserXP(currentUser.uid, amount);

      // Update local stats
      setUserStats(prev => ({
        ...prev,
        xp: result.newXP,
        level: result.newLevel
      }));

      // Create notification
      await createNotification(currentUser.uid, {
        type: 'xp_earned',
        title: `+${amount} XP Earned!`,
        message: reason || 'Keep up the great work!',
        data: { xp: amount, reason }
      });

      // Check for level up badge
      if (result.leveledUp) {
        await checkLevelBadges(result.newLevel);
      }

      return result;
    } catch (err) {
      console.error('Error awarding XP:', err);
      throw err;
    }
  };

  // Check and award badges based on user actions
  const checkAndAwardBadges = async (action, data = {}) => {
    if (!currentUser?.uid) return;

    const badgesToCheck = [];

    switch (action) {
      case 'first_transaction':
        badgesToCheck.push('first_transaction');
        break;
      case 'goal_completed':
        badgesToCheck.push('goal_achiever');
        break;
      case 'streak_updated':
        if (data.streak === 7) badgesToCheck.push('transaction_streak_7');
        if (data.streak === 30) badgesToCheck.push('transaction_streak_30');
        break;
      case 'savings_milestone':
        if (data.amount >= 100) badgesToCheck.push('saver_100');
        if (data.amount >= 1000) badgesToCheck.push('saver_1000');
        break;
    }

    // Check each badge
    for (const badgeKey of badgesToCheck) {
      const hasUnearnedBadge = !badges.some(b => b.badgeId === badgeKey);

      if (hasUnearnedBadge && availableBadges[badgeKey]) {
        await awardBadgeToUser(badgeKey);
      }
    }
  };

  // Check level-based badges
  const checkLevelBadges = async (level) => {
    const levelBadges = [
      { level: 5, badgeId: 'level_5' },
      { level: 10, badgeId: 'level_10' }
    ];

    for (const { level: reqLevel, badgeId } of levelBadges) {
      if (level >= reqLevel) {
        const hasUnearnedBadge = !badges.some(b => b.badgeId === badgeId);
        if (hasUnearnedBadge) {
          await awardBadgeToUser(badgeId);
        }
      }
    }
  };

  // Award a specific badge
  const awardBadgeToUser = async (badgeId) => {
    try {
      const badgeInfo = availableBadges[badgeId];
      if (!badgeInfo) return;

      const newBadge = await awardBadge(currentUser.uid, {
        badgeId,
        name: badgeInfo.name,
        description: badgeInfo.description,
        icon: badgeInfo.icon
      });

      // Update local badges
      setBadges(prev => [newBadge, ...prev]);

      // Create notification
      await createNotification(currentUser.uid, {
        type: 'badge_earned',
        title: `Badge Unlocked: ${badgeInfo.name}!`,
        message: badgeInfo.description,
        data: { badgeId, badge: badgeInfo }
      });

      return newBadge;
    } catch (err) {
      console.error('Error awarding badge:', err);
      throw err;
    }
  };

  // Complete a daily task
  const completeDailyTask = async (taskId) => {
    try {
      const task = dailyTasks.find(t => t.id === taskId);
      if (!task) return;

      await completeTask(currentUser.uid, taskId, task.xpReward);

      // Update local tasks
      setDailyTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, completed: true, completedAt: new Date() }
            : t
        )
      );

      // Award XP
      await awardXP(task.xpReward, `Completed: ${task.title}`);

    } catch (err) {
      console.error('Error completing task:', err);
      throw err;
    }
  };

  // Helper functions
  const getXPToNextLevel = () => {
    const nextLevel = userStats.level + 1;
    const xpNeeded = nextLevel * 1000;
    return xpNeeded - userStats.xp;
  };

  const getLevelProgress = () => {
    const currentLevelXP = (userStats.level - 1) * 1000;
    const nextLevelXP = userStats.level * 1000;
    const progressXP = userStats.xp - currentLevelXP;
    const totalXPForLevel = nextLevelXP - currentLevelXP;

    return {
      current: progressXP,
      total: totalXPForLevel,
      percentage: (progressXP / totalXPForLevel) * 100
    };
  };

  const getRecentBadges = (limit = 3) => {
    return badges
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, limit);
  };

  const getCompletedTasksToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dailyTasks.filter(task => {
      if (!task.completed) return false;
      const completedDate = new Date(task.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  };

  const getPendingTasksToday = () => {
    return dailyTasks.filter(task => !task.completed);
  };

  const value = {
    userStats,
    badges,
    dailyTasks,
    loading,
    error,
    availableBadges,

    // Actions
    awardXP,
    checkAndAwardBadges,
    completeDailyTask,
    loadUserData,

    // Helper functions
    getXPToNextLevel,
    getLevelProgress,
    getRecentBadges,
    getCompletedTasksToday,
    getPendingTasksToday,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};