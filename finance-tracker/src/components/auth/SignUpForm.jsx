// SignUpForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from './authService';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const result = await signUp(formData.email, formData.password, formData.displayName);
    
    if (result.success) {
      // Redirect to dashboard after successful signup
      navigate('/dashboard');
    } else {
      setErrors({ submit: result.error });
    }
    
    setLoading(false);
  };

  const styles = {
    container: {
      maxWidth: '400px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      textAlign: 'center',
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#333'
    },
    subtitle: {
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '2rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.15s',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    error: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.25rem'
    },
    submitError: {
      color: '#ef4444',
      fontSize: '0.875rem',
      textAlign: 'center',
      padding: '0.75rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '6px',
      marginBottom: '1rem'
    },
    button: {
      padding: '0.75rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
      marginTop: '1rem'
    },
    buttonHover: {
      backgroundColor: '#059669'
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    link: {
      textAlign: 'center',
      marginTop: '1rem'
    },
    linkText: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontSize: '0.875rem'
    },
    featuresBox: {
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    featuresTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    featuresList: {
      fontSize: '0.75rem',
      color: '#6b7280',
      lineHeight: '1.4'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Join Gamified Finance!</h2>
      <p style={styles.subtitle}>Start your journey to better financial habits</p>
      
      {errors.submit && (
        <div style={styles.submitError}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.displayName ? styles.inputError : {})
            }}
            placeholder="Enter your full name"
            disabled={loading}
          />
          {errors.displayName && <span style={styles.error}>{errors.displayName}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.email ? styles.inputError : {})
            }}
            placeholder="Enter your email"
            disabled={loading}
          />
          {errors.email && <span style={styles.error}>{errors.email}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.password ? styles.inputError : {})
            }}
            placeholder="Create a password (min. 6 characters)"
            disabled={loading}
          />
          {errors.password && <span style={styles.error}>{errors.password}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.confirmPassword ? styles.inputError : {})
            }}
            placeholder="Confirm your password"
            disabled={loading}
          />
          {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {})
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = styles.button.backgroundColor;
            }
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div style={styles.featuresBox}>
        <div style={styles.featuresTitle}>🎮 What you'll get:</div>
        <div style={styles.featuresList}>
          • Start with ₦5,000 virtual wallet<br/>
          • Earn points and badges for good habits<br/>
          • Track expenses and savings goals<br/>
          • Level up your financial skills
        </div>
      </div>

      <div style={styles.link}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Already have an account?{' '}
        </span>
        <a href="/login" style={styles.linkText}>Sign in</a>
      </div>
    </div>
  );
};

export default SignUpForm;