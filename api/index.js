// Vercel serverless function handler
import app from '../server/app.js';
import { initializeFirebase } from '../server/db-firebase.js';

// Ensure Firebase is initialized when serverless function starts
// This runs once per serverless instance
if (!process.env.VERCEL || process.env.VERCEL === '1') {
  // Only initialize in Vercel environment
  try {
    initializeFirebase();
  } catch (error) {
    console.error('❌ Failed to initialize Firebase in serverless function:', error);
  }
}

// Export Express app directly for Vercel
export default app;
