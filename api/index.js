// Vercel Serverless Function - Main API handler
// This wraps the Express app for Vercel deployment
import app from '../server/app.js';

// Export the Express app as a Vercel serverless function
// Vercel will handle routing /api/* requests to this function
export default app;
