// Transactions.jsx
// Transactions.jsx
import React, { useState } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Edit2, Trash2, Calendar, Filter } from 'lucide-react';
import '../styles/Transactions.css';

const Transactions = () => {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useTransaction();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    expense: ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.category) {
      alert('Please fill in all fields');
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
        setEditingTransaction(null);
      } else {
        await addTransaction(transactionData);
      }

      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(String(id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const calculateBalance = () => {
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'income'
        ? balance + transaction.amount
        : balance - transaction.amount;
    }, 0);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const allCategories = [...new Set(transactions.map(t => t.category))];

  return (
    <div className="transactions-container">
      <div className="transactions-wrapper">
        <div className="header-section">
          <h1 className="page-title">
            <Wallet className="title-icon" />
            Transactions
          </h1>
        </div>
        
        <div className="summary-grid">
          <div className="summary-card income-card">
            <div className="card-content">
              <TrendingUp className="card-icon" />
              <div className="card-info">
                <h3 className="card-label">Total Income</h3>
                <p className="card-amount income-amount">
                  ₦{getTotalIncome().toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="summary-card expense-card">
            <div className="card-content">
              <TrendingDown className="card-icon" />
              <div className="card-info">
                <h3 className="card-label">Total Expenses</h3>
                <p className="card-amount expense-amount">
                  ₦{getTotalExpenses().toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`summary-card balance-card ${calculateBalance() >= 0 ? 'positive' : 'negative'}`}>
            <div className="card-content">
              <DollarSign className="card-icon" />
              <div className="card-info">
                <h3 className="card-label">Balance</h3>
                <p className="card-amount balance-amount">
                  ₦{calculateBalance().toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingTransaction(null);
            setFormData({
              description: '',
              amount: '',
              type: 'expense',
              category: '',
              date: new Date().toISOString().split('T')[0]
            });
          }}
          className="add-btn"
        >
          <Plus className="btn-icon" />
          {showAddForm ? 'Cancel' : 'Add Transaction'}
        </button>

        {showAddForm && (
          <div className="form-card">
            <h2 className="form-title">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter description"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Amount (₦)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select category</option>
                  {categories[formData.type].map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-section">
          <div className="filter-header">
            <Filter className="filter-icon" />
            <h3>Filters</h3>
          </div>
          <div className="filter-controls">
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
                placeholder="Search transactions..."
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="transactions-list-card">
          <div className="list-header">
            <h2 className="list-title">
              Recent Transactions
              <span className="transaction-count">({filteredTransactions.length})</span>
            </h2>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <Calendar className="empty-icon" />
              <p className="empty-text">
                {transactions.length === 0
                  ? 'No transactions yet. Add your first transaction above!'
                  : 'No transactions match your filters.'
                }
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="description-cell">{transaction.description}</td>
                      <td>
                        <span className={`category-badge ${transaction.type}`}>
                          {transaction.category}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Date(transaction.date).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className={`amount-cell ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}₦{transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="action-btn edit-btn"
                          title="Edit transaction"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="action-btn delete-btn"
                          title="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;