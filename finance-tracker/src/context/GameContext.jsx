// GameContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    badges: [],
    achievements: [],
    dailyTasksCompleted: 0,
    weeklyGoals: [],
    monthlyGoals: [],
    totalSavings: 0,
    spendingLimit: 0,
    lastLoginDate: null,
    isPlaying: false
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const XP_PER_LEVEL = 1000;

  useEffect(() => {
    if (!currentUser) {
      setGameState({
        level: 1,
        xp: 0,
        streak: 0,
        badges: [],
        achievements: [],
        dailyTasksCompleted: 0,
        weeklyGoals: [],
        monthlyGoals: [],
        totalSavings: 0,
        spendingLimit: 0,
        lastLoginDate: null,
        isPlaying: false
      });
      setLoading(false);
      return;
    }

    loadGameState();
  }, [currentUser]);

  const loadGameState = async () => {
    try {
      const gameDoc = doc(db, 'gameProgress', currentUser.uid);
      const gameSnapshot = await getDoc(gameDoc);

      if (gameSnapshot.exists()) {
        const data = gameSnapshot.data();
        setGameState(prevState => ({
          ...prevState,
          ...data,
          level: calculateLevel(data.xp || 0)
        }));

        // Check and update streak
        await checkAndUpdateStreak(data.lastLoginDate);
      } else {
        // Initialize game state for new user
        const initialState = {
          level: 1,
          xp: 0,
          streak: 0,
          badges: [],
          achievements: [],
          dailyTasksCompleted: 0,
          weeklyGoals: [],
          monthlyGoals: [],
          totalSavings: 0,
          spendingLimit: 0,
          lastLoginDate: new Date().toISOString(),
          isPlaying: false
        };

        await setDoc(gameDoc, initialState);
        setGameState(initialState);
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGameState = async (newState) => {
    if (!currentUser) return;

    try {
      const gameDoc = doc(db, 'gameProgress', currentUser.uid);
      await updateDoc(gameDoc, newState);
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  const calculateLevel = (xp) => {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
  };

  const checkAndUpdateStreak = async (lastLoginDate) => {
    if (!lastLoginDate) return;

    const today = new Date();
    const lastLogin = new Date(lastLoginDate);
    const diffTime = today - lastLogin;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = gameState.streak;

    if (diffDays === 1) {
      // Consecutive day - increase streak
      newStreak += 1;
      await awardXP(50, 'Daily login streak!');
    } else if (diffDays > 1) {
      // Missed a day - reset streak
      newStreak = 1;
    }
    // If diffDays === 0, it's the same day, don't change streak

    const updatedState = {
      ...gameState,
      streak: newStreak,
      lastLoginDate: today.toISOString()
    };

    setGameState(updatedState);
    await saveGameState(updatedState);
  };

  const awardXP = async (amount, reason = '') => {
    const newXP = gameState.xp + amount;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > gameState.level;

    const updatedState = {
      ...gameState,
      xp: newXP,
      level: newLevel
    };

    setGameState(updatedState);
    await saveGameState(updatedState);

    if (leveledUp) {
      await checkForAchievements('level_up', newLevel);
      // You could trigger a level up notification here
    }

    if (reason) {
      console.log(`+${amount} XP: ${reason}`);
    }

    return { xp: amount, leveledUp, newLevel };
  };

  const awardBadge = async (badge) => {
    if (!gameState.badges.includes(badge.id)) {
      const updatedState = {
        ...gameState,
        badges: [...gameState.badges, badge.id]
      };

      setGameState(updatedState);
      await saveGameState(updatedState);
      await awardXP(badge.xpReward || 100, `Earned badge: ${badge.name}`);
    }
  };

  const checkForAchievements = async (type, value) => {
    const achievements = getAchievementsToCheck(type, value);

    for (const achievement of achievements) {
      if (!gameState.achievements.includes(achievement.id)) {
        const updatedState = {
          ...gameState,
          achievements: [...gameState.achievements, achievement.id]
        };

        setGameState(updatedState);
        await saveGameState(updatedState);
        await awardXP(achievement.xpReward, `Achievement unlocked: ${achievement.name}`);
      }
    }
  };

  const getAchievementsToCheck = (type, value) => {
    const allAchievements = {
      level_up: [
        { id: 'level_5', name: 'Getting Started', description: 'Reach Level 5', xpReward: 200, requirement: 5 },
        { id: 'level_10', name: 'Money Master', description: 'Reach Level 10', xpReward: 500, requirement: 10 },
        { id: 'level_20', name: 'Financial Guru', description: 'Reach Level 20', xpReward: 1000, requirement: 20 }
      ],
      streak: [
        { id: 'streak_7', name: 'Week Warrior', description: '7-day login streak', xpReward: 300, requirement: 7 },
        { id: 'streak_30', name: 'Month Master', description: '30-day login streak', xpReward: 1000, requirement: 30 },
        { id: 'streak_365', name: 'Year Champion', description: '365-day login streak', xpReward: 5000, requirement: 365 }
      ],
      transactions: [
        { id: 'first_transaction', name: 'First Step', description: 'Record your first transaction', xpReward: 100, requirement: 1 },
        { id: 'transactions_50', name: 'Record Keeper', description: 'Record 50 transactions', xpReward: 500, requirement: 50 },
        { id: 'transactions_500', name: 'Data Master', description: 'Record 500 transactions', xpReward: 2000, requirement: 500 }
      ]
    };

    return allAchievements[type]?.filter(achievement => value >= achievement.requirement) || [];
  };

  const completeDailyTask = async (taskType, xpReward = 25) => {
    const updatedState = {
      ...gameState,
      dailyTasksCompleted: gameState.dailyTasksCompleted + 1
    };

    setGameState(updatedState);
    await saveGameState(updatedState);
    await awardXP(xpReward, `Completed daily task: ${taskType}`);

    // Check for daily task achievements
    await checkForAchievements('daily_tasks', updatedState.dailyTasksCompleted);
  };

  const updateSavingsGoal = async (amount) => {
    const updatedState = {
      ...gameState,
      totalSavings: gameState.totalSavings + amount
    };

    setGameState(updatedState);
    await saveGameState(updatedState);

    if (amount > 0) {
      await awardXP(Math.floor(amount / 10), `Savings increased by $${amount}`);
      await checkForAchievements('savings', updatedState.totalSavings);
    }
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };

  const endGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  };

  const getProgressToNextLevel = () => {
    const currentLevelXP = (gameState.level - 1) * XP_PER_LEVEL;
    const nextLevelXP = gameState.level * XP_PER_LEVEL;
    const progressXP = gameState.xp - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;

    return {
      current: progressXP,
      required: requiredXP,
      percentage: Math.round((progressXP / requiredXP) * 100)
    };
  };

  const value = {
    gameState,
    loading,
    awardXP,
    awardBadge,
    completeDailyTask,
    updateSavingsGoal,
    checkForAchievements,
    startGame,
    endGame,
    getProgressToNextLevel,
    XP_PER_LEVEL
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};