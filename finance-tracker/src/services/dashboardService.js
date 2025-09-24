import { db } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  getDoc,
  doc,
  Timestamp
} from 'firebase/firestore';

export class DashboardService {
  // Get comprehensive dashboard data
  static async getDashboardData(uid) {
    try {
      const [
        userProfile,
        recentTransactions,
        monthlyAnalytics,
        goals,
        badges,
        dailyTasks
      ] = await Promise.all([
        this.getUserProfile(uid),
        this.getRecentTransactions(uid, 5),
        this.getMonthlyAnalytics(uid),
        this.getUserGoals(uid),
        this.getUserBadges(uid),
        this.getDailyTasks(uid)
      ]);

      const stats = this.calculateDashboardStats({
        userProfile,
        recentTransactions,
        monthlyAnalytics,
        goals,
        badges,
        dailyTasks
      });

      return {
        userProfile,
        recentTransactions,
        monthlyAnalytics,
        goals,
        badges,
        dailyTasks,
        stats,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Get recent transactions with real-time updates
  static async getRecentTransactions(uid, limitCount = 5) {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      throw error;
    }
  }

  // Get monthly analytics
  static async getMonthlyAnalytics(uid) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current month transactions
      const currentMonthQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', uid),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
        where('createdAt', '<=', Timestamp.fromDate(now))
      );

      // Previous month transactions
      const prevMonthQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', uid),
        where('createdAt', '>=', Timestamp.fromDate(startOfPrevMonth)),
        where('createdAt', '<=', Timestamp.fromDate(endOfPrevMonth))
      );

      const [currentSnapshot, prevSnapshot] = await Promise.all([
        getDocs(currentMonthQuery),
        getDocs(prevMonthQuery)
      ]);

      const currentTransactions = currentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      const prevTransactions = prevSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      return this.analyzeTransactions(currentTransactions, prevTransactions);
    } catch (error) {
      console.error('Error getting monthly analytics:', error);
      throw error;
    }
  }

  // Analyze transactions for monthly comparison
  static analyzeTransactions(currentTransactions, prevTransactions) {
    const current = this.summarizeTransactions(currentTransactions);
    const previous = this.summarizeTransactions(prevTransactions);

    // Calculate percentage changes
    const incomeChange = previous.income > 0
      ? ((current.income - previous.income) / previous.income * 100).toFixed(1)
      : current.income > 0 ? 100 : 0;

    const expenseChange = previous.expenses > 0
      ? ((current.expenses - previous.expenses) / previous.expenses * 100).toFixed(1)
      : current.expenses > 0 ? 100 : 0;

    const savingsChange = previous.savings !== 0
      ? ((current.savings - previous.savings) / Math.abs(previous.savings) * 100).toFixed(1)
      : current.savings > 0 ? 100 : current.savings < 0 ? -100 : 0;

    return {
      current,
      previous,
      changes: {
        income: parseFloat(incomeChange),
        expenses: parseFloat(expenseChange),
        savings: parseFloat(savingsChange)
      },
      categoryBreakdown: this.getCategoryBreakdown(currentTransactions)
    };
  }

  // Summarize transactions
  static summarizeTransactions(transactions) {
    const summary = transactions.reduce((acc, transaction) => {
      const amount = transaction.amount || 0;

      if (transaction.type === 'income') {
        acc.income += amount;
      } else if (transaction.type === 'expense') {
        acc.expenses += amount;
      }

      return acc;
    }, { income: 0, expenses: 0 });

    summary.savings = summary.income - summary.expenses;
    summary.savingsRate = summary.income > 0 ? (summary.savings / summary.income * 100) : 0;
    summary.transactionCount = transactions.length;

    return summary;
  }

  // Get category breakdown
  static getCategoryBreakdown(transactions) {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense') {
        const category = transaction.category || 'Other';
        acc[category] = (acc[category] || 0) + (transaction.amount || 0);
      }
      return acc;
    }, {});
  }

  // Get user goals
  static async getUserGoals(uid) {
    try {
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  }

  // Get user badges
  static async getUserBadges(uid) {
    try {
      const q = query(
        collection(db, 'userBadges'),
        where('userId', '==', uid),
        orderBy('earnedAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        earnedAt: doc.data().earnedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error getting badges:', error);
      throw error;
    }
  }

  // Get daily tasks
  static async getDailyTasks(uid) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'dailyTasks'),
        where('userId', '==', uid),
        where('date', '>=', Timestamp.fromDate(today))
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error getting daily tasks:', error);
      return []; // Return empty array as fallback
    }
  }

  // Calculate comprehensive dashboard stats
  static calculateDashboardStats(data) {
    const { userProfile, monthlyAnalytics, goals, badges, dailyTasks } = data;

    // Goals statistics
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    const totalSaved = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    const totalTargeted = activeGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
    const savingsProgress = totalTargeted > 0 ? (totalSaved / totalTargeted * 100) : 0;

    // Tasks statistics
    const completedTasks = dailyTasks.filter(task => task.completed);
    const pendingTasks = dailyTasks.filter(task => !task.completed);
    const taskCompletionRate = dailyTasks.length > 0
      ? (completedTasks.length / dailyTasks.length * 100)
      : 0;

    // Level progress
    const currentLevel = userProfile?.level || 1;
    const currentXP = userProfile?.xp || 0;
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpForNextLevel = currentLevel * 1000;
    const levelProgress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

    return {
      // Financial stats
      balance: userProfile?.balance || 0,
      monthlyIncome: monthlyAnalytics?.current?.income || 0,
      monthlyExpenses: monthlyAnalytics?.current?.expenses || 0,
      monthlySavings: monthlyAnalytics?.current?.savings || 0,
      savingsRate: monthlyAnalytics?.current?.savingsRate || 0,

      // Changes from previous month
      incomeChange: monthlyAnalytics?.changes?.income || 0,
      expenseChange: monthlyAnalytics?.changes?.expenses || 0,
      savingsChange: monthlyAnalytics?.changes?.savings || 0,

      // Goals stats
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalSaved,
      totalTargeted,
      savingsProgress: Math.min(savingsProgress, 100),

      // Gamification stats
      level: currentLevel,
      xp: currentXP,
      levelProgress: Math.min(levelProgress, 100),
      totalBadges: badges.length,
      recentBadges: badges.slice(0, 3),

      // Tasks stats
      totalTasks: dailyTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      taskCompletionRate
    };
  }

  // Set up real-time listener for dashboard updates
  static setupDashboardListener(uid, callback) {
    const unsubscribers = [];

    try {
      // Listen to user profile changes
      const userProfileUnsub = onSnapshot(
        doc(db, 'users', uid),
        (doc) => {
          if (doc.exists()) {
            callback('userProfile', { id: doc.id, ...doc.data() });
          }
        },
        (error) => console.error('User profile listener error:', error)
      );
      unsubscribers.push(userProfileUnsub);

      // Listen to recent transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const transactionsUnsub = onSnapshot(
        transactionsQuery,
        (snapshot) => {
          const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          }));
          callback('recentTransactions', transactions);
        },
        (error) => console.error('Transactions listener error:', error)
      );
      unsubscribers.push(transactionsUnsub);

      // Listen to goals
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );

      const goalsUnsub = onSnapshot(
        goalsQuery,
        (snapshot) => {
          const goals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          }));
          callback('goals', goals);
        },
        (error) => console.error('Goals listener error:', error)
      );
      unsubscribers.push(goalsUnsub);

      // Return cleanup function
      return () => {
        unsubscribers.forEach(unsub => unsub());
      };

    } catch (error) {
      console.error('Error setting up dashboard listeners:', error);
      // Cleanup any existing listeners
      unsubscribers.forEach(unsub => unsub());
      throw error;
    }
  }

  // Get quick stats for dashboard cards
  static async getQuickStats(uid) {
    try {
      const [userProfile, monthlyAnalytics] = await Promise.all([
        this.getUserProfile(uid),
        this.getMonthlyAnalytics(uid)
      ]);

      return {
        balance: userProfile?.balance || 0,
        monthlyExpenses: monthlyAnalytics?.current?.expenses || 0,
        expenseChange: monthlyAnalytics?.changes?.expenses || 0,
        xp: userProfile?.xp || 0,
        level: userProfile?.level || 1
      };
    } catch (error) {
      console.error('Error getting quick stats:', error);
      throw error;
    }
  }
}