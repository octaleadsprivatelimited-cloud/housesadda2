# Setup Guide

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   VITE_API_URL=http://localhost:3001/api
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

3. **Start servers:**
   ```bash
   npm run dev:all
   ```

4. **Access:**
   - Frontend: http://localhost:8080
   - Backend: http://localhost:3001
   - Admin: http://localhost:8080/admin (admin/admin123)

## Vercel Deployment

1. Push to GitHub
2. Import in Vercel
3. Add all environment variables
4. Deploy!
