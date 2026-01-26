# Quick Fix: Backend Server Credentials

## Current Error
```
Error: Could not load the default credentials
```

## Quick Solution

### Option 1: Use Service Account JSON File (Recommended)

1. **Download service account key from Firebase:**
   - Go to: https://console.firebase.google.com/project/housesadda-e756b/settings/serviceaccounts/adminsdk
   - Click **Generate new private key**
   - Download the JSON file

2. **Save it in project root as:** `serviceAccountKey.json`

3. **Add to `.env` file:**
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

4. **Restart server:**
   ```bash
   npm run dev:server
   ```

### Option 2: Temporary Workaround (Development Only)

For now, you can modify `server/db-firebase.js` to skip initialization if credentials are missing, but this will prevent database operations.

**Not recommended** - Get the service account key instead.

## What You Need

The Firebase Admin SDK needs credentials to authenticate. You have two options:

1. **Service Account JSON File** (easiest)
   - Download from Firebase Console
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env`

2. **Environment Variables**
   - Extract `project_id`, `private_key`, `client_email` from JSON
   - Set in `.env` as `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`

## Next Steps

1. Get the service account key (see FIREBASE_CREDENTIALS_SETUP.md)
2. Update `.env` file
3. Restart server
4. Server should start successfully!
