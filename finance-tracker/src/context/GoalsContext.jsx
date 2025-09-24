import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  addGoal,
  getUserGoals,
  updateGoalProgress
} from '../services/firestore';

const GoalsContext = createContext();

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};

export const GoalsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Goal categories
  const goalCategories = [
    'Emergency Fund',
    'Vacation',
    'Car',
    'House',
    'Education',
    'Investment',
    'Debt Payment',
    'Other'
  ];

  // Load user goals
  const loadGoals = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const userGoals = await getUserGoals(currentUser.uid);
      setGoals(userGoals);
    } catch (err) {
      setError(err.message);
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load goals when user changes
  useEffect(() => {
    if (currentUser?.uid) {
      loadGoals();
    } else {
      setGoals([]);
    }
  }, [currentUser?.uid]);

  const createGoal = async (goalData) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      // Validate goal data
      if (!goalData.title || !goalData.targetAmount || !goalData.category) {
        throw new Error('Missing required goal fields');
      }

      const newGoal = await addGoal(currentUser.uid, {
        ...goalData,
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: parseFloat(goalData.currentAmount || 0)
      });

      // Add to local state
      setGoals(prev => [newGoal, ...prev]);

      return newGoal;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contributeToGoal = async (goalId, amount) => {
    try {
      setLoading(true);
      setError(null);

      const contribution = parseFloat(amount);
      if (contribution <= 0) {
        throw new Error('Contribution amount must be greater than 0');
      }

      const updates = await updateGoalProgress(goalId, contribution);

      // Update local state
      setGoals(prev =>
        prev.map(goal =>
          goal.id === goalId
            ? { ...goal, ...updates }
            : goal
        )
      );

      return updates;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'active');
  };

  const getCompletedGoals = () => {
    return goals.filter(goal => goal.status === 'completed');
  };

  const getTotalSaved = () => {
    return goals.reduce((total, goal) => total + (goal.progress || 0), 0);
  };

  const getTotalTargeted = () => {
    return goals.reduce((total, goal) => total + goal.targetAmount, 0);
  };

  const getGoalsByCategory = (category) => {
    return goals.filter(goal => goal.category === category);
  };

  const getGoalProgress = (goal) => {
    if (!goal.targetAmount) return 0;
    return Math.min((goal.progress / goal.targetAmount) * 100, 100);
  };

  const getMostRecentGoals = (limit = 3) => {
    return goals
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  const getNearCompletionGoals = (threshold = 80) => {
    return goals.filter(goal => {
      const progress = getGoalProgress(goal);
      return progress >= threshold && progress < 100 && goal.status === 'active';
    });
  };

  const value = {
    goals,
    loading,
    error,
    goalCategories,

    // Actions
    createGoal,
    contributeToGoal,
    loadGoals,

    // Helper functions
    getActiveGoals,
    getCompletedGoals,
    getTotalSaved,
    getTotalTargeted,
    getGoalsByCategory,
    getGoalProgress,
    getMostRecentGoals,
    getNearCompletionGoals,
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};