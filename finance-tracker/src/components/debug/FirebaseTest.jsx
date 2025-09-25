import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createSampleData, hasSampleData } from '../../utils/sampleData';
import { useTransaction } from '../../context/TransactionContext';
import { useGoals } from '../../context/GoalsContext';

const FirebaseTest = () => {
  const { currentUser } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransaction();
  const { goals, loading: goalsLoading } = useGoals();
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreateSampleData = async () => {
    if (!currentUser?.uid) {
      setError('Please log in first');
      return;
    }

    try {
      setCreating(true);
      setError('');
      setMessage('');

      const result = await createSampleData(currentUser.uid);
      setMessage(`Success! Created ${result.transactionsCreated} transactions and ${result.goalsCreated} goals.`);
    } catch (err) {
      console.error('Error creating sample data:', err);
      setError(err.message || 'Failed to create sample data');
    } finally {
      setCreating(false);
    }
  };

  const dataStatus = hasSampleData(transactions, goals);

  if (!currentUser) {
    return (
      <div style={{
        padding: '20px',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        margin: '20px 0',
        backgroundColor: '#fef3c7'
      }}>
        <h3>🔧 Firebase Test Component</h3>
        <p>Please log in to test Firebase functionality.</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      margin: '20px 0',
      backgroundColor: '#eff6ff'
    }}>
      <h3>🔧 Firebase Test Component</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Connection Status:</h4>
        <p><strong>User ID:</strong> {currentUser.uid}</p>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Transactions Loading:</strong> {transactionsLoading ? '⏳ Loading...' : '✅ Ready'}</p>
        <p><strong>Goals Loading:</strong> {goalsLoading ? '⏳ Loading...' : '✅ Ready'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Current Data:</h4>
        <p><strong>Transactions:</strong> {transactions?.length || 0}</p>
        <p><strong>Goals:</strong> {goals?.length || 0}</p>
        <p><strong>Has Data:</strong> {dataStatus.hasAnyData ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Sample Data Creator:</h4>
        <button
          onClick={handleCreateSampleData}
          disabled={creating || transactionsLoading || goalsLoading}
          style={{
            background: creating ? '#94a3b8' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            cursor: creating ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {creating ? '⏳ Creating Sample Data...' : '🎯 Create Sample Data'}
        </button>

        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          This will create sample transactions and goals for testing the dashboard.
        </p>
      </div>

      {message && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #16a34a',
          color: '#15803d',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '12px'
        }}>
          ✅ {message}
        </div>
      )}

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '12px'
        }}>
          ❌ Error: {error}
        </div>
      )}

      <div style={{
        background: '#f3f4f6',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <strong>💡 Troubleshooting:</strong><br/>
        • If you see permission errors, update your Firestore rules<br/>
        • Check FIREBASE_SETUP.md for instructions<br/>
        • Make sure you're logged in with a valid account<br/>
        • Check the browser console for detailed error messages
      </div>
    </div>
  );
};

export default FirebaseTest;