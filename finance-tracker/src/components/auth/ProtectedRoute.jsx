
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
//           </div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { checkProfileCompleted } from "../../services/firestore";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [profileComplete, setProfileComplete] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyProfile = async () => {
      if (currentUser) {
        const completed = await checkProfileCompleted(currentUser.uid);
        setProfileComplete(completed);
      }
      setChecking(false);
    };
    verifyProfile();
  }, [currentUser]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 🚫 Not logged in → go to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 🚧 Logged in but profile not complete → go to setup
  // (but don’t redirect if we’re already ON /profile-setup)
  if (!profileComplete && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  // ✅ All good → render the protected children
  return children;
};

export default ProtectedRoute;
