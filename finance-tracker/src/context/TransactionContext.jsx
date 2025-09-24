import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  addTransaction as addTransactionDB,
  getUserTransactions,
  updateTransaction as updateTransactionDB,
  deleteTransaction as deleteTransactionDB,
  getUserAnalytics
} from '../services/firestore';

const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Transaction categories
  const categories = {
    income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Travel', 'Other']
  };

  // Load user transactions
  const loadTransactions = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const userTransactions = await getUserTransactions(currentUser.uid);
      setTransactions(userTransactions);
    } catch (err) {
      setError(err.message);
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async (timeframe = 'month') => {
    if (!currentUser?.uid) return;

    try {
      const analyticsData = await getUserAnalytics(currentUser.uid, timeframe);
      setAnalytics(analyticsData);
      return analyticsData;
    } catch (err) {
      console.error('Error loading analytics:', err);
      throw err;
    }
  };

  // Load transactions when user changes
  useEffect(() => {
    if (currentUser?.uid) {
      loadTransactions();
      loadAnalytics();
    } else {
      setTransactions([]);
      setAnalytics(null);
    }
  }, [currentUser?.uid]);

  const addTransaction = async (transactionData) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      // Validate transaction data
      if (!transactionData.amount || !transactionData.type || !transactionData.category) {
        throw new Error('Missing required transaction fields');
      }

      const newTransaction = await addTransactionDB(currentUser.uid, {
        ...transactionData,
        amount: parseFloat(transactionData.amount)
      });

      // Add to local state
      setTransactions(prev => [newTransaction, ...prev]);

      // Refresh analytics
      await loadAnalytics();

      return newTransaction;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (transactionId, updatedData) => {
    try {
      setLoading(true);
      setError(null);

      await updateTransactionDB(transactionId, updatedData);

      // Update local state
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === transactionId
            ? { ...transaction, ...updatedData }
            : transaction
        )
      );

      // Refresh analytics
      await loadAnalytics();

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      setLoading(true);
      setError(null);

      await deleteTransactionDB(transactionId);

      // Remove from local state
      setTransactions(prev =>
        prev.filter(transaction => transaction.id !== transactionId)
      );

      // Refresh analytics
      await loadAnalytics();

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getTransactionsByCategory = (category) => {
    return transactions.filter(transaction => transaction.category === category);
  };

  const getTransactionsByType = (type) => {
    return transactions.filter(transaction => transaction.type === type);
  };

  const getTotalByType = (type, timeframe) => {
    let filteredTransactions = transactions.filter(t => t.type === type);

    if (timeframe) {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filteredTransactions = filteredTransactions.filter(
          t => new Date(t.createdAt) >= startDate
        );
      }
    }

    return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getBalance = () => {
    const income = getTotalByType('income');
    const expenses = getTotalByType('expense');
    return income - expenses;
  };

  const getRecentTransactions = (limit = 5) => {
    return transactions.slice(0, limit);
  };

  const getCategoryBreakdown = (type = 'expense', timeframe) => {
    let filteredTransactions = getTransactionsByType(type);

    if (timeframe) {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filteredTransactions = filteredTransactions.filter(
          t => new Date(t.createdAt) >= startDate
        );
      }
    }

    return filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  };

  const getTransactionsByDateRange = (startDate, endDate) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const value = {
    transactions,
    loading,
    error,
    analytics,
    categories,

    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadTransactions,
    loadAnalytics,

    // Helper functions
    getTransactionsByCategory,
    getTransactionsByType,
    getTotalByType,
    getBalance,
    getRecentTransactions,
    getCategoryBreakdown,
    getTransactionsByDateRange,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};