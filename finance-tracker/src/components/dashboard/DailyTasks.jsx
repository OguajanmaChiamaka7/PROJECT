import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import '../../styles/DailyTasks.css';
import { getAuth } from 'firebase/auth';
import { completeTask, getUserTasks, getUserTasksStartTime } from '../../services/firestore';
import { useGamification } from "../../context/GamificationContext";

const DAILY_MS = 24 * 60 * 60 * 1000; // 24 hours

const DailyTasks = () => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Gamification functions from context
  const { checkAndAwardBadges, awardXP } = useGamification();

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

        setDailyTasks(tasks);
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

  // ✅ Unified handler: Award XP + check badges when completing a task
  const handleToggleTask = async (task) => {
    if (!uid) return;
    if (task.completed) return;

    // Optimistic UI update
    const prevTasks = [...dailyTasks];
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

    try {
      // 1) Save to Firestore
      await completeTask(uid, currentDayIndex + 1, task.id, task.xp);

      // 2) Award XP with description
      await awardXP(task.xp, `Completed task: ${task.title}`);

      // 3) Check & unlock badges based on task type and context
      await checkAndAwardBadges(uid, { 
        type: "taskCompleted", 
        task,
        taskType: task.type 
      });

      // Additional badge checks for specific task types
      if (task.type === "savings") {
        await checkAndAwardBadges(uid, { type: "savings_milestone" });
      }
      if (task.type === "transaction") {
        await checkAndAwardBadges(uid, { type: "first_transaction" });
      }

    } catch (error) {
      console.error("Failed to complete task:", error);
      // Rollback UI on error
      setDailyTasks(prevTasks);
      alert("Failed to complete task. Please try again.");
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
              onClick={() => handleToggleTask(task)}
            >
              <div className="task-left">
                <div className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
                  {task.completed && <CheckCircle className="check-icon" />}
                </div>
                <span className={`task-text ${task.completed ? 'struck' : ''}`}>
                  {task.title}
                </span>
              </div>
              <div className="xp-badge">
                +{task.xp} XP
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyTasks;