# Firebase + Vercel Deployment Guide

This guide explains how to deploy HousesAdda with Firebase backend on Vercel.

## Architecture

- **Frontend**: React + Vite (deployed on Vercel)
- **Backend API**: Express.js serverless functions (deployed on Vercel)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication + JWT

## Prerequisites

1. Firebase account ([firebase.google.com](https://firebase.google.com))
2. Vercel account ([vercel.com](https://vercel.com))
3. Node.js 18+ installed locally

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "housesadda")
4. Enable Google Analytics (optional)
5. Create project

### 1.2 Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode" (we'll add rules later)
4. Select a location (choose closest to your users)
5. Click "Enable"

### 1.3 Set Up Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Copy the contents of `firestore.rules` from this project
3. Paste into the rules editor
4. Click "Publish"

### 1.4 Enable Firebase Authentication

1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

### 1.5 Get Service Account Key

1. Go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Save the JSON file securely (you'll need this for Vercel)

## Step 2: Local Development Setup

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Configure Environment Variables

Create `.env` file in the root directory:

```env
# Firebase Configuration (Frontend - Client SDK)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Configuration (Backend - Admin SDK)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Server Configuration
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
VITE_API_URL=http://localhost:3001/api
```

**Get Firebase config values:**
- Go to Firebase Console > Project Settings > Your apps > Web app
- Copy the config values

**Get Service Account:**
- Download `serviceAccountKey.json` from Firebase Console > Project Settings > Service Accounts
- Place it in the project root

### 2.3 Start Development Servers

```bash
# Start both frontend and backend
npm run dev:all

# Or separately:
npm run dev          # Frontend (port 8080)
npm run dev:server   # Backend (port 3001)
```

## Step 3: Vercel Deployment

### 3.1 Prepare for Deployment

1. **Build the project locally to test:**
   ```bash
   npm run build
   ```

2. **Verify the build output:**
   - Check that `dist/` folder contains the frontend build
   - Verify `api/index.js` exists for serverless functions

### 3.2 Deploy to Vercel

#### Option A: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm project settings
   - Deploy

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project settings (see below)

### 3.3 Configure Vercel Environment Variables

Go to Vercel Dashboard > Your Project > Settings > Environment Variables

Add these variables for **Production**, **Preview**, and **Development**:

#### Frontend Variables (VITE_*)
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_API_URL=/api
```

#### Backend Variables
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production
CORS_ORIGIN=https://your-domain.vercel.app
```

**Important:** For `FIREBASE_SERVICE_ACCOUNT`, you need to:
1. Open your `serviceAccountKey.json` file
2. Copy the entire JSON content
3. Paste it as a single-line string in Vercel (escape quotes if needed)
4. Or use individual variables (see .env.example)

### 3.4 Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**

Or push a new commit to trigger automatic redeploy.

## Step 4: Verify Deployment

### 4.1 Test API Endpoints

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Expected response:
{
  "status": "ok",
  "message": "Server is running",
  "database": "Firebase Firestore",
  "configured": "yes"
}
```

### 4.2 Test Frontend

1. Visit your Vercel domain
2. Check browser console for errors
3. Test property listing
4. Test admin login

### 4.3 Create Admin User

1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Enter email and password
4. Use these credentials to login to admin panel

## Step 5: Post-Deployment

### 5.1 Set Up Custom Domain (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed

### 5.2 Monitor Logs

- **Vercel Dashboard** > **Deployments** > Click deployment > **Functions** tab
- Check function logs for errors
- Monitor Firebase Console for database activity

### 5.3 Set Up Monitoring

- Enable Firebase Analytics
- Set up Vercel Analytics
- Configure error tracking (Sentry, etc.)

## Troubleshooting

### API Returns 404

- Check that `api/index.js` exists
- Verify `vercel.json` configuration
- Check Vercel function logs

### Database Connection Errors

- Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly in Vercel
- Check Firebase Console > Firestore Database is enabled
- Verify service account has proper permissions

### CORS Errors

- Add your Vercel domain to `CORS_ORIGIN` environment variable
- Or set `CORS_ORIGIN=true` to allow all origins (less secure)

### Authentication Not Working

- Verify Firebase Authentication is enabled
- Check `VITE_FIREBASE_*` variables are set in Vercel
- Check browser console for Firebase errors

## Project Structure

```
.
├── api/
│   └── index.js              # Vercel serverless function entry point
├── server/
│   ├── app.js                # Express app (shared for local/serverless)
│   ├── index-firebase.js     # Local server entry point
│   ├── db-firebase.js        # Firebase Firestore connection
│   ├── routes/               # API routes
│   └── middleware/           # Auth middleware
├── src/                      # React frontend
├── vercel.json               # Vercel configuration
└── firestore.rules           # Firestore security rules
```

## Environment Variables Reference

See `.env.example` for all available environment variables.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Express.js Documentation](https://expressjs.com/)
