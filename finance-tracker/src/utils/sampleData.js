// Sample data generator for testing dashboard functionality
import { addTransaction, addGoal } from '../services/firestore';

export const createSampleData = async (uid) => {
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    // Sample transactions for the past week
    const sampleTransactions = [
      {
        type: 'income',
        amount: 150000,
        description: 'Salary Payment',
        category: 'Salary',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24) // Yesterday
      },
      {
        type: 'expense',
        amount: 15000,
        description: 'Grocery Shopping',
        category: 'Food',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24) // Yesterday
      },
      {
        type: 'expense',
        amount: 3500,
        description: 'Uber Ride',
        category: 'Transportation',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
      },
      {
        type: 'income',
        amount: 25000,
        description: 'Freelance Project',
        category: 'Freelance',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      },
      {
        type: 'expense',
        amount: 8000,
        description: 'Internet Bill',
        category: 'Bills',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 days ago
      },
      {
        type: 'expense',
        amount: 2500,
        description: 'Coffee & Snacks',
        category: 'Food',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
      }
    ];

    // Sample goals
    const sampleGoals = [
      {
        title: 'Emergency Fund',
        description: 'Build up emergency savings for unexpected expenses',
        targetAmount: 500000,
        currentAmount: 125000,
        category: 'Emergency Fund',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180) // 6 months from now
      },
      {
        title: 'Vacation to Dubai',
        description: 'Save for a luxury vacation to Dubai',
        targetAmount: 200000,
        currentAmount: 45000,
        category: 'Vacation',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) // 1 year from now
      },
      {
        title: 'New Laptop',
        description: 'Save for a new MacBook Pro for work',
        targetAmount: 800000,
        currentAmount: 200000,
        category: 'Technology',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90) // 3 months from now
      }
    ];

    console.log('Creating sample transactions...');

    // Add transactions
    const transactionPromises = sampleTransactions.map(transaction =>
      addTransaction(uid, transaction)
    );

    await Promise.all(transactionPromises);
    console.log(`Created ${sampleTransactions.length} sample transactions`);

    console.log('Creating sample goals...');

    // Add goals
    const goalPromises = sampleGoals.map(goal =>
      addGoal(uid, goal)
    );

    await Promise.all(goalPromises);
    console.log(`Created ${sampleGoals.length} sample goals`);

    return {
      transactionsCreated: sampleTransactions.length,
      goalsCreated: sampleGoals.length
    };

  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
};

// Helper function to clear all user data (for testing)
export const clearUserData = async (uid) => {
  // Note: This would require additional Firestore operations to delete documents
  // For now, we'll just log the intent
  console.log(`Would clear all data for user: ${uid}`);

  // In a real implementation, you would:
  // 1. Query all user documents in each collection
  // 2. Delete them in batches
  // 3. Reset user profile stats

  return {
    message: 'Data clearing not implemented - use Firebase console to delete test data'
  };
};

// Check if user has sample data
export const hasSampleData = (transactions, goals) => {
  const hasTransactions = transactions && transactions.length > 0;
  const hasGoals = goals && goals.length > 0;

  return {
    hasTransactions,
    hasGoals,
    hasAnyData: hasTransactions || hasGoals
  };
};