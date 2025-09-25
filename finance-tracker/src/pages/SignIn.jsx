import { PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/SignUp.css"; // reuse same styling

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  }); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

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

    try {
      if (formData.email && formData.password) {
        await login(formData.email, formData.password); // ✅ Call Firebase login
        navigate("/app");
      } else {
        setError("Please enter email and password");
      }
    } catch (err) {
      console.error("Login failed:", err);

      // Friendly error messages
      let errorMessage = "Login failed. Please try again.";
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
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
            <p className="catchphrase">Welcome back, manage smarter</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

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

            <button type="submit" disabled={loading} className="signup-button">
              {loading ? "Logging in..." : "Log in"}
            </button>

            <p className="login-link">
              Don’t have an account? <a href="/signup">Sign up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
