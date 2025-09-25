import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../services/firebase';

const SavingsCircleContext = createContext();

export const SavingsCircleProvider = ({ children }) => {
  const [circles, setCircles] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    totalSaved: 0,
    circlesJoined: 0
  });
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const loadSavingsCircles = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'savingsCircles'),
        where('members', 'array-contains', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const circlesData = snapshot.docs.map(doc => {
        const data = doc.data();
        const progress = data.goalAmount > 0 ? (data.currentAmount / data.goalAmount) * 100 : 0;
        const daysLeft = data.targetDate ? Math.ceil((new Date(data.targetDate.toDate()) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

        return {
          id: doc.id,
          ...data,
          progress: Math.min(progress, 100),
          daysLeft: Math.max(daysLeft, 0),
          createdAt: data.createdAt?.toDate(),
          targetDate: data.targetDate?.toDate()
        };
      });

      setCircles(circlesData);
    } catch (error) {
      console.error('Error loading savings circles:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      const leaderboardData = snapshot.docs.slice(0, 10).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'Anonymous',
          level: data.level || 1,
          xp: data.xp || 0,
          badge: data.badge || '🏅'
        };
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      throw error;
    }
  };

  const loadUserStats = async () => {
    if (!currentUser) return;

    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', currentUser.uid)
      );

      const snapshot = await getDocs(userQuery);
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setUserStats({
          level: userData.level || 1,
          xp: userData.xp || 0,
          totalSaved: userData.totalSaved || 0,
          circlesJoined: userData.circlesJoined || 0
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const createCircle = async (circleData) => {
    if (!currentUser) throw new Error('User must be logged in');

    try {
      const newCircle = {
        ...circleData,
        creator: currentUser.uid,
        members: [currentUser.uid],
        currentAmount: 0,
        contributions: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'savingsCircles'), newCircle);

      // Update user's circles joined count
      await updateUserCircleCount();

      return docRef.id;
    } catch (error) {
      console.error('Error creating savings circle:', error);
      throw error;
    }
  };

  const joinCircle = async (circleId) => {
    if (!currentUser) throw new Error('User must be logged in');

    try {
      const circleRef = doc(db, 'savingsCircles', circleId);

      await updateDoc(circleRef, {
        members: arrayUnion(currentUser.uid),
        updatedAt: Timestamp.now()
      });

      // Update user's circles joined count
      await updateUserCircleCount();

      // Reload circles
      await loadSavingsCircles();
    } catch (error) {
      console.error('Error joining circle:', error);
      throw error;
    }
  };

  const leaveCircle = async (circleId) => {
    if (!currentUser) throw new Error('User must be logged in');

    try {
      const circleRef = doc(db, 'savingsCircles', circleId);

      await updateDoc(circleRef, {
        members: arrayRemove(currentUser.uid),
        updatedAt: Timestamp.now()
      });

      // Update user's circles joined count
      await updateUserCircleCount();

      // Reload circles
      await loadSavingsCircles();
    } catch (error) {
      console.error('Error leaving circle:', error);
      throw error;
    }
  };

  const contributeToCircle = async (circleId, amount) => {
    if (!currentUser) throw new Error('User must be logged in');

    try {
      const circleRef = doc(db, 'savingsCircles', circleId);
      const contributionKey = `contributions.${currentUser.uid}`;

      await updateDoc(circleRef, {
        currentAmount: increment(amount),
        [contributionKey]: increment(amount),
        updatedAt: Timestamp.now()
      });

      // Award XP for contribution
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        xp: increment(Math.floor(amount / 100)), // 1 XP per ₦100 contributed
        totalSaved: increment(amount)
      });

      // Reload circles and user stats
      await Promise.all([
        loadSavingsCircles(),
        loadUserStats()
      ]);
    } catch (error) {
      console.error('Error contributing to circle:', error);
      throw error;
    }
  };

  const updateUserCircleCount = async () => {
    if (!currentUser) return;

    try {
      const userCirclesQuery = query(
        collection(db, 'savingsCircles'),
        where('members', 'array-contains', currentUser.uid)
      );

      const snapshot = await getDocs(userCirclesQuery);
      const circleCount = snapshot.size;

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        circlesJoined: circleCount
      });

      setUserStats(prev => ({ ...prev, circlesJoined: circleCount }));
    } catch (error) {
      console.error('Error updating user circle count:', error);
    }
  };

  const setupCircleListeners = () => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'savingsCircles'),
      where('members', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const circlesData = snapshot.docs.map(doc => {
        const data = doc.data();
        const progress = data.goalAmount > 0 ? (data.currentAmount / data.goalAmount) * 100 : 0;
        const daysLeft = data.targetDate ? Math.ceil((new Date(data.targetDate.toDate()) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

        return {
          id: doc.id,
          ...data,
          progress: Math.min(progress, 100),
          daysLeft: Math.max(daysLeft, 0),
          createdAt: data.createdAt?.toDate(),
          targetDate: data.targetDate?.toDate()
        };
      });

      setCircles(circlesData);
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (currentUser) {
      loadUserStats();
      const unsubscribe = setupCircleListeners();
      return () => unsubscribe && unsubscribe();
    } else {
      setCircles([]);
      setLeaderboard([]);
      setUserStats({
        level: 1,
        xp: 0,
        totalSaved: 0,
        circlesJoined: 0
      });
    }
  }, [currentUser]);

  const value = {
    circles,
    leaderboard,
    userStats,
    loading,
    loadSavingsCircles,
    loadLeaderboard,
    loadUserStats,
    createCircle,
    joinCircle,
    leaveCircle,
    contributeToCircle
  };

  return (
    <SavingsCircleContext.Provider value={value}>
      {children}
    </SavingsCircleContext.Provider>
  );
};

export const useSavingsCircle = () => {
  const context = useContext(SavingsCircleContext);
  if (!context) {
    throw new Error('useSavingsCircle must be used within a SavingsCircleProvider');
  }
  return context;
};