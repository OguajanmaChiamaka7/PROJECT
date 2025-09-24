import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService';

const WhoAmI = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserStats = async () => {
      if (currentUser?.uid) {
        setStatsLoading(true);
        try {
          const stats = await UserService.getUserStatistics(currentUser.uid);
          setUserStats(stats);
        } catch (err) {
          console.error('Failed to load user stats:', err);
          setError('Failed to load user statistics');
        } finally {
          setStatsLoading(false);
        }
      }
    };

    loadUserStats();
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ padding: '20px', border: '2px solid #e0e0e0', borderRadius: '8px', margin: '20px 0' }}>
        <h3>🔍 Who Am I? (Debug Component)</h3>
        <p>Loading authentication state...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', border: '2px solid #f44336', borderRadius: '8px', margin: '20px 0', backgroundColor: '#ffebee' }}>
        <h3>🔍 Who Am I? (Debug Component)</h3>
        <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>❌ No authenticated user found</p>
        <p>Please log in to see your profile information.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '2px solid #4caf50', borderRadius: '8px', margin: '20px 0', backgroundColor: '#f1f8e9' }}>
      <h3>🔍 Who Am I? (Debug Component)</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>🔥 Firebase Auth User:</h4>
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
          <p><strong>UID:</strong> {currentUser.uid}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Display Name:</strong> {currentUser.displayName || 'Not set'}</p>
          <p><strong>Email Verified:</strong> {currentUser.emailVerified ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Photo URL:</strong> {currentUser.photoURL || 'Not set'}</p>
          <p><strong>Account Created:</strong> {new Date(currentUser.metadata.creationTime).toLocaleString()}</p>
          <p><strong>Last Sign In:</strong> {new Date(currentUser.metadata.lastSignInTime).toLocaleString()}</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>📊 Firestore Profile Data:</h4>
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
          {userProfile ? (
            <>
              <p><strong>First Name:</strong> {userProfile.firstName || 'Not set'}</p>
              <p><strong>Last Name:</strong> {userProfile.lastName || 'Not set'}</p>
              <p><strong>Display Name:</strong> {userProfile.displayName || 'Not set'}</p>
              <p><strong>Phone:</strong> {userProfile.phone || 'Not set'}</p>
              <p><strong>Currency:</strong> {userProfile.currency || 'USD'}</p>
              <p><strong>Level:</strong> {userProfile.level || 1}</p>
              <p><strong>XP:</strong> {userProfile.xp || 0}</p>
              <p><strong>Balance:</strong> ${userProfile.balance || 0}</p>
              <p><strong>Profile Completed:</strong> {userProfile.profileCompleted ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Savings Goal:</strong> ${userProfile.savingsGoal || 0}</p>
              <p><strong>Monthly Budget:</strong> ${userProfile.monthlyBudget || 0}</p>
            </>
          ) : (
            <p style={{ color: '#f44336' }}>❌ No profile data found in Firestore</p>
          )}
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
          <p style={{ color: '#d32f2f' }}>❌ Error: {error}</p>
        </div>
      )}

      <div>
        <h4>📈 User Statistics:</h4>
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {statsLoading ? (
            <p>Loading statistics...</p>
          ) : userStats ? (
            <>
              <p><strong>Level:</strong> {userStats.level}</p>
              <p><strong>Total XP:</strong> {userStats.xp}</p>
              <p><strong>Current Balance:</strong> ${userStats.balance}</p>
              <p><strong>Streak:</strong> {userStats.streak} days</p>
              <p><strong>Transactions:</strong> {userStats.transactionCount}</p>
              <p><strong>Goals:</strong> {userStats.goalsCount}</p>
              <p><strong>Badges Earned:</strong> {userStats.badgesCount}</p>
              <p><strong>Profile Complete:</strong> {userStats.profileCompleted ? '✅ Yes' : '❌ No'}</p>
            </>
          ) : (
            <p style={{ color: '#f44336' }}>Failed to load user statistics</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <h4>🔧 Development Info:</h4>
        <p><strong>Component Render Time:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Firebase Connection:</strong> ✅ Connected</p>
        <p><strong>Context Loading State:</strong> {loading ? 'Loading' : 'Ready'}</p>
      </div>
    </div>
  );
};

export default WhoAmI;