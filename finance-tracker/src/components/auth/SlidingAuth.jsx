import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import { LoginForm, SignUpForm } from './AuthForm';
import '../../styles/sliding-auth.css';

const SlidingAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [loading, setLoading] = useState(false);

  // Update state when URL changes
  useEffect(() => {
    setIsSignUp(location.pathname === '/signup');
  }, [location.pathname]);

  const toggleMode = (showSignUp) => {
    if (loading) return; // Prevent toggle during loading
    setIsSignUp(showSignUp);

    // Update URL without causing a page reload
    const newPath = showSignUp ? '/signup' : '/login';
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  };

  const handleSuccess = () => {
    setLoading(false);
  };

  return (
    <div className="sliding-auth-container">
      <div className={`sliding-auth-wrapper ${isSignUp ? 'signup-mode' : 'login-mode'}`}>

        {/* Forms Container */}
        <div className="forms-container">
          {/* Login Form - Always visible on left */}
          <div className="form-container login-container">
            <LoginForm
              onSuccess={handleSuccess}
              loading={loading}
              setLoading={setLoading}
            />
          </div>

          {/* Sign Up Form - Always visible on right */}
          <div className="form-container signup-container">
            <SignUpForm
              onSuccess={handleSuccess}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </div>

        {/* Sliding Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Left Overlay Panel (visible when in signup mode) */}
            <div className="overlay-panel overlay-left">
              <div className="overlay-content">
                <div className="logo-section">
                  <div className="logo-icon">
                    <PiggyBank />
                  </div>
                  <h1>Finance Tracker</h1>
                </div>
                <div className="welcome-section">
                  <h2>Welcome Back!</h2>
                  <p>To keep connected with us please login with your personal info</p>
                </div>
                <button
                  className="overlay-btn"
                  onClick={() => toggleMode(false)}
                  disabled={loading}
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Right Overlay Panel (visible when in login mode) */}
            <div className="overlay-panel overlay-right">
              <div className="overlay-content">
                <div className="logo-section">
                  <div className="logo-icon">
                    <PiggyBank />
                  </div>
                  <h1>Finance Tracker</h1>
                </div>
                <div className="welcome-section">
                  <h2>Hello, Friend!</h2>
                  <p>Enter your personal details and start your journey with us</p>
                </div>
                <button
                  className="overlay-btn"
                  onClick={() => toggleMode(true)}
                  disabled={loading}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Toggle */}
      <div className="mobile-toggle">
        <div className="toggle-buttons">
          <button
            className={`toggle-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => toggleMode(false)}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            className={`toggle-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => toggleMode(true)}
            disabled={loading}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlidingAuth;