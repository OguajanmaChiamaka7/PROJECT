// services/firestore.js
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const saveUserProfile = async (uid, data) => {
  try {
    await setDoc(
      doc(db, "users", uid),
      data,   // <-- save data directly, no extra wrapping
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
};

export const checkProfileCompleted = async (uid) => {
  try {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);
    return snapshot.exists() && snapshot.data().profileCompleted === true;
  } catch (error) {
    console.error("Error checking profile:", error);
    return false;
  }
};
