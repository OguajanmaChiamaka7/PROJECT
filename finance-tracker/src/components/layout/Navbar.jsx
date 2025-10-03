

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, User, PiggyBank, Search, ChevronDown, Settings, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

const NavItem = ({ text, to, active = false }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (to) {
      navigate(to);
    }
  };

  if (to) {
    return (
      <a
        href={to}
        onClick={handleClick}
        className={`nav-item ${active ? 'active' : ''}`}
        style={{ cursor: 'pointer', textDecoration: 'none' }}
      >
        {text}
      </a>
    );
  }

  return (
    <div className={`nav-item ${active ? 'active' : ''}`}>
      {text}
    </div>
  );
};

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* LEFT: toggle + logo */}
        <div className="navbar-left">
          <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <Menu className="icon" size={192} />
          </button>

          <div className="logo" onClick={() => navigate('/app')} style={{ cursor: 'pointer' }}>
            <PiggyBank size={24} className="logo-icon" />
            <span className="logo-text">MoniUp</span>
          </div>
        </div>

        {/* RIGHT: balance + notifications + profile */}
        <div className="navbar-right">
          <div className="balance-display">
            <Wallet size={16} className="balance-icon" />
            <span className="balance-amount">₦{(currentUser?.balance || 0).toLocaleString()}</span>
          </div>

          <div className="notification-wrapper">
            <button className="icon-btn notification-btn" aria-label="Notifications">
              <Bell className="icon" />
              <span className="notification-badge">3</span>
            </button>
          </div>

          <div className="profile-wrapper">
            <button className="profile-btn" onClick={toggleProfileMenu} aria-label="Profile menu">
              <div className="avatar">
                <User className="user-icon" />
              </div>
              <div className="profile-info">
                <span className="profile-name">{currentUser?.displayName || 'User'}</span>
                <span className="profile-level">Level 1</span>
              </div>
              <ChevronDown className={`chevron ${isProfileMenuOpen ? 'open' : ''}`} size={16} />
            </button>

            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="dropdown-name">{currentUser?.displayName || 'User'}</div>
                    <div className="dropdown-email">{currentUser?.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => navigate('/app/profile')}>
                  <User size={16} />
                  Profile
                </button>
                <button className="dropdown-item" onClick={() => navigate('/app/settings')}>
                  <Settings size={16} />
                  Settings
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay to close dropdown */}
      {isProfileMenuOpen && (
        <div className="dropdown-overlay" onClick={() => setIsProfileMenuOpen(false)}></div>
      )}
    </header>
  );
};

export default Navbar;