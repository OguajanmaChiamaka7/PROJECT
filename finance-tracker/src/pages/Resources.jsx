import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calculator,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  Star,
  Eye,
  Clock,
  User,
  Tag,
  Globe,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Shield,
  Home,
  Smartphone,
  Users,
  Award,
  AlertCircle,
  Info,
  CheckCircle
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
  doc,
  onSnapshot,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/Resources.css';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('tools');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Financial calculators and tools
  const calculators = [
    {
      id: 1,
      title: 'Compound Interest Calculator',
      description: 'Calculate how your investments will grow over time with compound interest.',
      category: 'investment',
      icon: TrendingUp,
      color: '#10b981',
      type: 'calculator',
      difficulty: 'beginner',
      rating: 4.8,
      usage: 1234,
      features: ['Interest calculation', 'Growth projection', 'Visual charts'],
      url: '#compound-calculator'
    },
    {
      id: 2,
      title: 'Mortgage Calculator',
      description: 'Calculate monthly payments, total interest, and amortization schedules.',
      category: 'real_estate',
      icon: Home,
      color: '#f59e0b',
      type: 'calculator',
      difficulty: 'intermediate',
      rating: 4.7,
      usage: 987,
      features: ['Monthly payments', 'Amortization', 'Extra payments'],
      url: '#mortgage-calculator'
    },
    {
      id: 3,
      title: 'Budget Planner',
      description: 'Interactive tool to create and manage your monthly budget.',
      category: 'budgeting',
      icon: PiggyBank,
      color: '#3b82f6',
      type: 'planner',
      difficulty: 'beginner',
      rating: 4.9,
      usage: 2156,
      features: ['Income tracking', 'Expense categories', 'Savings goals'],
      url: '#budget-planner'
    },
    {
      id: 4,
      title: 'Debt Payoff Calculator',
      description: 'Plan your debt payoff strategy with snowball and avalanche methods.',
      category: 'debt',
      icon: CreditCard,
      color: '#ef4444',
      type: 'calculator',
      difficulty: 'intermediate',
      rating: 4.6,
      usage: 756,
      features: ['Multiple strategies', 'Payment schedules', 'Interest savings'],
      url: '#debt-calculator'
    },
    {
      id: 5,
      title: 'Investment Portfolio Analyzer',
      description: 'Analyze your investment portfolio allocation and risk.',
      category: 'investment',
      icon: TrendingUp,
      color: '#8b5cf6',
      type: 'analyzer',
      difficulty: 'advanced',
      rating: 4.5,
      usage: 543,
      features: ['Risk analysis', 'Asset allocation', 'Rebalancing suggestions'],
      url: '#portfolio-analyzer'
    },
    {
      id: 6,
      title: 'Retirement Planner',
      description: 'Calculate how much you need to save for retirement.',
      category: 'retirement',
      icon: Shield,
      color: '#06b6d4',
      type: 'planner',
      difficulty: 'intermediate',
      rating: 4.8,
      usage: 1098,
      features: ['Retirement goals', 'Savings rate', 'Inflation adjustment'],
      url: '#retirement-planner'
    }
  ];

  // Educational resources and templates
  const templates = [
    {
      id: 1,
      title: 'Monthly Budget Template',
      description: 'Comprehensive Excel template for tracking income and expenses.',
      category: 'budgeting',
      icon: FileText,
      color: '#10b981',
      type: 'template',
      format: 'Excel',
      size: '45 KB',
      downloads: 2340,
      rating: 4.9,
      url: '/templates/monthly-budget.xlsx'
    },
    {
      id: 2,
      title: 'Investment Tracker',
      description: 'Track your investments, dividends, and portfolio performance.',
      category: 'investment',
      icon: TrendingUp,
      color: '#3b82f6',
      type: 'template',
      format: 'Google Sheets',
      size: '38 KB',
      downloads: 1876,
      rating: 4.7,
      url: '/templates/investment-tracker.xlsx'
    },
    {
      id: 3,
      title: 'Debt Snowball Worksheet',
      description: 'Organize and track your debt payoff journey.',
      category: 'debt',
      icon: CreditCard,
      color: '#ef4444',
      type: 'template',
      format: 'PDF',
      size: '256 KB',
      downloads: 1432,
      rating: 4.6,
      url: '/templates/debt-snowball.pdf'
    },
    {
      id: 4,
      title: 'Emergency Fund Tracker',
      description: 'Monitor your emergency fund savings progress.',
      category: 'savings',
      icon: Shield,
      color: '#f59e0b',
      type: 'template',
      format: 'Excel',
      size: '29 KB',
      downloads: 1098,
      rating: 4.8,
      url: '/templates/emergency-fund.xlsx'
    },
    {
      id: 5,
      title: 'Financial Goals Planner',
      description: 'Plan and track progress towards your financial goals.',
      category: 'planning',
      icon: Award,
      color: '#8b5cf6',
      type: 'template',
      format: 'PDF',
      size: '187 KB',
      downloads: 987,
      rating: 4.5,
      url: '/templates/goals-planner.pdf'
    }
  ];

  // External resources and links
  const externalResources = [
    {
      id: 1,
      title: 'Nigerian Stock Exchange',
      description: 'Official website of the Nigerian Stock Exchange for market information.',
      category: 'investment',
      icon: Building,
      color: '#10b981',
      type: 'website',
      rating: 4.7,
      url: 'https://www.nse.com.ng',
      isExternal: true
    },
    {
      id: 2,
      title: 'Central Bank of Nigeria',
      description: 'Official monetary policy and banking regulation information.',
      category: 'banking',
      icon: Building,
      color: '#3b82f6',
      type: 'website',
      rating: 4.8,
      url: 'https://www.cbn.gov.ng',
      isExternal: true
    },
    {
      id: 3,
      title: 'Securities and Exchange Commission',
      description: 'Regulatory body for capital markets in Nigeria.',
      category: 'investment',
      icon: Shield,
      color: '#f59e0b',
      type: 'website',
      rating: 4.6,
      url: 'https://www.sec.gov.ng',
      isExternal: true
    },
    {
      id: 4,
      title: 'National Pension Commission',
      description: 'Information on pension and retirement planning in Nigeria.',
      category: 'retirement',
      icon: Users,
      color: '#8b5cf6',
      type: 'website',
      rating: 4.5,
      url: 'https://www.pencom.gov.ng',
      isExternal: true
    }
  ];

  // Financial service providers
  const serviceProviders = [
    {
      id: 1,
      name: 'GTBank',
      category: 'banking',
      type: 'Bank',
      description: 'Leading commercial bank with digital banking services.',
      services: ['Personal Banking', 'Investment', 'Loans', 'Digital Banking'],
      contact: {
        phone: '+234-1-448-0000',
        email: 'info@gtbank.com',
        website: 'https://www.gtbank.com',
        address: 'GTBank Tower, Victoria Island, Lagos'
      },
      rating: 4.6,
      icon: Building
    },
    {
      id: 2,
      name: 'First Bank Nigeria',
      category: 'banking',
      type: 'Bank',
      description: 'Nigeria\'s oldest bank with extensive branch network.',
      services: ['Banking', 'Investment', 'Insurance', 'Asset Management'],
      contact: {
        phone: '+234-1-905-2326',
        email: 'contactcentre@firstbanknigeria.com',
        website: 'https://www.firstbanknigeria.com',
        address: 'Samuel Asabia House, Marina, Lagos'
      },
      rating: 4.4,
      icon: Building
    },
    {
      id: 3,
      name: 'Stanbic IBTC',
      category: 'investment',
      type: 'Investment Bank',
      description: 'Investment banking and wealth management services.',
      services: ['Investment Banking', 'Wealth Management', 'Corporate Banking'],
      contact: {
        phone: '+234-1-422-2222',
        email: 'contact@stanbicibtc.com',
        website: 'https://www.stanbicibtc.com',
        address: 'IBTC Place, Jabi, Abuja'
      },
      rating: 4.7,
      icon: TrendingUp
    },
    {
      id: 4,
      name: 'ARM Pension Managers',
      category: 'retirement',
      type: 'Pension Fund Administrator',
      description: 'Leading pension fund management company.',
      services: ['Retirement Planning', 'Pension Administration', 'Investment'],
      contact: {
        phone: '+234-1-271-6000',
        email: 'info@armpension.com',
        website: 'https://www.armpension.com',
        address: 'ARM Towers, Victoria Island, Lagos'
      },
      rating: 4.5,
      icon: Shield
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'budgeting', label: 'Budgeting' },
    { value: 'investment', label: 'Investment' },
    { value: 'debt', label: 'Debt Management' },
    { value: 'savings', label: 'Savings' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'banking', label: 'Banking' },
    { value: 'planning', label: 'Planning' }
  ];

  useEffect(() => {
    if (currentUser) {
      loadBookmarks();
    }
  }, [currentUser]);

  const loadBookmarks = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'resourceBookmarks'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setBookmarkedItems(data.bookmarks || []);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (resourceId, resourceType) => {
    if (!currentUser) return;

    try {
      const bookmarkKey = `${resourceType}-${resourceId}`;
      const isBookmarked = bookmarkedItems.includes(bookmarkKey);

      const q = query(
        collection(db, 'resourceBookmarks'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Create new bookmark document
        await addDoc(collection(db, 'resourceBookmarks'), {
          userId: currentUser.uid,
          bookmarks: isBookmarked ? [] : [bookmarkKey],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } else {
        // Update existing bookmarks
        const docRef = snapshot.docs[0].ref;
        if (isBookmarked) {
          await updateDoc(docRef, {
            bookmarks: arrayRemove(bookmarkKey),
            updatedAt: Timestamp.now()
          });
        } else {
          await updateDoc(docRef, {
            bookmarks: arrayUnion(bookmarkKey),
            updatedAt: Timestamp.now()
          });
        }
      }

      // Update local state
      if (isBookmarked) {
        setBookmarkedItems(prev => prev.filter(item => item !== bookmarkKey));
      } else {
        setBookmarkedItems(prev => [...prev, bookmarkKey]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const isBookmarked = (resourceId, resourceType) => {
    const bookmarkKey = `${resourceType}-${resourceId}`;
    return bookmarkedItems.includes(bookmarkKey);
  };

  const filterResources = (resources, type) => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="resources-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <BookOpen className="header-icon" />
          <div>
            <h1 className="page-title">Financial Resources</h1>
            <p className="page-subtitle">Tools, templates, and guides to help you manage your finances</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{bookmarkedItems.length}</span>
            <span className="stat-label">Bookmarked</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search resources, tools, and templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-dropdown">
          <Filter size={16} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        {[
          { key: 'tools', label: 'Calculators & Tools', icon: Calculator },
          { key: 'templates', label: 'Templates', icon: FileText },
          { key: 'links', label: 'External Resources', icon: ExternalLink },
          { key: 'providers', label: 'Service Providers', icon: Building }
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
        {activeTab === 'tools' && (
          <div className="tools-section">
            <div className="section-header">
              <h2>Financial Calculators & Tools</h2>
              <p>Interactive tools to help you make informed financial decisions</p>
            </div>

            <div className="resources-grid">
              {filterResources(calculators, 'calculator').map((tool) => {
                const Icon = tool.icon;
                const bookmarked = isBookmarked(tool.id, 'calculator');

                return (
                  <div key={tool.id} className="resource-card">
                    <div className="resource-header">
                      <div className="resource-icon" style={{ backgroundColor: `${tool.color}20`, color: tool.color }}>
                        <Icon size={24} />
                      </div>
                      <div className="resource-meta">
                        <span className="resource-type">{tool.type}</span>
                        <span
                          className="difficulty-badge"
                          style={{ backgroundColor: getDifficultyColor(tool.difficulty) }}
                        >
                          {tool.difficulty}
                        </span>
                      </div>
                      <button
                        className={`bookmark-btn ${bookmarked ? 'active' : ''}`}
                        onClick={() => toggleBookmark(tool.id, 'calculator')}
                      >
                        <Star size={16} />
                      </button>
                    </div>

                    <div className="resource-content">
                      <h3 className="resource-title">{tool.title}</h3>
                      <p className="resource-description">{tool.description}</p>

                      <div className="resource-features">
                        <h4>Features:</h4>
                        <ul>
                          {tool.features.map((feature, index) => (
                            <li key={index}>
                              <CheckCircle size={14} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="resource-stats">
                        <div className="stat">
                          <Star size={14} />
                          <span>{tool.rating}</span>
                        </div>
                        <div className="stat">
                          <Users size={14} />
                          <span>{tool.usage} users</span>
                        </div>
                      </div>
                    </div>

                    <div className="resource-actions">
                      <button className="btn btn-primary">
                        <Calculator size={16} />
                        Use Tool
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates-section">
            <div className="section-header">
              <h2>Financial Templates</h2>
              <p>Ready-to-use templates for budgeting, tracking, and planning</p>
            </div>

            <div className="resources-grid">
              {filterResources(templates, 'template').map((template) => {
                const Icon = template.icon;
                const bookmarked = isBookmarked(template.id, 'template');

                return (
                  <div key={template.id} className="resource-card">
                    <div className="resource-header">
                      <div className="resource-icon" style={{ backgroundColor: `${template.color}20`, color: template.color }}>
                        <Icon size={24} />
                      </div>
                      <div className="resource-meta">
                        <span className="resource-type">{template.format}</span>
                        <span className="file-size">{template.size}</span>
                      </div>
                      <button
                        className={`bookmark-btn ${bookmarked ? 'active' : ''}`}
                        onClick={() => toggleBookmark(template.id, 'template')}
                      >
                        <Star size={16} />
                      </button>
                    </div>

                    <div className="resource-content">
                      <h3 className="resource-title">{template.title}</h3>
                      <p className="resource-description">{template.description}</p>

                      <div className="resource-stats">
                        <div className="stat">
                          <Star size={14} />
                          <span>{template.rating}</span>
                        </div>
                        <div className="stat">
                          <Download size={14} />
                          <span>{template.downloads} downloads</span>
                        </div>
                      </div>
                    </div>

                    <div className="resource-actions">
                      <button className="btn btn-primary">
                        <Download size={16} />
                        Download
                      </button>
                      <button className="btn btn-secondary">
                        <Eye size={16} />
                        Preview
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="links-section">
            <div className="section-header">
              <h2>External Resources</h2>
              <p>Curated links to valuable financial websites and resources</p>
            </div>

            <div className="resources-grid">
              {filterResources(externalResources, 'external').map((resource) => {
                const Icon = resource.icon;
                const bookmarked = isBookmarked(resource.id, 'external');

                return (
                  <div key={resource.id} className="resource-card">
                    <div className="resource-header">
                      <div className="resource-icon" style={{ backgroundColor: `${resource.color}20`, color: resource.color }}>
                        <Icon size={24} />
                      </div>
                      <div className="resource-meta">
                        <span className="resource-type">{resource.type}</span>
                        <ExternalLink size={14} className="external-indicator" />
                      </div>
                      <button
                        className={`bookmark-btn ${bookmarked ? 'active' : ''}`}
                        onClick={() => toggleBookmark(resource.id, 'external')}
                      >
                        <Star size={16} />
                      </button>
                    </div>

                    <div className="resource-content">
                      <h3 className="resource-title">{resource.title}</h3>
                      <p className="resource-description">{resource.description}</p>

                      <div className="resource-stats">
                        <div className="stat">
                          <Star size={14} />
                          <span>{resource.rating}</span>
                        </div>
                        <div className="stat">
                          <Globe size={14} />
                          <span>Official</span>
                        </div>
                      </div>
                    </div>

                    <div className="resource-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink size={16} />
                        Visit Site
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="providers-section">
            <div className="section-header">
              <h2>Financial Service Providers</h2>
              <p>Trusted financial institutions and service providers in Nigeria</p>
            </div>

            <div className="providers-list">
              {serviceProviders
                .filter(provider =>
                  selectedCategory === 'all' || provider.category === selectedCategory
                )
                .filter(provider =>
                  provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  provider.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((provider) => {
                  const Icon = provider.icon;

                  return (
                    <div key={provider.id} className="provider-card">
                      <div className="provider-header">
                        <div className="provider-info">
                          <div className="provider-icon">
                            <Icon size={28} />
                          </div>
                          <div>
                            <h3 className="provider-name">{provider.name}</h3>
                            <p className="provider-type">{provider.type}</p>
                            <div className="provider-rating">
                              <Star size={14} />
                              <span>{provider.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="provider-content">
                        <p className="provider-description">{provider.description}</p>

                        <div className="provider-services">
                          <h4>Services:</h4>
                          <div className="services-list">
                            {provider.services.map((service, index) => (
                              <span key={index} className="service-tag">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="provider-contact">
                          <h4>Contact Information:</h4>
                          <div className="contact-details">
                            <div className="contact-item">
                              <Phone size={16} />
                              <span>{provider.contact.phone}</span>
                            </div>
                            <div className="contact-item">
                              <Mail size={16} />
                              <span>{provider.contact.email}</span>
                            </div>
                            <div className="contact-item">
                              <Globe size={16} />
                              <a href={provider.contact.website} target="_blank" rel="noopener noreferrer">
                                Visit Website
                              </a>
                            </div>
                            <div className="contact-item">
                              <MapPin size={16} />
                              <span>{provider.contact.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'tools' && filterResources(calculators, 'calculator').length === 0) ||
          (activeTab === 'templates' && filterResources(templates, 'template').length === 0) ||
          (activeTab === 'links' && filterResources(externalResources, 'external').length === 0)) && (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <h3>No Resources Found</h3>
            <p>Try adjusting your search terms or filters to find what you're looking for.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;