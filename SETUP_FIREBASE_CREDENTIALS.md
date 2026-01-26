# Quick Setup: Firebase Admin SDK Credentials

## Problem
You're getting a 500 error when trying to login because Firebase Admin SDK needs proper credentials to verify ID tokens.

## Quick Fix (5 minutes)

### Step 1: Download Service Account Key
1. Go to: https://console.firebase.google.com/project/housesadda-e756b/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the confirmation dialog
4. A JSON file will download (e.g., `housesadda-e756b-firebase-adminsdk-xxxxx.json`)

### Step 2: Save the File
1. Rename the downloaded file to: `serviceAccountKey.json`
2. Move it to your project root directory:
   ```
   houses-adda6-main/
   └── serviceAccountKey.json
   ```

### Step 3: Update .env File
Add this line to your `.env` file:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Step 4: Restart Server
Stop the current server (Ctrl+C) and restart:
```bash
npm run dev:all
```

## Verify It Works
After restarting, you should see in the server logs:
```
✅ Connected to Firebase Firestore
🚀 Server running on http://localhost:3001
```

Then try logging in again - it should work!

## Alternative: Use Environment Variables
If you prefer not to use a file, extract these values from the JSON:
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the \n characters)
- `client_email` → `FIREBASE_CLIENT_EMAIL`

Add to `.env`:
```env
FIREBASE_PROJECT_ID=housesadda-e756b
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@housesadda-e756b.iam.gserviceaccount.com
```

## Security Note
⚠️ **NEVER commit `serviceAccountKey.json` to Git!**
- It's already in `.gitignore`
- This file has full admin access to your Firebase project
