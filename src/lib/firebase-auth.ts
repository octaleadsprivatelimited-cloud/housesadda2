import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from "firebase/auth";
import { auth } from "./firebase";

// Auth service functions
export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Send password reset email
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: "No user signed in",
        };
      }
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Reauthenticate user (required before sensitive operations)
  reauthenticate: async (password: string) => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return {
          success: false,
          error: "No user signed in",
        };
      }
      
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default authService;
