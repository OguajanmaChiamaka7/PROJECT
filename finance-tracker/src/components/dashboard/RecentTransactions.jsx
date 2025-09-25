import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const TransactionItem = ({ transaction }) => (
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
        <p className="font-medium text-gray-900">{transaction.description}</p>
        <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
      </div>
    </div>
    <span className={`font-semibold ${
      transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
    }`}>
      {transaction.type === 'income' ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
    </span>
  </div>
);

const RecentTransactions = () => {
  const transactions = [
    { id: 1, type: 'income', description: 'Salary Deposit', amount: 150000, date: '2024-01-15', category: 'Salary' },
    { id: 2, type: 'expense', description: 'Grocery Shopping', amount: -12500, date: '2024-01-14', category: 'Food' },
    { id: 3, type: 'expense', description: 'Uber Ride', amount: -2800, date: '2024-01-14', category: 'Transport' },
    { id: 4, type: 'income', description: 'Freelance Work', amount: 35000, date: '2024-01-13', category: 'Freelance' },
    { id: 5, type: 'expense', description: 'Netflix Subscription', amount: -1200, date: '2024-01-12', category: 'Entertainment' }
  ];

  return (
    <Card 
      title="Recent Transactions"
      action={
        <Button variant="ghost" size="sm">
          View All
        </Button>
      }
    >
      <div className="space-y-4">
        {transactions.map(transaction => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;