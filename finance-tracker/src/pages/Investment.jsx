import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Target,
  Calendar,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Wallet,
  CreditCard,
  Building,
  Smartphone,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/Investment.css';

const Investment = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [investments, setInvestments] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalReturn: 0,
    returnPercentage: 0,
    todayChange: 0,
    todayChangePercent: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentUser } = useAuth();

  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'stocks',
    amount: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    category: 'technology'
  });

  const investmentTypes = [
    { value: 'stocks', label: 'Stocks', icon: TrendingUp },
    { value: 'bonds', label: 'Bonds', icon: Building },
    { value: 'mutual_funds', label: 'Mutual Funds', icon: PieChart },
    { value: 'etf', label: 'ETF', icon: BarChart3 },
    { value: 'real_estate', label: 'Real Estate', icon: Building },
    { value: 'cryptocurrency', label: 'Cryptocurrency', icon: DollarSign },
    { value: 'savings', label: 'Savings Account', icon: Wallet }
  ];

  const categories = [
    'technology', 'healthcare', 'finance', 'energy', 'consumer', 'industrial',
    'utilities', 'materials', 'telecom', 'real_estate', 'other'
  ];

  useEffect(() => {
    if (currentUser) {
      loadInvestments();
      setupInvestmentListener();
    }
  }, [currentUser]);

  const loadInvestments = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'investments'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const investmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setInvestments(investmentsData);
      calculatePortfolioStats(investmentsData);
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupInvestmentListener = () => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'investments'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const investmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setInvestments(investmentsData);
      calculatePortfolioStats(investmentsData);
    });

    return () => unsubscribe();
  };

  const calculatePortfolioStats = (investmentsData) => {
    const totalInvested = investmentsData.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalValue = investmentsData.reduce((sum, inv) => {
      const currentValue = (inv.quantity || 0) * (inv.currentPrice || inv.purchasePrice || 0);
      return sum + currentValue;
    }, 0);

    const totalReturn = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Simulate today's change (in a real app, this would come from market data)
    const todayChange = totalValue * (Math.random() * 0.06 - 0.03); // Random between -3% and +3%
    const todayChangePercent = totalValue > 0 ? (todayChange / totalValue) * 100 : 0;

    setPortfolioStats({
      totalValue,
      totalInvested,
      totalReturn,
      returnPercentage,
      todayChange,
      todayChangePercent
    });
  };

  const addInvestment = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const investmentData = {
        ...newInvestment,
        userId: currentUser.uid,
        amount: parseFloat(newInvestment.amount),
        quantity: parseFloat(newInvestment.quantity) || 1,
        purchasePrice: parseFloat(newInvestment.purchasePrice),
        currentPrice: parseFloat(newInvestment.currentPrice) || parseFloat(newInvestment.purchasePrice),
        purchaseDate: Timestamp.fromDate(new Date(newInvestment.purchaseDate)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'investments'), investmentData);

      setNewInvestment({
        name: '',
        type: 'stocks',
        amount: '',
        quantity: '',
        purchasePrice: '',
        currentPrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        category: 'technology'
      });

      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };

  const updateInvestmentPrice = async (investmentId, newPrice) => {
    try {
      const investmentRef = doc(db, 'investments', investmentId);
      await updateDoc(investmentRef, {
        currentPrice: parseFloat(newPrice),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating investment price:', error);
    }
  };

  const deleteInvestment = async (investmentId) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;

    try {
      await deleteDoc(doc(db, 'investments', investmentId));
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getTypeIcon = (type) => {
    const typeData = investmentTypes.find(t => t.value === type);
    return typeData ? typeData.icon : TrendingUp;
  };

  const getReturnColor = (value) => {
    if (value > 0) return '#10b981';
    if (value < 0) return '#ef4444';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div className="investment-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="investment-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <TrendingUp className="header-icon" />
          <div>
            <h1 className="page-title">Investment Portfolio</h1>
            <p className="page-subtitle">Track and manage your investments</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          Add Investment
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="portfolio-summary">
        <div className="summary-card main-card">
          <div className="card-header">
            <h3>Total Portfolio Value</h3>
            <div className={`change-indicator ${portfolioStats.todayChange >= 0 ? 'positive' : 'negative'}`}>
              {portfolioStats.todayChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {formatCurrency(Math.abs(portfolioStats.todayChange))} ({formatPercentage(portfolioStats.todayChangePercent)}) Today
            </div>
          </div>
          <div className="main-value">{formatCurrency(portfolioStats.totalValue)}</div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">
              <Wallet size={20} />
            </div>
            <div className="card-content">
              <h4>Total Invested</h4>
              <div className="card-value">{formatCurrency(portfolioStats.totalInvested)}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon" style={{ color: getReturnColor(portfolioStats.totalReturn) }}>
              {portfolioStats.totalReturn >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            </div>
            <div className="card-content">
              <h4>Total Return</h4>
              <div className="card-value" style={{ color: getReturnColor(portfolioStats.totalReturn) }}>
                {formatCurrency(portfolioStats.totalReturn)}
              </div>
              <div className="card-subtitle" style={{ color: getReturnColor(portfolioStats.returnPercentage) }}>
                {formatPercentage(portfolioStats.returnPercentage)}
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <BarChart3 size={20} />
            </div>
            <div className="card-content">
              <h4>Holdings</h4>
              <div className="card-value">{investments.length}</div>
              <div className="card-subtitle">Active investments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        {[
          { key: 'portfolio', label: 'Portfolio', icon: PieChart },
          { key: 'performance', label: 'Performance', icon: BarChart3 },
          { key: 'analysis', label: 'Analysis', icon: Target }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            {investments.length === 0 ? (
              <div className="empty-state">
                <TrendingUp size={48} className="empty-icon" />
                <h3>No Investments Yet</h3>
                <p>Start building your investment portfolio by adding your first investment.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus size={16} />
                  Add Your First Investment
                </button>
              </div>
            ) : (
              <div className="investments-grid">
                {investments.map((investment) => {
                  const currentValue = (investment.quantity || 1) * (investment.currentPrice || investment.purchasePrice);
                  const returnValue = currentValue - investment.amount;
                  const returnPercent = investment.amount > 0 ? (returnValue / investment.amount) * 100 : 0;
                  const Icon = getTypeIcon(investment.type);

                  return (
                    <div key={investment.id} className="investment-card">
                      <div className="investment-header">
                        <div className="investment-info">
                          <div className="investment-icon">
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 className="investment-name">{investment.name}</h4>
                            <p className="investment-type">
                              {investmentTypes.find(t => t.value === investment.type)?.label || investment.type}
                            </p>
                          </div>
                        </div>
                        <div className="investment-actions">
                          <button
                            className="action-btn"
                            onClick={() => updateInvestmentPrice(investment.id, prompt('Enter new price:', investment.currentPrice))}
                            title="Update price"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteInvestment(investment.id)}
                            title="Delete investment"
                          >
                            <Minus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="investment-stats">
                        <div className="stat-group">
                          <div className="stat">
                            <label>Current Value</label>
                            <span className="value">{formatCurrency(currentValue)}</span>
                          </div>
                          <div className="stat">
                            <label>Invested</label>
                            <span className="value">{formatCurrency(investment.amount)}</span>
                          </div>
                        </div>

                        <div className="stat-group">
                          <div className="stat">
                            <label>Return</label>
                            <span className="value" style={{ color: getReturnColor(returnValue) }}>
                              {formatCurrency(returnValue)}
                            </span>
                          </div>
                          <div className="stat">
                            <label>Return %</label>
                            <span className="value" style={{ color: getReturnColor(returnPercent) }}>
                              {formatPercentage(returnPercent)}
                            </span>
                          </div>
                        </div>

                        <div className="stat-group">
                          <div className="stat">
                            <label>Quantity</label>
                            <span className="value">{investment.quantity || 1}</span>
                          </div>
                          <div className="stat">
                            <label>Price</label>
                            <span className="value">{formatCurrency(investment.currentPrice || investment.purchasePrice)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="investment-progress">
                        <div className="progress-info">
                          <span>Purchase Date: {investment.purchaseDate?.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-section">
            <div className="performance-overview">
              <div className="overview-card">
                <h3>Performance Overview</h3>
                <div className="performance-metrics">
                  <div className="metric">
                    <label>Best Performer</label>
                    <span className="value positive">
                      {investments.length > 0 ? investments[0].name : 'N/A'}
                    </span>
                  </div>
                  <div className="metric">
                    <label>Worst Performer</label>
                    <span className="value negative">
                      {investments.length > 0 ? investments[investments.length - 1].name : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="allocation-card">
                <h3>Asset Allocation</h3>
                <div className="allocation-chart">
                  {investmentTypes.map(({ value, label }) => {
                    const typeInvestments = investments.filter(inv => inv.type === value);
                    const typeValue = typeInvestments.reduce((sum, inv) => {
                      return sum + ((inv.quantity || 1) * (inv.currentPrice || inv.purchasePrice));
                    }, 0);
                    const percentage = portfolioStats.totalValue > 0 ? (typeValue / portfolioStats.totalValue) * 100 : 0;

                    if (percentage === 0) return null;

                    return (
                      <div key={value} className="allocation-item">
                        <div className="allocation-label">
                          <span>{label}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="allocation-bar">
                          <div
                            className="allocation-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-section">
            <div className="analysis-cards">
              <div className="analysis-card">
                <div className="card-header">
                  <Info className="card-icon" />
                  <h3>Portfolio Insights</h3>
                </div>
                <div className="insights-list">
                  <div className="insight">
                    <span className="insight-label">Diversification Score</span>
                    <span className="insight-value">
                      {investments.length > 0 ? Math.min(investments.length * 20, 100) : 0}%
                    </span>
                  </div>
                  <div className="insight">
                    <span className="insight-label">Risk Level</span>
                    <span className="insight-value">
                      {portfolioStats.returnPercentage > 10 ? 'High' :
                       portfolioStats.returnPercentage > 5 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="insight">
                    <span className="insight-label">Investment Period</span>
                    <span className="insight-value">
                      {investments.length > 0 ? 'Active' : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="analysis-card">
                <div className="card-header">
                  <AlertCircle className="card-icon" />
                  <h3>Recommendations</h3>
                </div>
                <div className="recommendations-list">
                  <div className="recommendation">
                    <span>Consider diversifying across more asset classes</span>
                  </div>
                  <div className="recommendation">
                    <span>Regular investment updates recommended</span>
                  </div>
                  <div className="recommendation">
                    <span>Monitor market trends for optimal timing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Investment</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <Minus size={20} />
              </button>
            </div>

            <form onSubmit={addInvestment} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Investment Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newInvestment.name}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Apple Inc. (AAPL)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={newInvestment.type}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {investmentTypes.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount Invested (₦)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newInvestment.amount}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newInvestment.quantity}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="1"
                    min="0"
                    step="0.001"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purchase Price (₦)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newInvestment.purchasePrice}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Price (₦)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newInvestment.currentPrice}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, currentPrice: e.target.value }))}
                    placeholder="Same as purchase price"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newInvestment.purchaseDate}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newInvestment.category}
                    onChange={(e) => setNewInvestment(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  Add Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investment;