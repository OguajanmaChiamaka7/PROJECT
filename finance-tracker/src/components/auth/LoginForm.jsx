// This file is deprecated - use the unified Login component instead
import React from 'react';
import Login from './Login';

const LoginForm = (props) => {
  console.warn('LoginForm is deprecated. Please use the Login component from ./Login instead.');
  return <Login {...props} />;
};

export default LoginForm;