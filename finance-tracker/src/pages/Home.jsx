import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  ArrowRight, 
  Target, 
  PiggyBank, 
  TrendingUp, 
  Trophy, 
  Star, 
  CheckCircle, 
  Coins,
  Zap,
  Gift,
  Users,
  BookOpen,
  Menu,
  X,
  CreditCard,
  DollarSign,
  TrendingDown,
  Award,
  Calendar,
  Bell,
  Settings,
  User,
  Shield,
  Heart,
  Smartphone,
  ChevronLeft, 
  ChevronRight, 
  Gamepad2, 
  BarChart3
} from 'lucide-react';

import '../styles/Home.css';

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true); // Add this line

  // Mock data for demonstration
  const accountBalance = 12450;
  const savingsGoal = 50000;
  const xpPoints = 2340;
  const level = 5;
  const weeklySpent = 3200;
  const monthlyBudget = 15000;

  // Features carousel data
  const features = [
    {
      id: 1,
      icon: <Gamepad2 size={60} />,
      title: "Gamified Saving",
      subtitle: "Turn Saving into a Game",
      description: "Earn points, unlock achievements, and level up as you meet your financial goals. Every naira saved brings you closer to rewards and new challenges!",
      highlights: ["Earn XP for every save", "Unlock exclusive badges", "Level up your financial status", "Daily saving streaks"],
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      id: 2,
      icon: <BarChart3 size={60} />,
      title: "Track & Learn",
      subtitle: "Visualize Your Financial Journey",
      description: "Get crystal-clear insights into your spending patterns and savings progress with beautiful, easy-to-understand charts and analytics.",
      highlights: ["Interactive spending charts", "Savings progress tracking", "Monthly financial reports", "Smart categorization"],
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    },
    {
      id: 3,
      icon: <Trophy size={60} />,
      title: "Challenges & Leaderboards",
      subtitle: "Compete and Conquer",
      description: "Join exciting financial challenges, compete with friends, and climb the leaderboards. Make saving money a social and competitive experience!",
      highlights: ["Weekly saving challenges", "Friend competitions", "Global leaderboards", "Team challenges"],
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    {
      id: 4,
      icon: <Target size={60} />,
      title: "Smart Insights",
      subtitle: "AI-Powered Financial Guidance",
      description: "Receive personalized tips, smart nudges, and actionable insights to improve your money habits and reach your financial goals faster.",
      highlights: ["Personalized saving tips", "Spending alerts", "Goal recommendations", "Financial health scores"],
      color: "#8b5cf6",
      bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
    }
  ];

  const tasks = [
    { id: 1, title: "Save ₦500 today", xp: 50, completed: false },
    { id: 2, title: "Complete financial quiz", xp: 100, completed: true },
    { id: 3, title: "Invite a friend", xp: 200, completed: false },
    { id: 4, title: "Set weekly budget", xp: 75, completed: true },
    { id: 5, title: "Read investment article", xp: 125, completed: false }
  ];

  const achievements = [
    { id: 1, title: "First Saver", icon: <PiggyBank className="icon" />, unlocked: true },
    { id: 2, title: "Goal Crusher", icon: <Target className="icon" />, unlocked: true },
    { id: 3, title: "Streak Master", icon: <Zap className="icon" />, unlocked: false },
    { id: 4, title: "Community Helper", icon: <Users className="icon" />, unlocked: false },
    { id: 5, title: "Quiz Master", icon: <BookOpen className="icon" />, unlocked: true },
    { id: 6, title: "Budget Pro", icon: <Trophy className="icon" />, unlocked: false }
  ];

  const recentTransactions = [
    { id: 1, type: "deposit", amount: 2500, description: "Salary Credit", date: "Today" },
    { id: 2, type: "withdrawal", amount: -450, description: "Grocery Shopping", date: "Yesterday" },
    { id: 3, type: "deposit", amount: 1200, description: "Freelance Payment", date: "2 days ago" },
    { id: 4, type: "withdrawal", amount: -300, description: "Transportation", date: "3 days ago" }
  ];

  const savingsCircles = [
    { id: 1, name: "Emergency Fund", members: 12, target: 100000, current: 45000, yourContribution: 8500 },
    { id: 2, name: "Vacation Squad", members: 8, target: 200000, current: 120000, yourContribution: 15000 },
    { id: 3, name: "Investment Club", members: 25, target: 500000, current: 180000, yourContribution: 7200 }
  ];

  const leaderboard = [
    { id: 1, name: "Sarah Johnson", xp: 4250, level: 7, avatar: "👩" },
    { id: 2, name: "Michael Chen", xp: 3890, level: 6, avatar: "👨" },
    { id: 3, name: "You", xp: 2340, level: 5, avatar: "🎯" },
    { id: 4, name: "Emma Davis", xp: 2100, level: 4, avatar: "👩‍💼" },
    { id: 5, name: "John Smith", xp: 1850, level: 4, avatar: "👨‍💻" }
  ];

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = (completedTasks / totalTasks) * 100;

   // Auto-play functionality for carousel
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % features.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, features.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentFeature = features[currentSlide];

  return (
    <div className="app">
     
{/* Navigation */}
<nav className="nav">
  <div className="nav-container">
    <div className="nav-content">
      {/* Logo - now clickable */}
      <Link to="/" className="logo-link">
        <div className="logo">
          <div className="logo-icon" width="2" height="2">
            <PiggyBank className="icon" style={{ color: 'black' }} />
          </div>
          <span className="logo-text">MoniUp</span>
        </div>
            </Link>
            {/* Navigation */}

            {/* Desktop Menu */}
            <div className="desktop-menu">
              <a href="#home" className="nav-link active">Save</a>
              <a href="#about" className="nav-link">Invest</a>
              <a href="#learn" className="nav-link">Learn</a>
              <a href="#community" className="nav-link">Resources</a>
              <button className="login-btn" onClick={() => navigate('/signup')} >Get Started</button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="icon" /> : <Menu className="icon" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <a href="#save">Save</a>
            <a href="#invest">Invest</a>
            <a href="#learn">Learn</a>
            <a href="#resources">Resources</a>
            <button className="mobile-login-btn" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="main-content">
          {/* Hero Section */}
          <div className="hero">
            <div className="level-badge">
              <Zap className="icon" style={{ marginRight: '8px' }} />
              Level {level} • {xpPoints.toLocaleString()} XP
            </div>
            
            <h1 className="hero-title">
              MoniUp! Your Game 
            </h1>
            
            <p className="hero-description">
              Transform your financial journey into an exciting adventure! Save, learn, and grow your money while earning rewards, leveling up, and competing with friends in the most engaging financial platform ever created.
            </p>
            
            <button className="cta-btn">
              Start Your Journey  
              <ArrowRight className="icon" style={{ marginLeft: '12px' }} />
            </button>
          </div>

         {/* Features Carousel Section */}
          <div className="features-carousel-section">
            <div className="carousel-container">
              <div className="carousel-wrapper">
                {/* Navigation Arrows */}
                <button 
                  className="carousel-nav prev" 
                  onClick={prevSlide}
                  aria-label="Previous feature"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <button 
                  className="carousel-nav next" 
                  onClick={nextSlide}
                  aria-label="Next feature"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Feature Card */}
                <div className="feature-card" style={{ background: currentFeature.bgGradient }}>
                  <div className="feature-content">
                    <div className="feature-left">
                      <div className="feature-icon" style={{ color: 'white' }}>
                        {currentFeature.icon}
                      </div>
                      
                      <div className="feature-text">
                        <h2 className="feature-title">{currentFeature.title}</h2>
                        <h3 className="feature-subtitle">{currentFeature.subtitle}</h3>
                        <p className="feature-description">{currentFeature.description}</p>
                        
                        <ul className="feature-highlights">
                          {currentFeature.highlights.map((highlight, index) => (
                            <li key={index} className="highlight-item">
                              <Award size={16} />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="feature-visual">
                      <div className="visual-placeholder">
                        <div className="visual-icon" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {currentFeature.icon}
                        </div>
                        <div className="visual-stats">
                          <div className="stat-item">
                            <TrendingUp size={20} />
                            <span>+25%</span>
                          </div>
                          <div className="stat-item">
                            <Users size={20} />
                            <span>1.2k</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide Indicators */}
                <div className="slide-indicators">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                      style={{ 
                        backgroundColor: index === currentSlide ? currentFeature.color : 'rgba(255,255,255,0.3)' 
                      }}
                    />
                  ))}
                </div>

                {/* Auto-play Controls */}
                <div className="carousel-controls">
                  <button 
                    className={`auto-play-btn ${isAutoPlaying ? 'active' : ''}`}
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  >
                    {isAutoPlaying ? 'Pause' : 'Play'} Auto-Scroll
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* New Sections */}
          {/* Recent Transactions */}
          <h2 className="section-title">Recent Transactions</h2>
          <div className="grid grid-2 mb-60">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '22px' }}>Transaction History</h3>
                <CreditCard className="card-icon" style={{ color: '#10b981' }} />
              </div>
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-left">
                    <div className={`transaction-icon ${transaction.type}`}>
                      {transaction.type === 'deposit' ? 
                        <TrendingUp className="icon" /> : 
                        <TrendingDown className="icon" />
                      }
                    </div>
                    <div className="transaction-details">
                      <h4>{transaction.description}</h4>
                      <p>{transaction.date}</p>
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <span className={`amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                      {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '22px' }}>Leaderboard</h3>
                <Award className="card-icon" style={{ color: '#d97706' }} />
              </div>
              {leaderboard.map((user, index) => (
                <div key={user.id} className="leaderboard-item">
                  <div className={`leaderboard-rank ${index < 3 ? 'top3' : ''}`}>
                    {index + 1}
                  </div>
                  <div className="leaderboard-avatar">{user.avatar}</div>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">{user.name}</div>
                    <div className="leaderboard-level">Level {user.level}</div>
                  </div>
                  <div className="leaderboard-xp">{user.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="feature-section">
            <div className="feature-header">
              <h2>Why Choose MoniUp?</h2>
              <p>Discover powerful features that make financial management fun, engaging, and rewarding for users of all experience levels</p>
            </div>
            
            <div className="grid grid-3 mb-60">
              <div className="feature-card">
                <Target className="feature-icon" />
                <h3 className="feature-title">Smart Goals</h3>
                <p className="feature-description">Set personalized financial goals and track your progress with gamified milestones, intelligent recommendations, and automated savings features.</p>
              </div>

              <div className="feature-card">
                <Users className="feature-icon" />
                <h3 className="feature-title">Community Savings</h3>
                <p className="feature-description">Join savings circles, compete with friends, and achieve financial goals together through collaborative challenges and group accountability.</p>
              </div>

              <div className="feature-card">
                <BookOpen className="feature-icon" />
                <h3 className="feature-title">Financial Education</h3>
                <p className="feature-description">Learn through interactive lessons, quizzes, and challenges designed to improve your financial literacy and decision-making skills.</p>
              </div>

              <div className="feature-card">
                <Shield className="feature-icon" />
                <h3 className="feature-title">Secure & Safe</h3>
                <p className="feature-description">Bank-level security with end-to-end encryption, multi-factor authentication, and compliance with international financial standards.</p>
              </div>

              <div className="feature-card">
                <Smartphone className="feature-icon" />
                <h3 className="feature-title">Mobile First</h3>
                <p className="feature-description">Seamless experience across all devices with our intuitive mobile app, real-time notifications, and offline functionality.</p>
              </div>

              <div className="feature-card">
                <Heart className="feature-icon" />
                <h3 className="feature-title">Personalized</h3>
                <p className="feature-description">AI-powered insights and recommendations tailored to your spending habits, financial goals, and life circumstances.</p>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="newsletter">
            <h3>Stay Updated with FinanceUp</h3>
            <p>Get the latest tips, features, and exclusive offers delivered to your inbox</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="newsletter-input"
              />
              <button className="newsletter-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>FinanceUp</h4>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                Transform your financial journey into an exciting adventure with gamified savings, learning, and community features.
              </p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li><a href="#goals">Smart Goals</a></li>
                <li><a href="#community">Savings Circles</a></li>
                <li><a href="#education">Financial Education</a></li>
                <li><a href="#achievements">Achievements</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#press">Press</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#security">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="social-links">
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">t</a>
              <a href="#" className="social-link">in</a>
              <a href="#" className="social-link">ig</a>
            </div>
            <p>&copy; 2025 FinanceUp. All rights reserved. Made with ❤️ for your financial success.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;