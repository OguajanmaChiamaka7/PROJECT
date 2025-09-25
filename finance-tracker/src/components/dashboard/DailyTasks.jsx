import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import '../../styles/DailyTasks.css';

const DailyTasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Save ₦500 today",
      completed: false,
      xp: 50
    },
    {
      id: 2,
      title: "Complete financial quiz",
      completed: true,
      xp: 100
    },
    {
      id: 3,
      title: "Invite a friend",
      completed: false,
      xp: 200
    },
    {
      id: 4,
      title: "Set weekly budget",
      completed: true,
      xp: 75
    }
  ]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = (completedTasks / totalTasks) * 100;

  const toggleTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="daily-tasks-container">
      <div className="daily-tasks-card">
        <div className="daily-tasks-header">
          <h2 className="daily-tasks-title">Daily Tasks</h2>
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

        <div className="tasks-list">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`task-item ${task.completed ? 'completed' : 'incomplete'}`}
              onClick={() => toggleTask(task.id)}
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