// TransactionContext.jsx - FIXED FOR NUMERIC IDs
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';
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
  const { awardXP, checkAndAwardBadges, setUserStats } = useGamification();
  
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
      
      // Sort by date (newest first)
      const sortedTransactions = userTransactions.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateB - dateA;
      });
      
      setTransactions(sortedTransactions);
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

  // Add new transaction
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

      // Gamification: Award XP
      await awardXP(10, `Added ${transactionData.type} transaction`);

      // Check if this is their first transaction
      if (transactions.length === 0) {
        await checkAndAwardBadges(currentUser.uid, { type: 'first_transaction' });
      }

      // Update balance based on transaction type
      if (setUserStats) {
        setUserStats((prev) => {
          const amount = parseFloat(transactionData.amount);
          const newBalance = transactionData.type === 'income'
            ? prev.balance + amount
            : prev.balance - amount;

          const newTotalSavings = transactionData.type === 'income' && transactionData.category === 'Savings'
            ? prev.totalSavings + amount
            : prev.totalSavings;

          return {
            ...prev,
            balance: newBalance,
            totalSavings: newTotalSavings
          };
        });
      }

      // Refresh analytics
      await loadAnalytics();

      return newTransaction;
    } catch (err) {
      setError(err.message);
      console.error('Error adding transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing transaction - FIXED FOR NUMERIC IDs
  const updateTransaction = async (transactionId, updatedData) => {
    try {
      setLoading(true);
      setError(null);

      // Keep ID as-is (number or string)
      const id = transactionId;

      console.log('Updating transaction:', id, 'Type:', typeof id, updatedData);

      // Find old transaction to calculate balance difference
      const oldTransaction = transactions.find(t => t.id == id);

      // Update in database first
      await updateTransactionDB(id, updatedData);

      // Update local state - compare IDs properly (works for both numbers and strings)
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id == id  // Use loose equality to handle number/string
            ? { ...transaction, ...updatedData, id: transaction.id }
            : transaction
        )
      );

      // Update balance - reverse old transaction and apply new one
      if (oldTransaction && setUserStats) {
        setUserStats((prev) => {
          const oldAmount = parseFloat(oldTransaction.amount);
          const newAmount = parseFloat(updatedData.amount);

          // Reverse old transaction
          let newBalance = oldTransaction.type === 'income'
            ? prev.balance - oldAmount
            : prev.balance + oldAmount;

          // Apply new transaction
          newBalance = updatedData.type === 'income'
            ? newBalance + newAmount
            : newBalance - newAmount;

          return {
            ...prev,
            balance: newBalance
          };
        });
      }

      // Refresh analytics
      await loadAnalytics();

      console.log('Transaction updated successfully');

    } catch (err) {
      setError(err.message);
      console.error('Error updating transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction - FIXED FOR NUMERIC IDs
  const deleteTransaction = async (transactionId) => {
    try {
      setLoading(true);
      setError(null);

      // Keep ID as-is (number or string)
      const id = transactionId;

      console.log('Deleting transaction with ID:', id, 'Type:', typeof id);
      console.log('Current transactions:', transactions.map(t => ({ id: t.id, type: typeof t.id })));

      // Find transaction to update balance
      const transactionToDelete = transactions.find(t => t.id == id);

      // Delete from database first
      await deleteTransactionDB(id);

      // Remove from local state - use loose equality to handle number/string comparison
      setTransactions(prev => {
        const filtered = prev.filter(transaction => transaction.id != id);  // Use loose equality
        console.log('Filtered transactions:', filtered.length, 'from', prev.length);
        return filtered;
      });

      // Update balance - reverse the deleted transaction
      if (transactionToDelete && setUserStats) {
        setUserStats((prev) => {
          const amount = parseFloat(transactionToDelete.amount);
          const newBalance = transactionToDelete.type === 'income'
            ? prev.balance - amount  // Remove income
            : prev.balance + amount; // Add back expense

          return {
            ...prev,
            balance: newBalance
          };
        });
      }

      // Refresh analytics
      await loadAnalytics();

      console.log('Transaction deleted successfully');

    } catch (err) {
      setError(err.message);
      console.error('Error deleting transaction:', err);
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
          t => new Date(t.createdAt || t.date) >= startDate
        );
      }
    }

    return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getTotalIncome = () => {
    return getTotalByType('income');
  };

  const getTotalExpenses = () => {
    return getTotalByType('expense');
  };

  const getBalance = () => {
    const income = getTotalIncome();
    const expenses = getTotalExpenses();
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
          t => new Date(t.createdAt || t.date) >= startDate
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
      const transactionDate = new Date(transaction.createdAt || transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  return (
    <TransactionContext.Provider
      value={{
        // State
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
        getTotalIncome,
        getTotalExpenses,
        getBalance,
        getRecentTransactions,
        getCategoryBreakdown,
        getTransactionsByDateRange,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};