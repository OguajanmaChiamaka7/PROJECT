import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Signup new user
 */
export const signup = async (email, password, displayName) => {
  console.log('Signup called with:', { email, password: '***', displayName });

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // set displayName in Firebase Auth
  if (displayName) {
    await updateProfile(user, { displayName });
  }

  // Save user info in Firestore
  await setDoc(doc(db, "users", user.uid), {
    displayName: displayName || '',
    email,
    profileCompleted: false,
    createdAt: new Date().toISOString(),
    level: 1,
    xp: 0,
    balance: 5000, // Starting virtual balance
    streak: 0
  });

  return { ...user, displayName };
};

/**
 * Login user with email + password
 */
export const login = async (email, password) => {
  console.log('Login called with:', { email, password: '***' });

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Fetch extra info from Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};

  return { ...user, ...userData };
};

/**
 * Logout user
 */
export const logout = () => {
  return signOut(auth);
};
