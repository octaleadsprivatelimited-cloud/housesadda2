// Vercel serverless function handler
import app from '../server/app.js';

// Export as default handler for Vercel
export default (req, res) => {
  return app(req, res);
};
