import React, { useState } from 'react';
import { useGoals } from '../context/GoalsContext';
import { Target, Plus, Edit, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal, getTotalSaved, getTotalTargeted } = useGoals();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    description: '',
    category: 'savings'
  });

  const categories = ['savings', 'vacation', 'emergency', 'investment', 'purchase', 'education', 'other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    const goalData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
        setEditingGoal(null);
      } else {
        await addGoal(goalData);
      }

      // Reset form
      setFormData({
        title: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        description: '',
        category: 'savings'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      description: goal.description || '',
      category: goal.category || 'savings'
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id);
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  const calculateProgress = (current, target) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDaysUntilTarget = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Target className="mr-3 text-green-600" size={32} />
          Financial Goals
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <DollarSign size={24} className="mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Total Saved</h3>
                <p className="text-2xl font-bold">₦{getTotalSaved().toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <Target size={24} className="mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Total Target</h3>
                <p className="text-2xl font-bold">₦{getTotalTargeted().toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center">
              <TrendingUp size={24} className="mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Active Goals</h3>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Goal Button */}
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingGoal(null);
            setFormData({
              title: '',
              targetAmount: '',
              currentAmount: '',
              targetDate: '',
              description: '',
              category: 'savings'
            });
          }}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 mb-6 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          {showAddForm ? 'Cancel' : 'Add New Goal'}
        </button>

        {/* Add/Edit Goal Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="mr-2 text-green-600" size={24} />
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Emergency Fund, New Car, Vacation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (₦) *
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  step="1000"
                  min="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="500000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Amount (₦)
                </label>
                <input
                  type="number"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={handleInputChange}
                  step="1000"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Optional description for your goal..."
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-lg shadow text-center">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Goals Yet</h3>
              <p className="text-gray-500 mb-4">Start your financial journey by setting your first goal!</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Goal
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const daysLeft = getDaysUntilTarget(goal.targetDate);

              return (
                <div key={goal.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mt-1">
                        {goal.category}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress: {progress.toFixed(1)}%</span>
                      <span>₦{goal.currentAmount.toLocaleString()} / ₦{goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-1" />
                      <span>
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                            ? 'Due today!'
                            : `${Math.abs(daysLeft)} days overdue`
                        }
                      </span>
                    </div>
                    <div className={`text-sm font-semibold ${
                      progress >= 100
                        ? 'text-green-600'
                        : daysLeft < 0
                          ? 'text-red-600'
                          : 'text-blue-600'
                    }`}>
                      {progress >= 100 ? '✅ Completed!' : daysLeft < 0 ? '⚠️ Overdue' : '🎯 In Progress'}
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-gray-600 text-sm mt-3 pt-3 border-t border-gray-100">
                      {goal.description}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;