import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransaction } from '../../context/TransactionContext';
import { useGoals } from '../../context/GoalsContext';

const FirebaseTest = () => {
  const { currentUser } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransaction();
  const { goals, loading: goalsLoading } = useGoals();

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
        <p><strong>Has Data:</strong> {transactions?.length > 0 || goals?.length > 0 ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{
        background: '#f3f4f6',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <strong>💡 Status:</strong><br/>
        • All dummy/sample data has been removed<br/>
        • Application uses real Firebase data only<br/>
        • Create transactions and goals through the UI<br/>
        • Check the browser console for any error messages
      </div>
    </div>
  );
};

export default FirebaseTest;