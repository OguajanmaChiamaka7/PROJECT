
// import React, { createContext, useContext, useState } from 'react';

// const AuthContext = createContext();

// export { AuthContext };

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Placeholder functions for now
//   const login = async (email, password) => {
//     console.log('Login called:', email);
//     // Add your login logic here later
//   };

//   const signup = async (email, password, displayName) => {
//     console.log('Signup called:', email);
//     // Add your signup logic here later
//   };

//   const logout = async () => {
//     console.log('Logout called');
//     setCurrentUser(null);
//   };

//   const value = {
//     currentUser,
//     login,
//     signup,
//     logout,
//     loading
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export default AuthContext;


// import React, { createContext, useContext, useState, useEffect } from "react";
// import { auth } from "../services/firebase"; // ✅ make sure this points to your firebase.js
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
//   updateProfile,
// } from "firebase/auth";

// const AuthContext = createContext();

// export { AuthContext };

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }

// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ✅ Signup
//   const signup = async (email, password, displayName) => {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // optional: set display name
//     if (displayName) {
//       await updateProfile(user, { displayName });
//     }

//     setCurrentUser(user);
//     return user;
//   };

//   // ✅ Login
//   const login = (email, password) => {
//     return signInWithEmailAndPassword(auth, email, password);
//   };

//   // ✅ Logout
//   const logout = () => {
//     return signOut(auth);
//   };

//   // ✅ Track logged in user
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setCurrentUser(user || null);
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, []);

//   const value = {
//     currentUser,
//     signup,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }

// export default AuthContext;

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { signup, login, logout } from "../services/auth";
import { getUserProfile } from "../services/firestore";

const AuthContext = createContext();

export { AuthContext };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile data
  const loadUserProfile = async (uid) => {
    try {
      const profile = await getUserProfile(uid);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error("Error loading user profile:", error);
      return null;
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (currentUser?.uid) {
      await loadUserProfile(currentUser.uid);
    }
  };

  // Track user login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          // Load comprehensive user profile
          const profile = await loadUserProfile(user.uid);
          setCurrentUser({
            ...user,
            ...profile,
            // Ensure we have proper defaults
            balance: profile?.balance || 5000,
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            streak: profile?.streak || 0
          });
        } catch (error) {
          console.error("Error loading user data:", error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    refreshUserData,
    loadUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
