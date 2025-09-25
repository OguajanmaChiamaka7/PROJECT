import React from 'react';
import { Plus, Target, PiggyBank, TrendingUp, Users, Star } from 'lucide-react';
import Card from '../ui/Card';

const ActionButton = ({ action, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
  >
    <div className={`${action.color} p-3 rounded-lg mb-2`}>
      <action.icon className="w-6 h-6 text-white" />
    </div>
    <span className="text-sm font-medium text-gray-700">{action.text}</span>
  </button>
);

const QuickActions = () => {
  const actions = [
    { icon: Plus, text: 'Add Expense', color: 'bg-blue-500' },
    { icon: Target, text: 'Set Goal', color: 'bg-purple-500' },
    { icon: PiggyBank, text: 'Save Money', color: 'bg-emerald-500' },
    { icon: TrendingUp, text: 'View Analytics', color: 'bg-orange-500' },
    { icon: Users, text: 'Join Circle', color: 'bg-pink-500' },
    { icon: Star, text: 'Earn Rewards', color: 'bg-yellow-500' }
  ];

  const handleActionClick = (actionText) => {
    console.log(`${actionText} clicked`);
    // Add your navigation logic here
  };

  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <ActionButton 
            key={index}
            action={action}
            onClick={() => handleActionClick(action.text)}
          />
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;