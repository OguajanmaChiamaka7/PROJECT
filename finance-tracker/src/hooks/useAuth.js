// src/hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * A custom hook to access the current authentication context.
 * Returns the logged-in user and any additional auth-related state.
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context; // returns { user }
};

export default useAuth;
