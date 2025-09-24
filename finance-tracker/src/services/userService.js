import { auth, db } from './firebase';
import {
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

export class UserService {
  // Get current user profile with complete data
  static async getCurrentUserProfile() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
        createdAt: currentUser.metadata.creationTime,
        lastSignIn: currentUser.metadata.lastSignInTime,
        ...userData
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile with validation
  static async updateUserProfile(profileData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Validate required fields
      if (!profileData.firstName || !profileData.lastName) {
        throw new Error('First name and last name are required');
      }

      // Update Firebase Auth profile if displayName changed
      if (profileData.displayName && profileData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: profileData.displayName
        });
      }

      // Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        displayName: profileData.displayName?.trim() || `${profileData.firstName} ${profileData.lastName}`,
        phone: profileData.phone?.trim() || '',
        bio: profileData.bio?.trim() || '',
        currency: profileData.currency || 'USD',
        timezone: profileData.timezone || 'UTC',
        savingsGoal: parseFloat(profileData.savingsGoal) || 0,
        monthlyBudget: parseFloat(profileData.monthlyBudget) || 0,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, updateData);
      return updateData;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Change user password with re-authentication
  static async changePassword(currentPassword, newPassword) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Validate new password
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error changing password:', error);

      // Map Firebase errors to user-friendly messages
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('New password is too weak');
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please log in again to change your password');
      }

      throw error;
    }
  }

  // Delete user account and all associated data
  static async deleteUserAccount(password) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Use batch to delete all user-related data
      const batch = writeBatch(db);
      const uid = currentUser.uid;

      // Delete user profile
      batch.delete(doc(db, 'users', uid));

      // Delete user's transactions
      const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', uid));
      const transactionsSnap = await getDocs(transactionsQuery);
      transactionsSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's goals
      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', uid));
      const goalsSnap = await getDocs(goalsQuery);
      goalsSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's badges
      const badgesQuery = query(collection(db, 'userBadges'), where('userId', '==', uid));
      const badgesSnap = await getDocs(badgesQuery);
      badgesSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's daily tasks
      const tasksQuery = query(collection(db, 'dailyTasks'), where('userId', '==', uid));
      const tasksSnap = await getDocs(tasksQuery);
      tasksSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's notifications
      const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', uid));
      const notificationsSnap = await getDocs(notificationsQuery);
      notificationsSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Commit batch delete
      await batch.commit();

      // Finally, delete the user account
      await deleteUser(currentUser);

      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Error deleting account:', error);

      // Map Firebase errors to user-friendly messages
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please log in again to delete your account');
      }

      throw error;
    }
  }

  // Get user statistics
  static async getUserStatistics(uid) {
    try {
      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();

      // Get transaction count
      const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', uid));
      const transactionsSnap = await getDocs(transactionsQuery);

      // Get goals count
      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', uid));
      const goalsSnap = await getDocs(goalsQuery);

      // Get badges count
      const badgesQuery = query(collection(db, 'userBadges'), where('userId', '==', uid));
      const badgesSnap = await getDocs(badgesQuery);

      return {
        level: userData.level || 1,
        xp: userData.xp || 0,
        balance: userData.balance || 0,
        streak: userData.streak || 0,
        transactionCount: transactionsSnap.docs.length,
        goalsCount: goalsSnap.docs.length,
        badgesCount: badgesSnap.docs.length,
        joinDate: userData.createdAt,
        profileCompleted: userData.profileCompleted || false
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Check if user profile is complete
  static async isProfileComplete(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        return false;
      }

      const userData = userDoc.data();
      return userData.profileCompleted === true &&
             userData.firstName &&
             userData.lastName;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  }

  // Update user's gamification data (XP, level, etc.)
  static async updateUserGamification(uid, updates) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user gamification:', error);
      throw error;
    }
  }
}