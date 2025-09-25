import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { 
  X, User, CheckSquare, TrendingUp, Trophy, Award, 
  Users, Gift, Bell, Wallet 
} from 'lucide-react';
import '../../styles/Sidebar.css'; 

const SidebarItem = ({ icon: Icon, text, to, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
  >
    <div className="item-left">
      <Icon className="item-icon" />
      <span className="item-text">{text}</span>
    </div>
    {badge && <span className="item-badge">{badge}</span>}
  </NavLink>
);

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <aside
      className={`sidebar ${sidebarOpen ? 'open' : ''}`}
      aria-hidden={!sidebarOpen}
    >
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <Wallet className="wallet-icon" />
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
          <div>
            <p className="user-name">Alex Johnson</p>
            <p className="user-level">Level 12 Saver</p>
          </div>
        </div>

        <div className="xp-section">
          <div className="xp-header">
            <span>XP: 2,450</span>
            <span>2,500</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: '98%' }} />
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <SidebarItem icon={User} text="Account" to="/app/profile" />
        <SidebarItem icon={CheckSquare} text="Tasks" to="/app/tasks" badge="3" />
        <SidebarItem icon={TrendingUp} text="Progress" to="/app/progress" />
        <SidebarItem icon={Trophy} text="Badges" to="/app/badges" />
        <SidebarItem icon={Users} text="Savings Circles" to="/app/SavingsCircles" />
        {/* <SidebarItem icon={Award} text="Achievements" to="/app/achievements" /> */}
        <SidebarItem icon={Gift} text="Rewards" to="/app/rewards" />
        <SidebarItem icon={Bell} text="Notifications" to="/app/notifications" badge="2" />
      </nav>
    </aside>
  );
};

export default Sidebar; 