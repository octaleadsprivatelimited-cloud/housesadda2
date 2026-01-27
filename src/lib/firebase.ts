// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCyFGUxTk4ku6bXbnxodxBrwEKuQZb9BlQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "housesadda-6818b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "housesadda-6818b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "housesadda-6818b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "402570906755",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:402570906755:web:e119b02e2c731988f79fb6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-M0GCBYCSFR"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

// Initialize Analytics (only in browser, fail silently)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (analyticsError) {
    // Analytics initialization failed - not critical
    analytics = null;
  }
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };
export default app;
