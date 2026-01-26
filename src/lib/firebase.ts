// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Configuration loaded from environment variables (.env file) with fallback values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAQTwwsDTA3s72bDQFosaaa4_a800RGoDA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "housesadda-e756b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "housesadda-e756b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "housesadda-e756b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "582253970051",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:582253970051:web:81ba24ff69cb2050f691b6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5KLS1DBVB3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };
export default app;
