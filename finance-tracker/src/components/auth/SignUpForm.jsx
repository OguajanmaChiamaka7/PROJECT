// This file is deprecated - use the unified SignUp component instead
import React from 'react';
import SignUp from './SignUp';

const SignUpForm = (props) => {
  console.warn('SignUpForm is deprecated. Please use the SignUp component from ./SignUp instead.');
  return <SignUp {...props} />;
};

export default SignUpForm;