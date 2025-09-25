import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Eye, EyeOff, Calendar, TrendingUp, Target, DollarSign, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransaction } from '../context/TransactionContext';
import { useGoals } from '../context/GoalsContext';
import { useGamification } from '../context/GamificationContext';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { currentUser } = useAuth();
  const { transactions } = useTransaction();
  const { goals } = useGoals();
  const { userStats } = useGamification();

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      generateSystemNotifications();
      setupNotificationListener();
    }
  }, [currentUser, transactions, goals, userStats]);

  const loadNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupNotificationListener = () => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  };

  const generateSystemNotifications = async () => {
    if (!currentUser || !goals || !transactions) return;

    try {
      // Check for goal deadlines approaching
      const upcomingDeadlines = goals.filter(goal => {
        if (!goal.targetDate) return false;
        const daysUntilDeadline = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 7 && daysUntilDeadline > 0 && goal.progress < 100;
      });

      for (const goal of upcomingDeadlines) {
        const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        await createNotification({
          type: 'goal_deadline',
          title: 'Goal Deadline Approaching',
          message: `Your goal "${goal.name}" is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Current progress: ${goal.progress.toFixed(1)}%`,
          icon: '⏰',
          priority: daysLeft <= 3 ? 'high' : 'medium',
          actionUrl: '/app/goals'
        });
      }

      // Check for completed goals
      const completedGoals = goals.filter(goal => goal.progress >= 100);
      for (const goal of completedGoals) {
        await createNotification({
          type: 'goal_completed',
          title: 'Goal Achieved! 🎉',
          message: `Congratulations! You've completed your goal: "${goal.name}"`,
          icon: '🎯',
          priority: 'high',
          actionUrl: '/app/goals'
        });
      }

      // Check spending patterns
      const thisMonth = new Date();
      const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
      const thisMonthTransactions = transactions.filter(t => new Date(t.date) >= lastMonth);
      const totalSpent = thisMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      if (totalSpent > 100000) { // ₦100,000
        await createNotification({
          type: 'spending_alert',
          title: 'High Spending Alert',
          message: `You've spent ₦${totalSpent.toLocaleString()} this month. Consider reviewing your expenses.`,
          icon: '⚠️',
          priority: 'medium',
          actionUrl: '/app/analytics'
        });
      }

      // Level up notifications
      if (userStats?.level > 1) {
        await createNotification({
          type: 'level_up',
          title: 'Level Up! 🚀',
          message: `You've reached Level ${userStats.level}! Keep up the great financial habits.`,
          icon: '🏆',
          priority: 'high',
          actionUrl: '/app/gamification'
        });
      }

    } catch (error) {
      console.error('Error generating system notifications:', error);
    }
  };

  const createNotification = async (notificationData) => {
    if (!currentUser) return;

    try {
      // Check if similar notification already exists (prevent duplicates)
      const existingQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        where('type', '==', notificationData.type),
        where('createdAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      );

      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) return; // Don't create duplicate

      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        userId: currentUser.uid,
        read: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), {
          read: true,
          updatedAt: Timestamp.now()
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'goals':
        return notifications.filter(n => n.type?.includes('goal'));
      case 'financial':
        return notifications.filter(n => n.type?.includes('spending') || n.type?.includes('income'));
      case 'system':
        return notifications.filter(n => n.type?.includes('level') || n.type?.includes('achievement'));
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'goal_deadline':
        return '⏰';
      case 'goal_completed':
        return '🎯';
      case 'spending_alert':
        return '⚠️';
      case 'level_up':
        return '🚀';
      case 'achievement':
        return '🏆';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <Bell className="header-icon" />
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Stay updated with your financial journey</p>
          </div>
        </div>
        <div className="header-stats">
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
          <button
            className="btn btn-secondary"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check size={16} />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { key: 'all', label: 'All', icon: Bell },
          { key: 'unread', label: 'Unread', icon: EyeOff },
          { key: 'goals', label: 'Goals', icon: Target },
          { key: 'financial', label: 'Financial', icon: DollarSign },
          { key: 'system', label: 'System', icon: Info }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`filter-tab ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            <Icon size={16} />
            {label}
            {key === 'unread' && unreadCount > 0 && (
              <span className="tab-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} className="empty-icon" />
            <h3>No Notifications</h3>
            <p>
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet. Start using the app to receive updates!"
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <div className="notification-icon">
                    <span className="icon-emoji">{getNotificationIcon(notification)}</span>
                    {notification.priority && (
                      <div
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      />
                    )}
                  </div>
                  <div className="notification-text">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="action-btn read-btn"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {notification.actionUrl && (
                <div className="notification-action">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => window.location.href = notification.actionUrl}
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;