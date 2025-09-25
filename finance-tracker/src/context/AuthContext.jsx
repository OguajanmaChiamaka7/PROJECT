
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
  const [loading, setLoading] = useState(true);

  // Track user login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        setCurrentUser({ ...user, ...userData });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
