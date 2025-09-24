import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useTransaction } from '../../context/TransactionContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

const TransactionItem = ({ transaction }) => {
  const formatDate = (date) => {
    if (!date) return 'Today';
    const transactionDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffTime = now - transactionDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return transactionDate.toLocaleDateString();
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {transaction.type === 'income'
            ? <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            : <ArrowDownRight className="w-5 h-5 text-red-600" />
          }
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {transaction.description || 'Transaction'}
          </p>
          <p className="text-sm text-gray-500">
            {transaction.category || 'Other'} • {formatDate(transaction.createdAt || transaction.date)}
          </p>
        </div>
      </div>
      <span className={`font-semibold ${
        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
      }`}>
        {transaction.type === 'income' ? '+' : ''}₦{Math.abs(transaction.amount || 0).toLocaleString()}
      </span>
    </div>
  );
};

const RecentTransactions = () => {
  const { getRecentTransactions, loading } = useTransaction();

  // Get recent transactions from context (or use fallback data)
  const contextTransactions = getRecentTransactions(5);

  // Fallback data for when no transactions exist
  const fallbackTransactions = [
    { id: 'demo-1', type: 'income', description: 'Welcome Bonus', amount: 5000, date: new Date(), category: 'Bonus' },
    { id: 'demo-2', type: 'expense', description: 'Setup Complete', amount: -500, date: new Date(), category: 'System' }
  ];

  const transactions = contextTransactions.length > 0 ? contextTransactions : fallbackTransactions;

  if (loading && contextTransactions.length === 0) {
    return (
      <Card title="Recent Transactions">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No transactions yet</p>
          <p className="text-sm text-gray-500">Your recent transactions will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Recent Transactions"
      action={
        <Button variant="ghost" size="sm">
          View All
        </Button>
      }
    >
      <div className="space-y-0">
        {transactions.map(transaction => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;