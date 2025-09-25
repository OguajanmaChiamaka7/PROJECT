import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    currency: user?.currency || 'USD',
    timezone: user?.timezone || 'UTC',
    savingsGoal: user?.savingsGoal || '',
    monthlyBudget: user?.monthlyBudget || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        currency: user.currency || 'USD',
        timezone: user.timezone || 'UTC',
        savingsGoal: user.savingsGoal || '',
        monthlyBudget: user.monthlyBudget || ''
      });
    }
  }, [user]);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      
      showMessage('Your profile has been updated successfully! 🎉');
      setIsEditing(false);
    } catch (error) {
      showMessage('Oops! Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match.', 'error');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showMessage('Password must be at least 8 characters long.', 'error');
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showMessage('Password updated successfully! Your account is more secure now. 🔐');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showMessage('Failed to update password. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ Are you absolutely sure you want to delete your MoniUp account? This action cannot be undone and you will lose all your financial data.')) {
      showMessage('Account deletion request received. Our team will contact you within 24 hours to confirm this action.', 'warning');
    }
  };

  const getInitials = () => {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="header-content">
            <h1>Account Settings</h1>
            <p>Manage your MoniUp profile and financial preferences</p>
          </div>
          <div className="moniup-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`message-alert ${messageType}`}>
            <div className="message-content">
              <span className="message-text">{message}</span>
              <button 
                onClick={() => setMessage('')}
                className="message-close"
                aria-label="Close message"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="profile-content">
          {/* Profile Photo Section */}
          <div className="profile-photo-section">
            <div className="avatar-container">
              <div className="avatar">
                {getInitials()}
              </div>
              <div className="avatar-status"></div>
            </div>
            <div className="profile-info">
              <h2>{profileData.firstName} {profileData.lastName}</h2>
              <p className="email">{profileData.email}</p>
              <p className="member-since">MoniUp member since 2024</p>
              <button className="change-photo-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 9c-.7 0-1.4-.1-2.1-.3-.2.6-.8 1-1.4 1-.9 0-1.6-.7-1.6-1.6 0-.4.2-.8.5-1.1-.9-.9-2.1-1.5-3.4-1.5s-2.5.6-3.4 1.5c.3.3.5.7.5 1.1 0 .9-.7 1.6-1.6 1.6-.6 0-1.2-.4-1.4-1C6.4 10.9 5.7 11 5 11c-2.8 0-5-2.2-5-5s2.2-5 5-5c.7 0 1.4.1 2.1.3.2-.6.8-1 1.4-1 .9 0 1.6.7 1.6 1.6 0 .4-.2.8-.5 1.1.9.9 2.1 1.5 3.4 1.5s2.5-.6 3.4-1.5c-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6.6 0 1.2.4 1.4 1C17.6 1.1 18.3 1 19 1c2.8 0 5 2.2 5 5s-2.2 5-5 5z"/>
                </svg>
                Change Photo
              </button>
            </div>
          </div>

          {/* Profile Information Form */}
          <div className="form-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : 'readonly'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : 'readonly'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : 'readonly'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : 'readonly'}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Preferred Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={profileData.currency}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : 'readonly'}
                  >
                    <option value="USD">🇺🇸 USD - US Dollar</option>
                    <option value="EUR">🇪🇺 EUR - Euro</option>
                    <option value="GBP">🇬🇧 GBP - British Pound</option>
                    <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                    <option value="NGN">🇳🇬 NGN - Nigerian Naira</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="timezone">Timezone</label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={profileData.timezone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : 'readonly'}
                  >
                    <option value="UTC">UTC - Coordinated Universal Time</option>
                    <option value="America/New_York">EST - Eastern Time</option>
                    <option value="America/Chicago">CST - Central Time</option>
                    <option value="America/Denver">MST - Mountain Time</option>
                    <option value="America/Los_Angeles">PST - Pacific Time</option>
                    <option value="Africa/Lagos">WAT - West Africa Time</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="bio">About You</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className={isEditing ? 'editable' : 'readonly'}
                    placeholder="Tell us about your financial goals and interests..."
                  />
                </div>
              </div>

              {/* Financial Preferences */}
              <div className="financial-section">
                <h4>Financial Preferences</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="savingsGoal">Monthly Savings Goal</label>
                    <input
                      type="number"
                      id="savingsGoal"
                      name="savingsGoal"
                      value={profileData.savingsGoal}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={isEditing ? 'editable' : 'readonly'}
                      placeholder="1000"
                      min="0"
                      step="10"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="monthlyBudget">Monthly Budget</label>
                    <input
                      type="number"
                      id="monthlyBudget"
                      name="monthlyBudget"
                      value={profileData.monthlyBudget}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={isEditing ? 'editable' : 'readonly'}
                      placeholder="3000"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success"
                  >
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>Security & Privacy</h3>
              <div className="security-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                </svg>
                Secured
              </div>
            </div>
            
            <div className="security-actions">
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="btn btn-warning"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                </svg>
                Change Password
              </button>
            </div>

            {showChangePassword && (
              <div className="password-form-container">
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="editable"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="editable"
                      minLength="8"
                      required
                    />
                    <small className="form-help">Must be at least 8 characters long</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="editable"
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-success"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="form-section danger-zone">
            <div className="section-header">
              <h3>Account Management</h3>
            </div>
            
            <div className="account-actions">
              <button
                onClick={handleLogout}
                className="btn btn-outline"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                </svg>
                Sign Out
              </button>
              
              <button
                onClick={handleDeleteAccount}
                className="btn btn-danger"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;