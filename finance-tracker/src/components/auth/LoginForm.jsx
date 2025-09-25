// // LoginForm.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { signIn } from './authService';

// const LoginForm = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }

//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;

//     setLoading(true);
//     const result = await signIn(formData.email, formData.password);
    
//     if (result.success) {
//       // Redirect to dashboard after successful login
//       navigate('/dashboard');
//     } else {
//       setErrors({ submit: result.error });
//     }
    
//     setLoading(false);
//   };

//   const styles = {
//     container: {
//       maxWidth: '400px',
//       margin: '0 auto',
//       padding: '2rem',
//       backgroundColor: '#ffffff',
//       borderRadius: '12px',
//       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//       fontFamily: 'Arial, sans-serif'
//     },
//     title: {
//       textAlign: 'center',
//       fontSize: '2rem',
//       fontWeight: 'bold',
//       marginBottom: '2rem',
//       color: '#333'
//     },
//     form: {
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '1rem'
//     },
//     formGroup: {
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '0.5rem'
//     },
//     label: {
//       fontSize: '0.875rem',
//       fontWeight: '500',
//       color: '#374151'
//     },
//     input: {
//       padding: '0.75rem',
//       border: '1px solid #d1d5db',
//       borderRadius: '8px',
//       fontSize: '1rem',
//       transition: 'border-color 0.15s',
//       outline: 'none'
//     },
//     inputFocus: {
//       borderColor: '#3b82f6',
//       boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
//     },
//     inputError: {
//       borderColor: '#ef4444'
//     },
//     error: {
//       color: '#ef4444',
//       fontSize: '0.875rem',
//       marginTop: '0.25rem'
//     },
//     submitError: {
//       color: '#ef4444',
//       fontSize: '0.875rem',
//       textAlign: 'center',
//       padding: '0.75rem',
//       backgroundColor: '#fef2f2',
//       border: '1px solid #fecaca',
//       borderRadius: '6px',
//       marginBottom: '1rem'
//     },
//     button: {
//       padding: '0.75rem',
//       backgroundColor: '#3b82f6',
//       color: 'white',
//       border: 'none',
//       borderRadius: '8px',
//       fontSize: '1rem',
//       fontWeight: '500',
//       cursor: 'pointer',
//       transition: 'background-color 0.15s',
//       marginTop: '1rem'
//     },
//     buttonHover: {
//       backgroundColor: '#2563eb'
//     },
//     buttonDisabled: {
//       backgroundColor: '#9ca3af',
//       cursor: 'not-allowed'
//     },
//     link: {
//       textAlign: 'center',
//       marginTop: '1rem'
//     },
//     linkText: {
//       color: '#3b82f6',
//       textDecoration: 'none',
//       fontSize: '0.875rem'
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>Welcome Back!</h2>
      
//       {errors.submit && (
//         <div style={styles.submitError}>
//           {errors.submit}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} style={styles.form}>
//         <div style={styles.formGroup}>
//           <label style={styles.label}>Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             style={{
//               ...styles.input,
//               ...(errors.email ? styles.inputError : {})
//             }}
//             placeholder="Enter your email"
//             disabled={loading}
//           />
//           {errors.email && <span style={styles.error}>{errors.email}</span>}
//         </div>

//         <div style={styles.formGroup}>
//           <label style={styles.label}>Password</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             style={{
//               ...styles.input,
//               ...(errors.password ? styles.inputError : {})
//             }}
//             placeholder="Enter your password"
//             disabled={loading}
//           />
//           {errors.password && <span style={styles.error}>{errors.password}</span>}
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           style={{
//             ...styles.button,
//             ...(loading ? styles.buttonDisabled : {})
//           }}
//           onMouseEnter={(e) => {
//             if (!loading) {
//               e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
//             }
//           }}
//           onMouseLeave={(e) => {
//             if (!loading) {
//               e.target.style.backgroundColor = styles.button.backgroundColor;
//             }
//           }}
//         >
//           {loading ? 'Signing in...' : 'Sign In'}
//         </button>
//       </form>

//       <div style={styles.link}>
//         <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
//           Don't have an account?{' '}
//         </span>
//         <a href="/signup" style={styles.linkText}>Sign up</a>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;

// LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase'; // Correct import path

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Redirect to dashboard after successful login
      navigate('/app'); // Correct path based on your routing
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'An error occurred during sign in';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
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
      marginBottom: '2rem',
      color: '#333'
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
      backgroundColor: '#3b82f6',
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
      backgroundColor: '#2563eb'
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
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome Back!</h2>
      
      {errors.submit && (
        <div style={styles.submitError} role="alert">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            id="email"
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
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <span id="email-error" style={styles.error} role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.password ? styles.inputError : {})
            }}
            placeholder="Enter your password"
            disabled={loading}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            autoComplete="current-password"
          />
          {errors.password && (
            <span id="password-error" style={styles.error} role="alert">
              {errors.password}
            </span>
          )}
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={styles.link}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account?{' '}
        </span>
        <a href="/signup" style={styles.linkText}>Sign up</a>
      </div>
    </div>
  );
};

export default LoginForm;