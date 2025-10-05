import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  getUserProfile,
  updateUserXP,
  getUserBadges,
  awardBadge,
  getDailyTasks,
  createNotification,
} from "../services/firestore";

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    balance: 0,
    streak: 0,
    totalSavings: 0,
    goalsCompleted: 0,
    badges: [],
  });

  const [badges, setBadges] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableBadges = {
    first_saver: {
      name: "First Saver",
      description: "Saved your first ₦500",
      icon: "💰",
      xpReward: 60,
      condition: (stats) => stats.totalSavings >= 500,
    },
    goal_crusher: {
      name: "Goal Crusher",
      description: "Completed your first goal",
      icon: "🎯",
      xpReward: 50,
      condition: (stats) => stats.goalsCompleted >= 1,
    },
    streak_master: {
      name: "Streak Master",
      description: "7-day savings streak",
      icon: "⚡",
      xpReward: 100,
      condition: (stats) => stats.streak >= 7,
    },
    level_up: {
      name: "Level Up",
      description: "Reached level 5",
      icon: "⭐",
      xpReward: 150,
      condition: (stats) => stats.level >= 5,
    },
  };

  useEffect(() => {
    if (currentUser?.uid) {
      loadUserData();
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.uid && userStats.xp > 0) {
      checkAndAwardBadgesAuto();
    }
  }, [userStats.totalSavings, userStats.goalsCompleted, userStats.streak, userStats.level]);

  const loadUserData = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const profile = await getUserProfile(currentUser.uid);
      setUserStats((prev) => ({
        ...prev,
        xp: profile.xp || 0,
        level: profile.level || 1,
        balance: profile.balance || 0,
        streak: profile.streak || 0,
        totalSavings: profile.totalSavings || 0,
        goalsCompleted: profile.goalsCompleted || 0,
        badges: profile.badges || [],
      }));

      const userBadges = await getUserBadges(currentUser.uid);
      setBadges(userBadges);

      const tasks = await getDailyTasks(currentUser.uid);
      setDailyTasks(tasks);
    } catch (err) {
      setError(err.message);
      console.error("Error loading gamification data:", err);
    } finally {
      setLoading(false);
    }
  };

  const awardXP = async (amount, reason) => {
    if (!currentUser?.uid) return;

    try {
      const result = await updateUserXP(currentUser.uid, amount);

      setUserStats((prev) => {
        const newXP = result.newXP || prev.xp + amount;
        const newLevel = result.newLevel || Math.floor(newXP / 1000) + 1;
        
        return {
          ...prev,
          xp: newXP,
          level: newLevel,
        };
      });

      await createNotification(currentUser.uid, {
        type: "xp_earned",
        title: `+${amount} XP Earned!`,
        message: reason || "Keep it up!",
        data: { xp: amount, reason },
      });

      return result;
    } catch (err) {
      console.error("Error awarding XP:", err);
      throw err;
    }
  };

  const unlockBadge = (badgeId, xpReward = 50) => {
    setUserStats((prev) => {
      if (prev.badges.includes(badgeId)) return prev;
      
      return {
        ...prev,
        xp: prev.xp + xpReward,
        badges: [...prev.badges, badgeId],
      };
    });
  };

  const checkAndAwardBadgesAuto = async () => {
    if (!currentUser?.uid) return;

    const newBadges = [];
    Object.entries(availableBadges).forEach(([badgeId, badgeInfo]) => {
      const alreadyEarned = userStats.badges.includes(badgeId) || badges.some((b) => b.badgeId === badgeId);
      if (!alreadyEarned && badgeInfo.condition && badgeInfo.condition(userStats)) {
        newBadges.push(badgeId);
      }
    });

    for (const badgeId of newBadges) {
      await awardBadgeToUser(badgeId);
    }
  };

  const checkAndAwardBadges = async (uid, context = {}) => {
    if (!uid) return;

    if (context.type === "savings_milestone" && userStats.totalSavings >= 500) {
      await awardBadgeToUser("first_saver");
    }
    if (context.type === "first_transaction") {
      // Add custom logic
    }
    if (context.type === "taskCompleted") {
      // Check task badges
    }
    if (context.type === "goal_completed" && userStats.goalsCompleted >= 1) {
      await awardBadgeToUser("goal_crusher");
    }

    await checkAndAwardBadgesAuto();
  };

  const awardBadgeToUser = async (badgeId) => {
    try {
      const badgeInfo = availableBadges[badgeId];
      if (!badgeInfo) return;

      const newBadge = await awardBadge(currentUser.uid, {
        badgeId,
        name: badgeInfo.name,
        description: badgeInfo.description,
        icon: badgeInfo.icon,
      });

      setBadges((prev) => [newBadge, ...prev]);
      unlockBadge(badgeId, badgeInfo.xpReward);

      await createNotification(currentUser.uid, {
        type: "badge_earned",
        title: `Badge Unlocked: ${badgeInfo.name}!`,
        message: badgeInfo.description,
        data: { badgeId, badge: badgeInfo },
      });

      return newBadge;
    } catch (err) {
      console.error("Error awarding badge:", err);
      throw err;
    }
  };

  const getRecentBadges = (count = 3) => {
    return badges.slice(-count).reverse();
  };

  const getLevelProgress = () => {
    const currentLevelXP = (userStats.level - 1) * 1000;
    const nextLevelXP = userStats.level * 1000;
    const progressXP = userStats.xp - currentLevelXP;
    const totalXPForLevel = nextLevelXP - currentLevelXP;

    return {
      current: progressXP,
      total: totalXPForLevel,
      percentage: Math.min((progressXP / totalXPForLevel) * 100, 100),
    };
  };

  const getPendingTasksToday = () => dailyTasks.filter((t) => !t.completed);

  return (
    <GamificationContext.Provider
      value={{
        userStats,
        badges,
        dailyTasks,
        loading,
        error,
        availableBadges,
        unlockBadge,
        awardXP,
        loadUserData,
        awardBadgeToUser,
        checkAndAwardBadges,
        getLevelProgress,
        getPendingTasksToday,
        getRecentBadges,
        setUserStats,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};