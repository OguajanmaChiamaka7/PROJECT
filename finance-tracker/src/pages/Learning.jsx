import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  Target,
  TrendingUp,
  PiggyBank,
  Shield,
  CreditCard,
  Home,
  Smartphone,
  Calculator,
  Wallet,
  File,
  Globe,
  Users,
  Award,
  ArrowRight,
  BookmarkPlus,
  Eye,
  Calendar,
  BarChart3,
  Badge
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';
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
import {financeTipsData} from '../utils/constants';
import '../styles/Learning.css';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [learningData, setLearningData] = useState({
    enrolledCourses: [],
    completedLessons: [],
    bookmarkedContent: [],
    tips: [],
    progress: {
      totalCourses: 0,
      completedCourses: 0,
      totalLessons: 0,
      completedLessons: 0,
      studyStreak: 0,
      totalStudyTime: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { currentUser } = useAuth();

  // Sample learning content - in a real app this would come from a backend
  const courses = [
    {
      id: 1,
      title: 'Personal Finance Fundamentals',
      description: 'Master the basics of managing your money, budgeting, and building financial habits.',
      level: 'Beginner',
      duration: '4 hours',
      lessons: 12,
      category: 'fundamentals',
      instructor: 'Sarah Johnson, CFP',
      rating: 4.8,
      students: 1234,
      icon: PiggyBank,
      color: '#10b981',
      thumbnail: '/api/placeholder/300/200',
      syllabus: [
        { id: 1, title: 'Understanding Money and Value', duration: '15 min', completed: false },
        { id: 2, title: 'Creating Your First Budget', duration: '25 min', completed: false },
        { id: 3, title: 'Tracking Income and Expenses', duration: '20 min', completed: false },
        { id: 4, title: 'Emergency Fund Basics', duration: '18 min', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Investment Strategies for Beginners',
      description: 'Learn how to start investing wisely and build long-term wealth.',
      level: 'Beginner',
      duration: '6 hours',
      lessons: 18,
      category: 'investing',
      instructor: 'Michael Chen, CFA',
      rating: 4.9,
      students: 987,
      icon: TrendingUp,
      color: '#3b82f6',
      thumbnail: '/api/placeholder/300/200',
      syllabus: [
        { id: 1, title: 'Investment Fundamentals', duration: '22 min', completed: false },
        { id: 2, title: 'Risk vs Return', duration: '28 min', completed: false },
        { id: 3, title: 'Stock Market Basics', duration: '35 min', completed: false },
        { id: 4, title: 'Diversification Strategies', duration: '30 min', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Credit Score Mastery',
      description: 'Understand credit scores, improve your credit, and access better financial products.',
      level: 'Intermediate',
      duration: '3 hours',
      lessons: 10,
      category: 'credit',
      instructor: 'David Wilson, Financial Advisor',
      rating: 4.7,
      students: 756,
      icon: CreditCard,
      color: '#8b5cf6',
      thumbnail: '/api/placeholder/300/200',
      syllabus: [
        { id: 1, title: 'How Credit Scores Work', duration: '20 min', completed: false },
        { id: 2, title: 'Credit Report Analysis', duration: '25 min', completed: false },
        { id: 3, title: 'Improving Your Credit Score', duration: '30 min', completed: false },
        { id: 4, title: 'Credit Cards vs Loans', duration: '22 min', completed: false }
      ]
    },
    {
      id: 4,
      title: 'Home Buying Guide',
      description: 'Navigate the home buying process with confidence and make informed decisions.',
      level: 'Advanced',
      duration: '5 hours',
      lessons: 15,
      category: 'real_estate',
      instructor: 'Lisa Rodriguez, Real Estate Expert',
      rating: 4.6,
      students: 432,
      icon: Home,
      color: '#f59e0b',
      thumbnail: '/api/placeholder/300/200',
      syllabus: [
        { id: 1, title: 'Getting Pre-approved for a Mortgage', duration: '25 min', completed: false },
        { id: 2, title: 'Understanding Home Values', duration: '30 min', completed: false },
        { id: 3, title: 'The Home Inspection Process', duration: '28 min', completed: false },
        { id: 4, title: 'Closing Process Explained', duration: '35 min', completed: false }
      ]
    },
    {
      id: 5,
      title: 'Digital Banking & FinTech',
      description: 'Master modern financial technology and digital banking tools.',
      level: 'Intermediate',
      duration: '4 hours',
      lessons: 14,
      category: 'technology',
      instructor: 'Alex Kim, FinTech Specialist',
      rating: 4.5,
      students: 623,
      icon: Smartphone,
      color: '#ef4444',
      thumbnail: '/api/placeholder/300/200',
      syllabus: [
        { id: 1, title: 'Online Banking Security', duration: '18 min', completed: false },
        { id: 2, title: 'Mobile Payment Systems', duration: '22 min', completed: false },
        { id: 3, title: 'Cryptocurrency Basics', duration: '30 min', completed: false },
        { id: 4, title: 'Choosing Financial Apps', duration: '20 min', completed: false }
      ]
    },
    {
      id: 6,
      title: 'Risk Management & Insurance',
      description: 'Protect your financial future with proper insurance and risk management.',
      level: 'Intermediate',
      duration: '3.5 hours',
      lessons: 11,
      category: 'insurance',
      instructor: 'Rachel Green, Insurance Advisor',
      rating: 4.4,
      students: 345,
      icon: Shield,
      color: '#06b6d4',
      thumbnail: '/api/placeholder/300/200',
      syllabus: [
        { id: 1, title: 'Types of Insurance Coverage', duration: '25 min', completed: false },
        { id: 2, title: 'Life Insurance Strategies', duration: '32 min', completed: false },
        { id: 3, title: 'Health Insurance Optimization', duration: '28 min', completed: false },
        { id: 4, title: 'Property Insurance Essentials', duration: '24 min', completed: false }
      ]
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'First Course Completed',
      description: 'Completed your first financial education course',
      icon: Trophy,
      color: '#f59e0b',
      requirement: 'Complete 1 course',
      unlocked: false
    },
    {
      id: 2,
      title: 'Learning Streak',
      description: 'Studied for 7 consecutive days',
      icon: Target,
      color: '#10b981',
      requirement: 'Study 7 days in a row',
      unlocked: false
    },
    {
      id: 3,
      title: 'Knowledge Master',
      description: 'Completed 5 courses with 90%+ scores',
      icon: Star,
      color: '#8b5cf6',
      requirement: 'Score 90%+ on 5 courses',
      unlocked: false
    },
    {
      id: 4,
      title: 'Investment Expert',
      description: 'Completed all investment-related courses',
      icon: TrendingUp,
      color: '#3b82f6',
      requirement: 'Complete all investment courses',
      unlocked: false
    }
  ];

  useEffect(() => {
    if (currentUser) {
      loadLearningData();
      setupLearningListener();
    }
  }, [currentUser]);

  const loadLearningData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load user's learning progress
      const progressQuery = query(
        collection(db, 'learningProgress'),
        where('userId', '==', currentUser.uid)
      );

      const progressSnapshot = await getDocs(progressQuery);
      let progressData = {
        enrolledCourses: [],
        completedLessons: [],
        bookmarkedContent: [],
        achievements: [],
        progress: {
          totalCourses: 0,
          completedCourses: 0,
          totalLessons: 0,
          completedLessons: 0,
          studyStreak: 0,
          totalStudyTime: 0
        }
      };

      if (!progressSnapshot.empty) {
        const data = progressSnapshot.docs[0].data();
        progressData = { ...progressData, ...data };
      }

      setLearningData(progressData);
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupLearningListener = () => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'learningProgress'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setLearningData(prevData => ({ ...prevData, ...data }));
      }
    });

    return () => unsubscribe();
  };

  const enrollInCourse = async (courseId) => {
    if (!currentUser) return;

    try {
      const progressRef = collection(db, 'learningProgress');
      const userQuery = query(progressRef, where('userId', '==', currentUser.uid));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        // Create new progress document
        await addDoc(progressRef, {
          userId: currentUser.uid,
          enrolledCourses: [courseId],
          completedLessons: [],
          bookmarkedContent: [],
          achievements: [],
          progress: {
            totalCourses: 1,
            completedCourses: 0,
            totalLessons: 0,
            completedLessons: 0,
            studyStreak: 0,
            totalStudyTime: 0
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } else {
        // Update existing progress
        const docRef = userSnapshot.docs[0].ref;
        await updateDoc(docRef, {
          enrolledCourses: arrayUnion(courseId),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const markLessonComplete = async (courseId, lessonId) => {
    if (!currentUser) return;

    try {
      const progressRef = collection(db, 'learningProgress');
      const userQuery = query(progressRef, where('userId', '==', currentUser.uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const docRef = userSnapshot.docs[0].ref;
        const lessonKey = `${courseId}-${lessonId}`;

        await updateDoc(docRef, {
          completedLessons: arrayUnion(lessonKey),
          updatedAt: Timestamp.now()
        });

        // Update study time and streak logic here
        const currentData = userSnapshot.docs[0].data();
        const newCompletedCount = (currentData.completedLessons?.length || 0) + 1;

        await updateDoc(docRef, {
          'progress.completedLessons': newCompletedCount,
          'progress.totalStudyTime': (currentData.progress?.totalStudyTime || 0) + 20 // Assume 20 min per lesson
        });
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

const financeTips = [
  {
    id: 1,
    title: "The Power of Small Savings",
    tip: `Most people think they need to start saving with huge amounts of money — that's not true. 
    What matters most is consistency. Saving ₦500 every day may seem small, but over a month,
    that's ₦15,000. In a year, that's ₦180,000 — excluding any interest or investment growth.
    Small, consistent savings build financial discipline and create a habit that lasts a lifetime.`,
    icon: PiggyBank,
    color: "#2ecc71" // light green
  },
  {
    id: 2,
    title: "Budgeting Is a Superpower",
    tip: `Budgeting helps you control your money instead of letting it control you. 
    Write down your income, track your expenses, and decide how much goes into needs, wants, and savings. 
    When you budget intentionally, you’ll be surprised how much money you can redirect toward your goals.`,
    icon: Calculator,
    color: "#27ae60"
  },
  {
    id: 3,
    title: "Pay Yourself First",
    tip: `Before paying bills or buying anything, set aside your savings. 
    Treat it like a non-negotiable expense. Automate transfers if possible — 
    it removes temptation and builds a consistent saving habit.`,
    icon: Wallet,
    color: "#1abc9c"
  }
  ];
  
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
const [userProgress, setUserProgress] = useState(null);
const uid = getAuth().currentUser?.uid;

useEffect(() => {
  const fetchUserProgress = async () => {
    if (!uid) return;
    const docRef = doc(db, "userFinanceTips", uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      setUserProgress(snapshot.data());
      setCurrentTipIndex(snapshot.data().currentTip || 0);
    } else {
      // Initialize with currentTip: 1 (meaning they've viewed the first tip)
      await setDoc(docRef, { currentTip: 1 });
      setCurrentTipIndex(0);
      setUserProgress({ currentTip: 1 });
    }
  };

  fetchUserProgress();
}, [uid]);

const unlockNextTip = async () => {
  if (currentTipIndex < financeTipsData.length - 1) {
    const newIndex = currentTipIndex + 1;
    setCurrentTipIndex(newIndex);
    await updateDoc(doc(db, "userFinanceTips", uid), { currentTip: newIndex });
  }
};


  const toggleBookmark = async (contentId, contentType = 'course') => {
    if (!currentUser) return;

    try {
      const progressRef = collection(db, 'learningProgress');
      const userQuery = query(progressRef, where('userId', '==', currentUser.uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const docRef = userSnapshot.docs[0].ref;
        const currentData = userSnapshot.docs[0].data();
        const bookmarkKey = `${contentType}-${contentId}`;

        const isBookmarked = currentData.bookmarkedContent?.includes(bookmarkKey);

        if (isBookmarked) {
          await updateDoc(docRef, {
            bookmarkedContent: arrayRemove(bookmarkKey),
            updatedAt: Timestamp.now()
          });
        } else {
          await updateDoc(docRef, {
            bookmarkedContent: arrayUnion(bookmarkKey),
            updatedAt: Timestamp.now()
          });
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
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

  const isEnrolled = (courseId) => {
    return learningData.enrolledCourses.includes(courseId);
  };

  const isBookmarked = (contentId, contentType = 'course') => {
    const bookmarkKey = `${contentType}-${contentId}`;
    return learningData.bookmarkedContent?.includes(bookmarkKey);
  };

  const getEnrolledCourses = () => {
    return courses.filter(course => learningData.enrolledCourses.includes(course.id));
  };

  const getCompletionRate = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;

    const completedLessons = course.syllabus.filter(lesson => {
      const lessonKey = `${courseId}-${lesson.id}`;
      return learningData.completedLessons.includes(lessonKey);
    }).length;

    return (completedLessons / course.syllabus.length) * 100;
  };

  if (loading) {
    return (
      <div className="learning-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading learning content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <BookOpen className="header-icon" />
          <div>
            <h1 className="page-title">Financial Education</h1>
            <p className="page-subtitle">Learn and improve your financial knowledge</p>
          </div>
        </div>
        <div className="learning-stats">
          <div className="stat-item">
            <span className="stat-value">{learningData.progress.completedCourses}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Math.floor(learningData.progress.totalStudyTime / 60)}h</span>
            <span className="stat-label">Study Time</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        {[
          { key: 'courses', label: 'All Courses', icon: BookOpen },
          { key: 'enrolled', label: 'My Courses', icon: Play },
          { key: 'tips', label: 'Tips', icon: File, },
          { key: 'bookmarks', label: 'Bookmarks', icon: BookmarkPlus }
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
        {activeTab === 'courses' && (
          <div className="courses-section">
            <div className="section-header">
              <h2>Available Courses</h2>
              <p>Expand your financial knowledge with our comprehensive course library</p>
            </div>

            <div className="courses-grid">
              {courses.map((course) => {
                const Icon = course.icon;
                const enrolled = isEnrolled(course.id);
                const bookmarked = isBookmarked(course.id);
                const completionRate = enrolled ? getCompletionRate(course.id) : 0;

                return (
                  <div key={course.id} className="course-card">
                    <div className="course-header">
                      <div className="course-thumbnail">
                        <div className="course-icon" style={{ backgroundColor: `${course.color}20`, color: course.color }}>
                          <Icon size={24} />
                        </div>
                        <div className="course-level" style={{ color: getLevelColor(course.level) }}>
                          {course.level}
                        </div>
                      </div>
                      <button
                        className={`bookmark-btn ${bookmarked ? 'active' : ''}`}
                        onClick={() => toggleBookmark(course.id)}
                      >
                        <BookmarkPlus size={16} />
                      </button>
                    </div>

                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-description">{course.description}</p>

                      <div className="course-meta">
                        <div className="meta-item">
                          <Clock size={14} />
                          <span>{course.duration}</span>
                        </div>
                        <div className="meta-item">
                          <Play size={14} />
                          <span>{course.lessons} lessons</span>
                        </div>
                        <div className="meta-item">
                          <Star size={14} />
                          <span>{course.rating}</span>
                        </div>
                        <div className="meta-item">
                          <Users size={14} />
                          <span>{course.students}</span>
                        </div>
                      </div>

                      <div className="course-instructor">
                        <span>By {course.instructor}</span>
                      </div>

                      {enrolled && completionRate > 0 && (
                        <div className="progress-section">
                          <div className="progress-info">
                            <span>Progress: {completionRate.toFixed(0)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${completionRate}%`,
                                backgroundColor: course.color
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="course-actions">
                      {enrolled ? (
                        <button
                          className="btn btn-secondary"
                          onClick={() => setSelectedCourse(course)}
                        >
                          <Play size={16} />
                          Continue Learning
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => enrollInCourse(course.id)}
                        >
                          <BookOpen size={16} />
                          Enroll Now
                        </button>
                      )}
                      <button
                        className="btn btn-outline"
                        onClick={() => setSelectedCourse(course)}
                      >
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

        {activeTab === 'enrolled' && (
          <div className="enrolled-section">
            <div className="section-header">
              <h2>My Courses</h2>
              <p>Continue your financial education journey</p>
            </div>

            {getEnrolledCourses().length === 0 ? (
              <div className="empty-state">
                <BookOpen size={48} className="empty-icon" />
                <h3>No Enrolled Courses</h3>
                <p>Start your financial education by enrolling in a course!</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('courses')}
                >
                  <BookOpen size={16} />
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="enrolled-grid">
                {getEnrolledCourses().map((course) => {
                  const Icon = course.icon;
                  const completionRate = getCompletionRate(course.id);
                  const completedLessons = course.syllabus.filter(lesson => {
                    const lessonKey = `${course.id}-${lesson.id}`;
                    return learningData.completedLessons.includes(lessonKey);
                  }).length;

                  return (
                    <div key={course.id} className="enrolled-card">
                      <div className="enrolled-header">
                        <div className="course-icon" style={{ backgroundColor: `${course.color}20`, color: course.color }}>
                          <Icon size={20} />
                        </div>
                        <div className="enrolled-info">
                          <h4>{course.title}</h4>
                          <p>{completedLessons} of {course.lessons} lessons completed</p>
                        </div>
                        <div className="completion-badge">
                          {completionRate.toFixed(0)}%
                        </div>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${completionRate}%`,
                            backgroundColor: course.color
                          }}
                        />
                      </div>

                      <div className="enrolled-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => setSelectedCourse(course)}
                        >
                          <Play size={16} />
                          Continue
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
{activeTab === 'tips' && (
  <div className="finance-tips-section">
    <div className="section-header">
      <h2>Daily Finance Tip</h2>
      <p>Learn one new thing every day to improve your money habits</p>
    </div>

    {financeTipsData[currentTipIndex] && (
      <div className="finance-tip-card">
        <div
          className="finance-tip-icon"
          style={{
            backgroundColor: `${financeTipsData[currentTipIndex].iconColor}20`,
            color: financeTipsData[currentTipIndex].iconColor,
          }}
        >
          <BookOpen size={24} />
        </div>
        <div className="finance-tip-content">
          <h4>{financeTipsData[currentTipIndex].title}</h4>
          <p>{financeTipsData[currentTipIndex].content}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={unlockNextTip}
          disabled={currentTipIndex >= financeTipsData.length - 1}
          style={{ marginTop: '1rem' }}
        >
          {currentTipIndex >= financeTipsData.length - 1 ? 'All Tips Read!' : 'Next Tip →'}
        </button>
      </div>
    )}
  </div>
)}



        {activeTab === 'bookmarks' && (
          <div className="bookmarks-section">
            <div className="section-header">
              <h2>Bookmarked Content</h2>
              <p>Quick access to your saved learning materials</p>
            </div>

            {learningData.bookmarkedContent?.length === 0 ? (
              <div className="empty-state">
                <BookmarkPlus size={48} className="empty-icon" />
                <h3>No Bookmarks Yet</h3>
                <p>Bookmark courses and lessons to access them quickly later!</p>
              </div>
            ) : (
              <div className="bookmarks-grid">
                {learningData.bookmarkedContent?.map((bookmark) => {
                  const [type, id] = bookmark.split('-');
                  if (type === 'course') {
                    const course = courses.find(c => c.id === parseInt(id));
                    if (!course) return null;

                    const Icon = course.icon;
                    return (
                      <div key={bookmark} className="bookmark-card">
                        <div className="bookmark-icon" style={{ backgroundColor: `${course.color}20`, color: course.color }}>
                          <Icon size={20} />
                        </div>
                        <div className="bookmark-content">
                          <h4>{course.title}</h4>
                          <p>{course.level} • {course.duration}</p>
                        </div>
                        <button
                          className="bookmark-remove"
                          onClick={() => toggleBookmark(course.id)}
                        >
                          <BookmarkPlus size={16} />
                        </button>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="course-modal-header">
                <div className="course-icon" style={{ backgroundColor: `${selectedCourse.color}20`, color: selectedCourse.color }}>
                  <selectedCourse.icon size={32} />
                </div>
                <div>
                  <h3>{selectedCourse.title}</h3>
                  <p>{selectedCourse.instructor}</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedCourse(null)}
              >
                ×
              </button>
            </div>

            <div className="course-modal-body">
              <div className="course-description">
                <p>{selectedCourse.description}</p>
              </div>

              <div className="course-stats">
                <div className="stat">
                  <Clock size={16} />
                  <span>{selectedCourse.duration}</span>
                </div>
                <div className="stat">
                  <Play size={16} />
                  <span>{selectedCourse.lessons} lessons</span>
                </div>
                <div className="stat">
                  <Star size={16} />
                  <span>{selectedCourse.rating} rating</span>
                </div>
                <div className="stat">
                  <Users size={16} />
                  <span>{selectedCourse.students} students</span>
                </div>
              </div>

              <div className="course-syllabus">
                <h4>Course Content</h4>
                <div className="syllabus-list">
                  {selectedCourse.syllabus.map((lesson) => {
                    const lessonKey = `${selectedCourse.id}-${lesson.id}`;
                    const completed = learningData.completedLessons.includes(lessonKey);
                    const enrolled = isEnrolled(selectedCourse.id);

                    return (
                      <div key={lesson.id} className={`syllabus-item ${completed ? 'completed' : ''}`}>
                        <div className="lesson-info">
                          {completed ? (
                            <CheckCircle size={16} className="lesson-status completed" />
                          ) : (
                            <div className="lesson-status pending">
                              <Play size={12} />
                            </div>
                          )}
                          <div>
                            <span className="lesson-title">{lesson.title}</span>
                            <span className="lesson-duration">{lesson.duration}</span>
                          </div>
                        </div>
                        {enrolled && !completed && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => markLessonComplete(selectedCourse.id, lesson.id)}
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions">
                {isEnrolled(selectedCourse.id) ? (
                  <button className="btn btn-primary btn-large">
                    <Play size={16} />
                    Continue Learning
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-large"
                    onClick={() => {
                      enrollInCourse(selectedCourse.id);
                      setSelectedCourse(null);
                    }}
                  >
                    <BookOpen size={16} />
                    Enroll in Course
                  </button>
                )}
                <button
                  className={`btn btn-secondary ${isBookmarked(selectedCourse.id) ? 'active' : ''}`}
                  onClick={() => toggleBookmark(selectedCourse.id)}
                >
                  <BookmarkPlus size={16} />
                  {isBookmarked(selectedCourse.id) ? 'Bookmarked' : 'Bookmark'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learning;