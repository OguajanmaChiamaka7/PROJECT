import React, { useState, useEffect } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, TrendingDown, PieChart, Calendar, DollarSign, Target, AlertCircle } from 'lucide-react';

const Analytics = () => {
  const { transactions, analytics, loadAnalytics } = useTransaction();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser?.uid) return;

      try {
        setLoading(true);
        setError(null);
        await loadAnalytics();
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentUser?.uid, selectedPeriod]);

  const getFilteredTransactions = () => {
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const calculateMetrics = () => {
    const filteredTransactions = getFilteredTransactions();

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      transactionCount: filteredTransactions.length
    };
  };

  const getCategoryBreakdown = () => {
    const filteredTransactions = getFilteredTransactions();
    const categories = {};

    filteredTransactions.forEach(transaction => {
      const key = `${transaction.type}-${transaction.category}`;
      if (!categories[key]) {
        categories[key] = {
          name: transaction.category,
          type: transaction.type,
          amount: 0,
          count: 0
        };
      }
      categories[key].amount += transaction.amount;
      categories[key].count += 1;
    });

    return Object.values(categories).sort((a, b) => b.amount - a.amount);
  };

  const getMonthlyTrend = () => {
    const monthlyData = {};
    const last6Months = [];
    const now = new Date();

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { income: 0, expenses: 0, month: date.toLocaleString('default', { month: 'short' }) };
      last6Months.push(key);
    }

    // Populate with transaction data
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData[key]) {
        if (transaction.type === 'income') {
          monthlyData[key].income += transaction.amount;
        } else {
          monthlyData[key].expenses += transaction.amount;
        }
      }
    });

    return last6Months.map(key => monthlyData[key]);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto text-green-500 mb-4 animate-pulse" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle size={24} className="text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Analytics</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();
  const categoryBreakdown = getCategoryBreakdown();
  const monthlyTrend = getMonthlyTrend();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0 flex items-center">
            <BarChart3 className="mr-3 text-green-600" size={32} />
            Financial Analytics
          </h1>

          <div className="flex space-x-2">
            {['week', 'month', 'quarter', 'year'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  selectedPeriod === period
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <PieChart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
            <p className="text-gray-500 mb-4">Add some transactions to see your analytics!</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Income</p>
                    <p className="text-2xl font-bold">₦{metrics.totalIncome.toLocaleString()}</p>
                  </div>
                  <TrendingUp size={32} className="text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg shadow text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Total Expenses</p>
                    <p className="text-2xl font-bold">₦{metrics.totalExpenses.toLocaleString()}</p>
                  </div>
                  <TrendingDown size={32} className="text-red-200" />
                </div>
              </div>

              <div className={`bg-gradient-to-r p-6 rounded-lg shadow text-white ${
                metrics.netIncome >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${metrics.netIncome >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>
                      Net Income
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics.netIncome >= 0 ? '+' : ''}₦{metrics.netIncome.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign size={32} className={`${metrics.netIncome >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Savings Rate</p>
                    <p className="text-2xl font-bold">{metrics.savingsRate.toFixed(1)}%</p>
                  </div>
                  <Target size={32} className="text-purple-200" />
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 text-green-600" size={24} />
                6-Month Trend
              </h2>
              <div className="space-y-4">
                {monthlyTrend.map((data, index) => {
                  const maxAmount = Math.max(...monthlyTrend.map(d => Math.max(d.income, d.expenses)));
                  const incomeWidth = maxAmount > 0 ? (data.income / maxAmount) * 100 : 0;
                  const expenseWidth = maxAmount > 0 ? (data.expenses / maxAmount) * 100 : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{data.month}</span>
                        <span className="text-gray-600">
                          Income: ₦{data.income.toLocaleString()} | Expenses: ₦{data.expenses.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${incomeWidth}%` }}
                          />
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${expenseWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="mr-2 text-green-600" size={24} />
                Category Breakdown ({selectedPeriod})
              </h2>

              {categoryBreakdown.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions in selected period</p>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.slice(0, 10).map((category, index) => {
                    const maxAmount = Math.max(...categoryBreakdown.map(c => c.amount));
                    const width = maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-block w-3 h-3 rounded-full ${
                              category.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="font-medium capitalize">{category.name}</span>
                            <span className="text-sm text-gray-500">({category.count} transactions)</span>
                          </div>
                          <span className="font-semibold">₦{category.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              category.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;