import React from 'react';
import { PiggyBank } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, showFeatures = false }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <PiggyBank className="logo-icon" />
          </div>
          <h1 className="auth-title">Finance Tracker</h1>
          <h2 className="auth-subtitle">{title}</h2>
          {subtitle && <p className="auth-description">{subtitle}</p>}
        </div>

        <div className="auth-content">
          {children}
        </div>

        {showFeatures && (
          <div className="auth-features">
            <div className="features-title">🎮 What you'll get:</div>
            <div className="features-list">
              • Start with ₦5,000 virtual wallet<br/>
              • Earn points and badges for good habits<br/>
              • Track expenses and savings goals<br/>
              • Level up your financial skills
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;