import { useState } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import "../styles/AuthPage.css";

const AuthPage = () => {
  const [isRightPanel, setIsRightPanel] = useState(false);

  return (
    <div className={`auth-container ${isRightPanel ? "right-panel-active" : ""}`}>
      {/* Sign Up */}
      <div className="form-container sign-up-container">
        <SignUp />
      </div>

      {/* Sign In */}
      <div className="form-container sign-in-container">
        <SignIn />
      </div>

      {/* Overlay */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login</p>
            <button className="ghost" onClick={() => setIsRightPanel(false)}>
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your details and start your journey with us</p>
            <button className="ghost" onClick={() => setIsRightPanel(true)}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
