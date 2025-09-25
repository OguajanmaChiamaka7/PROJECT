// src/firebase/saveUserProfile.js

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // make sure db is exported from your firebaseConfig.js

/**
 * Save user profile details to Firestore
 * @param {string} uid - The Firebase Auth user ID
 * @param {object} data - Extra profile data (e.g., fullName, username, etc.)
 */
export const saveUserProfile = async (uid, data) => {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
    console.log("✅ User profile saved!");
  } catch (error) {
    console.error("❌ Error saving profile:", error);
    throw error;
  }
};

/**
 * Check if a user has completed their profile
 * @param {string} uid - The Firebase Auth user ID
 */
export const checkProfileCompleted = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null; // profile not found
    }
  } catch (error) {
    console.error("❌ Error checking profile:", error);
    throw error;
  }
};
