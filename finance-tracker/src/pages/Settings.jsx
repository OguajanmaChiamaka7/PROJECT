import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  Camera,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/Settings.css';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { currentUser, logout } = useAuth();

  // Profile Settings
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    phone: '',
    bio: '',
    location: ''
  });

  // Security Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'NGN',
    dateFormat: 'DD/MM/YYYY',
    notifications: {
      email: true,
      push: true,
      sms: false,
      goalReminders: true,
      spendingAlerts: true,
      weeklyReports: true
    },
    privacy: {
      profileVisible: true,
      shareAnalytics: false,
      showInLeaderboard: true
    },
    sounds: {
      enabled: true,
      volume: 50
    }
  });

  useEffect(() => {
    loadUserSettings();
  }, [currentUser]);

  const loadUserSettings = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load profile data
      setProfileData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || '',
        phone: currentUser.phoneNumber || '',
        bio: '',
        location: ''
      });

      // Load user preferences from Firestore
      const userDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setPreferences(prev => ({
          ...prev,
          ...data.preferences,
          notifications: { ...prev.notifications, ...data.preferences?.notifications },
          privacy: { ...prev.privacy, ...data.preferences?.privacy },
          sounds: { ...prev.sounds, ...data.preferences?.sounds }
        }));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        updatedAt: new Date()
      });

      showMessage('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      showMessage('success', 'Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Current password is incorrect');
      } else {
        showMessage('error', 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);

    try {
      const settingsRef = doc(db, 'userSettings', currentUser.uid);
      await setDoc(settingsRef, {
        userId: currentUser.uid,
        preferences,
        updatedAt: new Date()
      }, { merge: true });

      showMessage('success', 'Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      showMessage('error', 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setLoading(true);

    try {
      // Collect all user data
      const userData = {
        profile: profileData,
        preferences,
        exportDate: new Date().toISOString()
      };

      // Get transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      userData.transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get goals
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', currentUser.uid)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      userData.goals = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('success', 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('error', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const password = window.prompt('Please enter your password to confirm account deletion:');
    if (!password) return;

    setLoading(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user data from Firestore
      const batch = writeBatch(db);

      // Delete user documents
      const userCollections = ['transactions', 'goals', 'userSettings', 'notifications'];
      for (const collectionName of userCollections) {
        const q = query(collection(db, collectionName), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      // Delete main user document
      batch.delete(doc(db, 'users', currentUser.uid));

      await batch.commit();

      // Delete Firebase Auth user
      await deleteUser(currentUser);

      showMessage('success', 'Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Incorrect password');
      } else {
        showMessage('error', 'Failed to delete account');
      }
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'data', label: 'Data & Export', icon: Download }
  ];

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <SettingsIcon className="header-icon" />
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-item ${activeSection === id ? 'active' : ''}`}
              onClick={() => setActiveSection(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {activeSection === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                <p>Update your personal information and profile details</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="settings-form">
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Enter your display name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileData.email}
                    disabled
                    placeholder="Email address"
                  />
                  <small className="form-hint">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter your location"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <RefreshCw size={16} className="spinning" /> : <Save size={16} />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Security Settings</h2>
                <p>Change your password and manage security preferences</p>
              </div>

              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="input-with-icon">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-with-icon">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-with-icon">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <RefreshCw size={16} className="spinning" /> : <Shield size={16} />}
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Application Preferences</h2>
                <p>Customize your app experience</p>
              </div>

              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={preferences.theme === 'light'}
                        onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                      />
                      <Sun size={16} />
                      Light
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={preferences.theme === 'dark'}
                        onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                      />
                      <Moon size={16} />
                      Dark
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    className="form-select"
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={preferences.currency}
                    onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date Format</label>
                  <select
                    className="form-select"
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sounds</label>
                  <div className="toggle-group">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={preferences.sounds.enabled}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          sounds: { ...prev.sounds, enabled: e.target.checked }
                        }))}
                      />
                      <span className="toggle-slider"></span>
                      {preferences.sounds.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      Enable Sounds
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePreferencesUpdate}
                  disabled={loading}
                >
                  {loading ? <RefreshCw size={16} className="spinning" /> : <Save size={16} />}
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Notification Settings</h2>
                <p>Choose what notifications you want to receive</p>
              </div>

              <div className="settings-form">
                <div className="notification-group">
                  <h4>Delivery Methods</h4>
                  {Object.entries({
                    email: 'Email Notifications',
                    push: 'Push Notifications',
                    sms: 'SMS Notifications'
                  }).map(([key, label]) => (
                    <label key={key} className="toggle-label">
                      <input
                        type="checkbox"
                        checked={preferences.notifications[key]}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [key]: e.target.checked }
                        }))}
                      />
                      <span className="toggle-slider"></span>
                      {key === 'sms' && <Smartphone size={16} />}
                      {key === 'push' && <Bell size={16} />}
                      {key === 'email' && <Globe size={16} />}
                      {label}
                    </label>
                  ))}
                </div>

                <div className="notification-group">
                  <h4>Notification Types</h4>
                  {Object.entries({
                    goalReminders: 'Goal Reminders',
                    spendingAlerts: 'Spending Alerts',
                    weeklyReports: 'Weekly Reports'
                  }).map(([key, label]) => (
                    <label key={key} className="toggle-label">
                      <input
                        type="checkbox"
                        checked={preferences.notifications[key]}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [key]: e.target.checked }
                        }))}
                      />
                      <span className="toggle-slider"></span>
                      <Bell size={16} />
                      {label}
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePreferencesUpdate}
                  disabled={loading}
                >
                  {loading ? <RefreshCw size={16} className="spinning" /> : <Save size={16} />}
                  {loading ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Privacy Settings</h2>
                <p>Control your privacy and data sharing preferences</p>
              </div>

              <div className="settings-form">
                {Object.entries({
                  profileVisible: 'Make profile visible to other users',
                  shareAnalytics: 'Share anonymous analytics data',
                  showInLeaderboard: 'Show in community leaderboard'
                }).map(([key, label]) => (
                  <label key={key} className="toggle-label">
                    <input
                      type="checkbox"
                      checked={preferences.privacy[key]}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, [key]: e.target.checked }
                      }))}
                    />
                    <span className="toggle-slider"></span>
                    <Eye size={16} />
                    {label}
                  </label>
                ))}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePreferencesUpdate}
                  disabled={loading}
                >
                  {loading ? <RefreshCw size={16} className="spinning" /> : <Save size={16} />}
                  {loading ? 'Saving...' : 'Save Privacy Settings'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Data Management</h2>
                <p>Export your data or delete your account</p>
              </div>

              <div className="settings-form">
                <div className="data-actions">
                  <div className="action-card">
                    <div className="action-info">
                      <h4>Export Your Data</h4>
                      <p>Download all your financial data in JSON format</p>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={exportData}
                      disabled={loading}
                    >
                      <Download size={16} />
                      Export Data
                    </button>
                  </div>

                  <div className="action-card danger">
                    <div className="action-info">
                      <h4>Delete Account</h4>
                      <p>Permanently delete your account and all associated data</p>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={deleteAccount}
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;