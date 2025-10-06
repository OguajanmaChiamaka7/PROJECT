// services/firestore.js
import {
  doc, setDoc, getDoc, addDoc, collection, query, where,
  orderBy, getDocs, updateDoc, deleteDoc, increment,
  serverTimestamp, limit, startAfter
} from "firebase/firestore";
import { db } from "./firebase";
import { dailyTasksData } from "../utils/constants";
import { financeTipsData } from "../utils/constants";

// ===== USER MANAGEMENT =====
export const saveUserProfile = async (uid, data) => {
  try {
    await setDoc(
      doc(db, "users", uid),
      data,
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("User profile not found");
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserBalance = async (uid, amount, type = 'add') => {
  try {
    const userRef = doc(db, "users", uid);
    const increment_amount = type === 'add' ? Math.abs(amount) : -Math.abs(amount);
    await updateDoc(userRef, {
      balance: increment(increment_amount),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating balance:", error);
    throw error;
  }
};

export const updateUserXP = async (uid, xpAmount) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    const currentData = userDoc.data();
    const newXP = (currentData.xp || 0) + xpAmount;

    // Calculate level (every 1000 XP = 1 level)
    const newLevel = Math.floor(newXP / 1000) + 1;

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      updatedAt: serverTimestamp()
    });

    return { newXP, newLevel, leveledUp: newLevel > (currentData.level || 1) };
  } catch (error) {
    console.error("Error updating XP:", error);
    throw error;
  }
};

export const checkProfileCompleted = async (uid) => {
  try {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);
    return snapshot.exists() && snapshot.data().profileCompleted === true;
  } catch (error) {
    console.error("Error checking profile:", error);
    return false;
  }
};

// ===== TRANSACTIONS =====
export const addTransaction = async (uid, transactionData) => {
  try {
    const transaction = {
      ...transactionData,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "transactions"), transaction);

    // Update user balance
    await updateUserBalance(uid, transactionData.amount, transactionData.type);

    // Award XP for transaction (10 XP per transaction)
    await updateUserXP(uid, 10);

    // 🏆 Check if this is the user's first transaction
    const userTransactions = await getUserTransactions(uid, 2);
    if (userTransactions.length === 1) {
      await awardBadge(uid, {
        name: "First Transaction",
        description: "Congrats on recording your first transaction!",
        icon: "💸"
      });
    }

    return { id: docRef.id, ...transaction };
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

export const getUserTransactions = async (uid, limitCount = 50) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
};

export const updateTransaction = async (transactionId, updates) => {
  try {
    const transactionRef = doc(db, "transactions", transactionId);
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    await deleteDoc(doc(db, "transactions", transactionId));
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

// ===== GOALS =====
export const addGoal = async (uid, goalData) => {
  try {
    const goal = {
      ...goalData,
      userId: uid,
      progress: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "goals"), goal);

    // Award XP for creating goal (50 XP)
    await updateUserXP(uid, 50);

    return { id: docRef.id, ...goal };
  } catch (error) {
    console.error("Error adding goal:", error);
    throw error;
  }
};

export const getUserGoals = async (uid) => {
  try {
    const q = query(
      collection(db, "goals"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error("Error getting goals:", error);
    throw error;
  }
};

export const updateGoalProgress = async (goalId, progressAmount) => {
  try {
    const goalRef = doc(db, "goals", goalId);
    const goalDoc = await getDoc(goalRef);
    const goalData = goalDoc.data();

    const newProgress = (goalData.progress || 0) + progressAmount;
    const progressPercentage = Math.min((newProgress / goalData.targetAmount) * 100, 100);

    const updates = {
      progress: newProgress,
      progressPercentage,
      updatedAt: serverTimestamp()
    };

    // Check if goal is completed
    if (progressPercentage >= 100 && goalData.status !== 'completed') {
      updates.status = 'completed';
      updates.completedAt = serverTimestamp();

      // Award XP for completing goal (200 XP)
      await updateUserXP(goalData.userId, 200);
    }

    await updateDoc(goalRef, updates);
    return updates;
  } catch (error) {
    console.error("Error updating goal progress:", error);
    throw error;
  }
};

// ===== BADGES & ACHIEVEMENTS =====
export const getUserBadges = async (uid) => {
  try {
    const q = query(
      collection(db, "userBadges"),
      where("userId", "==", uid),
      orderBy("earnedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      earnedAt: doc.data().earnedAt?.toDate()
    }));
  } catch (error) {
    console.error("Error getting badges:", error);
    throw error;
  }
};

export const awardBadge = async (uid, badgeData) => {
  try {
    const badge = {
      userId: uid,
      ...badgeData,
      earnedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "userBadges"), badge);

    // Award XP for earning badge (100 XP)
    await updateUserXP(uid, 100);

    return { id: docRef.id, ...badge };
  } catch (error) {
    console.error("Error awarding badge:", error);
    throw error;
  }
};

// ===== DAILY TASKS =====
export const getDailyTasks = async (uid) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "dailyTasks"),
      where("userId", "==", uid),
      where("date", ">=", today),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate()
    }));
  } catch (error) {
    console.error("Error getting daily tasks:", error);
    throw error;
  }
};

export const initializeUserTasks = async (userId) => {
  try {
    const tasksCol = collection(db, "users", userId, "dailyTasks");
    const startTime = Date.now();
 
    for (const dayObj of dailyTasksData) {
      const dayDocRef = doc(tasksCol, `day${dayObj.day}`);
      await setDoc(dayDocRef, {
        tasks: dayObj.tasks.map(task => ({
          ...task,
          completed: false,
          completedAt: null
        })),
        unlockTime: startTime + (dayObj.day - 1) * 24 * 60 * 60 * 1000,
        createdAt: serverTimestamp()
      });
    }

    // Also store the start time in the user's document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      tasksStartTime: startTime
    });

    console.log("Daily tasks initialized for user:", userId);
  } catch (error) {
    console.error("Error initializing daily tasks:", error);
    throw error;
  }
};

// Fetch all daily tasks for a user
export const getUserTasks = async (userId) => {
  try {
    const tasksCol = collection(db, "users", userId, "dailyTasks");
    const snapshot = await getDocs(tasksCol);
    
    if (snapshot.empty) {
      return null;
    }

    const tasks = [];
    snapshot.forEach(doc => {
      const dayNum = parseInt(doc.id.replace('day', ''));
      tasks.push({
        day: dayNum,
        ...doc.data()
      });
    });

    // Sort by day number
    tasks.sort((a, b) => a.day - b.day);
    return tasks;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    throw error;
  }
};

// Complete a specific task
export const completeTask = async (uid, day, taskId, xpReward = 25) => {
  try {
    const taskRef = doc(db, "users", uid, "dailyTasks", `day${day}`);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
      throw new Error("No daily tasks found for this day");
    }

    const tasks = taskSnap.data().tasks;
    const taskToComplete = tasks.find(t => t.id === taskId);

    if (!taskToComplete) {
      throw new Error("Task not found");
    }

    if (taskToComplete.completed) {
      throw new Error("Task already completed");
    }

    // ✅ Mark task as completed
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: true, completedAt: new Date().toISOString() }
        : task
    );

    await updateDoc(taskRef, { tasks: updatedTasks });

    // ✅ Award XP
    await updateUserXP(uid, xpReward);

    // ✅ Unlock next finance tip if this is the “Read Daily Tip” task
    if (taskId === "readDailyTip") {
      const tipRef = doc(db, "userFinanceTips", uid);
      const tipSnap = await getDoc(tipRef);

      if (tipSnap.exists()) {
        const currentIndex = tipSnap.data().currentTip || 0;
        await updateDoc(tipRef, {
          currentTip: currentIndex + 1,
          lastUpdated: serverTimestamp(),
        });
      } else {
        // Create document if none exists yet
        await setDoc(tipRef, {
          currentTip: 1,
          lastUpdated: serverTimestamp(),
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
};



// Get user's start time for task unlocking
export const getUserTasksStartTime = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data().tasksStartTime || null;
  } catch (error) {
    console.error("Error fetching tasks start time:", error);
    throw error;
  }
};

// ===== ANALYTICS =====
export const getUserAnalytics = async (uid, timeframe = 'month') => {
  try {
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", uid),
      where("createdAt", ">=", startDate),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));

    // Calculate analytics
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {});

    return {
      timeframe,
      period: { start: startDate, end: now },
      totals: { income, expenses, savings, savingsRate },
      transactionCount: transactions.length,
      categoryBreakdown,
      transactions
    };
  } catch (error) {
    console.error("Error getting analytics:", error);
    throw error;
  }
};

// ===== NOTIFICATIONS =====
export const getUserNotifications = async (uid) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", uid),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const createNotification = async (uid, notificationData) => {
  try {
    const notification = {
      userId: uid,
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "notifications"), notification);
    return { id: docRef.id, ...notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
