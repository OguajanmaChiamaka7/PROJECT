

import React from 'react';

import { Routes, Route } from 'react-router-dom';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProfileSetup from "./pages/ProfileSetup";
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Badges from './components/gamification/Badges';
import Tasks from './components/dashboard/DailyTasks';
import SavingsCircle from './components/gamification/SavingCircle';

// For Navbar components
import Community from './components/NavComponents/Community';

// Import Firebase for testing
import { auth, db } from './services/firebase';
import ProgressBar from './components/dashboard/ProgressBar';

function App() {
  // Test Firebase connection
  React.useEffect(() => {
    console.log('🔥 Environment Variables Debug:', {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    });
    console.log('🔥 All env vars:', import.meta.env);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Temporary Firebase status indicator */}
      <div style={{ 
        position: 'fixed', 
        top: 'auto',
        bottom: '10px',
        right: '10px', 
        background: '#4CAF50', 
        color: 'white', 
        padding: '8px 12px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        🔥 Firebase: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Connected' : 'Not Connected'}
      </div>
      
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* Profile Setup (after signup, before dashboard) */}
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="goals" element={<Goals />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="badges" element={<Badges />} />
          <Route path="savings" element={<SavingsCircle />} />
          <Route path='tasks' element={<Tasks />} />
          <Route path='progress' element={<ProgressBar />} />
          <Route path='community' element={<Community />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;