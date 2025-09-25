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
export const signup = async (username, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // set displayName in Firebase Auth
  await updateProfile(user, { displayName: username });

  // Save user info in Firestore
  await setDoc(doc(db, "users", user.uid), {
    username,
    email,
  });

  return { ...user, username };
};

/**
 * Login user with email + password
 */
export const login = async (email, password) => {
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
