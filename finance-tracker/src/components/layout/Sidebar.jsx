import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X, User, CheckSquare, TrendingUp, Trophy, Award,
  Users, Gift, Bell, Wallet, Home, BarChart3, Target,
  CreditCard, PiggyBank, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import '../../styles/Sidebar.css';

const SidebarItem = ({ icon: Icon, text, to, badge, isDanger = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} ${isDanger ? 'danger' : ''}`}
  >
    <div className="item-left">
      <Icon className="item-icon" />
      <span className="item-text">{text}</span>
    </div>
    {badge && <span className="item-badge">{badge}</span>}
  </NavLink>
);

const SidebarButton = ({ icon: Icon, text, onClick, isDanger = false, badge }) => (
  <button
    onClick={onClick}
    className={`sidebar-item sidebar-button ${isDanger ? 'danger' : ''}`}
  >
    <div className="item-left">
      <Icon className="item-icon" />
      <span className="item-text">{text}</span>
    </div>
    {badge && <span className="item-badge">{badge}</span>}
  </button>
);

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { userStats, getLevelProgress, getPendingTasksToday } = useGamification();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const levelProgress = getLevelProgress();
  const pendingTasks = getPendingTasksToday();

  return (
    <aside
      className={`sidebar ${sidebarOpen ? 'open' : ''}`}
      aria-hidden={!sidebarOpen}
    >
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <PiggyBank className="wallet-icon" />
          </div>
          <span className="brand-text">MoniUp</span>
        </div>

        <button
          className="close-btn"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <X className="close-icon" />
        </button>
      </div>

      <div className="user-section">
        <div className="user-info">
          <div className="user-avatar">
            <User className="avatar-icon" />
          </div>
          <div className="user-details">
            <p className="user-name">{currentUser?.displayName || 'User'}</p>
            <p className="user-level">Level {userStats.level} Saver</p>
            <p className="user-balance">₦{(currentUser?.balance || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="xp-section">
          <div className="xp-header">
            <span className="xp-current">XP: {userStats.xp}</span>
            <span className="xp-target">{userStats.level * 1000}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${levelProgress.percentage}%` }} />
          </div>
          <div className="xp-next-level">{levelProgress.total - levelProgress.current} XP to next level</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          <SidebarItem icon={Home} text="Dashboard" to="/app" />
          <SidebarItem icon={CreditCard} text="Transactions" to="/app/transactions" />
          <SidebarItem icon={Target} text="Goals" to="/app/goals" badge="2" />
          <SidebarItem icon={BarChart3} text="Analytics" to="/app/analytics" />
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Gamification</div>
          <SidebarItem icon={CheckSquare} text="Daily Tasks" to="/app/tasks" badge={pendingTasks.length > 0 ? pendingTasks.length.toString() : null} />
          <SidebarItem icon={TrendingUp} text="Progress" to="/app/progress" />
          <SidebarItem icon={Trophy} text="Badges" to="/app/badges" />
          <SidebarItem icon={Users} text="Savings Circle" to="/app/savings" />
          <SidebarItem icon={Gift} text="Rewards" to="/app/rewards" badge="1" />
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Account</div>
          <SidebarItem icon={User} text="Profile" to="/app/profile" />
          <SidebarItem icon={Bell} text="Notifications" to="/app/notifications" badge="2" />
          <SidebarItem icon={Settings} text="Settings" to="/app/settings" />
        </div>

        <div className="nav-section nav-section-bottom">
          <SidebarButton
            icon={LogOut}
            text="Sign Out"
            onClick={handleLogout}
            isDanger={true}
          />
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar; 