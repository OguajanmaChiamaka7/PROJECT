import React, { useState } from "react";
import { PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { checkProfileCompleted } from "../services/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { saveUserProfile } from "../services/saveUserProfile";
import "../styles/SignUp.css"; // make sure styles exist

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    setLoading(false);
    return;
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters long");
    setLoading(false);
    return;
  }

  try {
    if (formData.username && formData.email && formData.password) {
      // ✅ Create the Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 👉 Save basic user profile in Firestore (profileCompleted starts as false)
      await saveUserProfile(user.uid, {
        username: formData.username,
        email: formData.email,
        profileCompleted: false,
        createdAt: new Date(),
      });

      // 🚀 Immediately go to Profile Setup (don’t check completion here yet)
      navigate("/profile-setup");
    } else {
      setError("Please fill in all required fields");
    }
  } catch (err) {
    console.error("Signup error:", err.message);
    if (err.code === "auth/email-already-in-use") {
      setError("This email is already registered. Please log in.");
    } else {
      setError(err.message || "Registration failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
          <div className="signup-container">

      <div className="signup-card">
        <div className="holder">
        <div className="signup-header">
          <div className="logo-icon">
            <PiggyBank className="icon" />
          </div>
          <p className="catchphrase">Your smarter way to track finance</p>
        </div>

        
        <form className="signup-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {/* Username */}
          <div className="form-group input-icon">
            <FaUser className="icon" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="form-group input-icon">
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="form-group input-icon">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="toggle-visibility"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="form-group input-icon">
            <FaLock className="icon" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <span
              className="toggle-visibility"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" disabled={loading} className="signup-button">
            {loading ? "Creating account..." : "Create account"}
            </button>
            
            <p className="login-link">
              Already have an account? <a href="/login">Log in</a>
            </p>

          </form>
          </div>
      </div>
    </div>
  );
};

export default SignUp;
