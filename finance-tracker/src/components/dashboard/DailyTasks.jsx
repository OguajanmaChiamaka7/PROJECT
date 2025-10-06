import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import '../../styles/DailyTasks.css';
import { getAuth } from 'firebase/auth';
import { completeTask, getUserTasks, getUserTasksStartTime } from '../../services/firestore';
import { useGamification } from "../../context/GamificationContext";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

const DAILY_MS = 24 * 60 * 60 * 1000; // 24 hours

const DailyTasks = () => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { checkAndAwardBadges } = useGamification();

  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  // Fetch tasks from Firestore on mount
  useEffect(() => {
    const fetchTasks = async () => {
      if (!uid) {
        setError("Please log in to view tasks");
        setLoading(false);
        return;
      }

      try {
        const [tasks, userStartTime] = await Promise.all([
          getUserTasks(uid),
          getUserTasksStartTime(uid)
        ]);

        if (!tasks || tasks.length === 0) {
          setError("No tasks found. Please contact support.");
          setLoading(false);
          return;
        }

        setDailyTasks(
              tasks.map(day => ({
                ...day,
                tasks: day.tasks.map(t => ({
                  ...t,
                  completed: t.completed || false,
                })),
              }))
            );

        setStartTime(userStartTime || Date.now());

        // Determine current unlocked day
        const now = Date.now();
        let unlockedDay = 0;
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].unlockTime <= now) {
            unlockedDay = i;
          } else {
            break;
          }
        }
        setCurrentDayIndex(unlockedDay);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please refresh.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, [uid]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance to next day when all tasks completed and time has passed
  useEffect(() => {
    if (dailyTasks.length === 0 || !startTime) return;

    const day = dailyTasks[currentDayIndex];
    if (!day) return;

    const allCompleted = day.tasks.every(t => t.completed);
    const nextDayIndex = currentDayIndex + 1;

    if (allCompleted && nextDayIndex < dailyTasks.length) {
      const nextDay = dailyTasks[nextDayIndex];
      if (nextDay && currentTime >= nextDay.unlockTime) {
        setCurrentDayIndex(nextDayIndex);
      }
    }
  }, [dailyTasks, currentDayIndex, currentTime, startTime]);

  // ✅ Handler to COMPLETE a task - with validation
  const handleToggleTask = async (task) => {
    if (!uid) return;
    if (task.completed) {
      alert("This task is already completed!");
      return;
    }

    try {
      // 🔍 Validate that the user has actually completed the required action
      const isValid = await validateTaskCompletion(task);

      if (!isValid.success) {
        alert(isValid.message);
        return;
      }

      // ✅ Save to Firestore (this awards XP automatically via completeTask function)
      await completeTask(uid, currentDayIndex + 1, task.id, task.xp);

      // ✅ Update UI after successful completion
      setDailyTasks(prev =>
        prev.map((day, index) =>
          index === currentDayIndex
            ? {
                ...day,
                tasks: day.tasks.map(t =>
                  t.id === task.id
                    ? { ...t, completed: true, completedAt: new Date().toISOString() }
                    : t
                ),
              }
            : day
        )
      );

      // ✅ Check and unlock badges
      await checkAndAwardBadges(uid, { type: "taskCompleted", task });

      // Bonus badge triggers based on task type
      if (task.type === "save_money") {
        await checkAndAwardBadges(uid, { type: "savings_milestone" });
      }
      if (task.type === "track_expense") {
        await checkAndAwardBadges(uid, { type: "first_transaction" });
      }

      alert(`✅ Task completed! You earned ${task.xp} XP!`);

    } catch (error) {
      console.error("Task completion failed:", error);
      alert("Something went wrong while completing your task. Please try again.");
    }
  };

  // ❌ Handler to CANCEL/UNCOMPLETE a task - with validation
  const handleCancelTask = async (task, e) => {
    e.stopPropagation(); // Prevent triggering the onClick on parent div

    if (!uid) return;
    if (!task.completed) {
      alert("This task hasn't been completed yet!");
      return;
    }

    try {
      // 🔍 Check if user has actually completed the task action
      const isValid = await validateTaskCompletion(task);

      if (!isValid.success) {
        alert(`❌ Cannot cancel! ${isValid.message}\n\nYou must complete the task action before you can cancel it.`);
        return;
      }

      // User has completed the task, so they can cancel it
      if (!window.confirm(`Are you sure you want to unmark "${task.title}"?`)) {
        return;
      }

      // Update in Firestore
      const taskRef = doc(db, "users", uid, "dailyTasks", `day${currentDayIndex + 1}`);
      const taskSnap = await getDoc(taskRef);

      if (taskSnap.exists()) {
        const tasks = taskSnap.data().tasks;
        const updatedTasks = tasks.map(t =>
          t.id === task.id
            ? { ...t, completed: false, completedAt: null }
            : t
        );

        await updateDoc(taskRef, { tasks: updatedTasks });

        // Update UI
        setDailyTasks(prev =>
          prev.map((day, index) =>
            index === currentDayIndex
              ? {
                  ...day,
                  tasks: day.tasks.map(t =>
                    t.id === task.id
                      ? { ...t, completed: false, completedAt: null }
                      : t
                  ),
                }
              : day
          )
        );

        alert("Task unmarked successfully!");
      }

    } catch (error) {
      console.error("Task cancel failed:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  // 🔍 Validate task completion based on type
  const validateTaskCompletion = async (task) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      switch (task.type) {
        case "save_money":
          try {
            // Check if user has saved at least ₦500 today
            const savingsRef = collection(db, "transactions");
            const q1 = query(
              savingsRef,
              where("userId", "==", uid),
              where("type", "==", "income"),
              where("category", "==", "Savings"),
              where("date", ">=", today)
            );
            const savingsSnapshot = await getDocs(q1);

            // Calculate total savings today
            let totalSavings = 0;
            savingsSnapshot.forEach(doc => {
              totalSavings += doc.data().amount || 0;
            });

            if (totalSavings >= 500) {
              return { success: true };
            } else {
              return {
                success: false,
                message: `You need to save at least ₦500 today.\nCurrent savings: ₦${totalSavings}\n\nGo to Transactions → Add Income → Category: Savings → Amount: ₦500 or more`
              };
            }
          } catch (indexError) {
            if (indexError.message.includes("index")) {
              return {
                success: false,
                message: "⚠️ Database index is still building.\n\nPlease wait 5-10 minutes and try again.\n\nMeanwhile, make sure you've created the index by clicking the link in the browser console."
              };
            }
            throw indexError;
          }

        case "track_expense":
          try {
            // Verify user has logged at least 1 expense transaction today
            const transactionsRef = collection(db, "transactions");
            const q2 = query(
              transactionsRef,
              where("userId", "==", uid),
              where("type", "==", "expense"),
              where("date", ">=", today)
            );
            const transactionSnapshot = await getDocs(q2);

            if (!transactionSnapshot.empty) {
              return { success: true };
            } else {
              return {
                success: false,
                message: "You need to record at least one expense today.\n\nGo to Transactions → Add Expense"
              };
            }
          } catch (indexError) {
            if (indexError.message.includes("index")) {
              return {
                success: false,
                message: "⚠️ Database index is still building.\n\nPlease wait 5-10 minutes and try again.\n\nMeanwhile, make sure you've created the index by clicking the link in the browser console."
              };
            }
            throw indexError;
          }

        case "read_tip":
          // Check if user has viewed at least one financial tip
          const tipsRef = doc(db, "userFinanceTips", uid);
          const tipSnap = await getDoc(tipsRef);

          if (tipSnap.exists() && (tipSnap.data().currentTip || 0) >= 1) {
            return { success: true };
          } else {
            return {
              success: false,
              message: "You need to read at least one financial tip.\n\nGo to Learning → Tips section"
            };
          }

        case "set_goal":
          // Check if user has created at least one savings goal
          const goalsRef = collection(db, "goals");
          const q3 = query(
            goalsRef,
            where("userId", "==", uid)
          );
          const goalsSnapshot = await getDocs(q3);

          if (!goalsSnapshot.empty) {
            return { success: true };
          } else {
            return {
              success: false,
              message: "You need to set a savings goal first.\n\nGo to Goals → Add New Goal"
            };
          }

        default:
          // For tasks without specific type, auto-validate
          return { success: true };
      }
    } catch (error) {
      console.error("Validation error:", error);
      return {
        success: false,
        message: `Error validating task: ${error.message}`
      };
    }
  };

  const getCountdown = () => {
    if (!dailyTasks.length || !startTime) return null;
    const nextDayIndex = currentDayIndex + 1;
    if (nextDayIndex >= dailyTasks.length) return null;

    const nextDay = dailyTasks[nextDayIndex];
    if (!nextDay) return null;

    const remaining = nextDay.unlockTime - currentTime;
    if (remaining <= 0) return null;

    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="daily-tasks-container">
        <div className="daily-tasks-card">
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-tasks-container">
        <div className="daily-tasks-card">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (dailyTasks.length === 0) {
    return (
      <div className="daily-tasks-container">
        <div className="daily-tasks-card">
          <p>No tasks available</p>
        </div>
      </div>
    );
  }

  const day = dailyTasks[currentDayIndex];
  const completedTasks = day.tasks.filter(t => t.completed).length;
  const totalTasks = day.tasks.length;
  const taskProgress = (completedTasks / totalTasks) * 100;

  return (
    <div className="daily-tasks-container">
      <div className="daily-tasks-card slide-in">
        <div className="daily-tasks-header">
          <h2 className="daily-tasks-title">Day {day.day} Tasks</h2>
          <div className="daily-tasks-counter">
            <span className="counter-text">{completedTasks}/{totalTasks}</span>
            <CheckCircle className="counter-icon" />
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${taskProgress}%` }}
            ></div>
          </div>
        </div>

        {completedTasks === totalTasks && currentDayIndex + 1 < dailyTasks.length && (
          <div className="countdown-text">
            Next tasks unlock in: {getCountdown() || "Soon..."}
          </div>
        )}

        <div className="tasks-list">
          {day.tasks.map(task => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : 'incomplete'}`}
              onClick={() => !task.completed && handleToggleTask(task)}
              style={{ cursor: task.completed ? 'default' : 'pointer' }}
            >
              <div className="task-left">
                <div className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
                  {task.completed && <CheckCircle className="check-icon" />}
                </div>
                <span className={`task-text ${task.completed ? 'struck' : ''}`}>
                  {task.title}
                </span>
              </div>
              <div className="task-right">
                <div className="xp-badge">
                  +{task.xp} XP
                </div>
                {task.completed && (
                  <button
                    className="cancel-task-btn"
                    onClick={(e) => handleCancelTask(task, e)}
                    title="Cancel/Unmark task"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyTasks;
