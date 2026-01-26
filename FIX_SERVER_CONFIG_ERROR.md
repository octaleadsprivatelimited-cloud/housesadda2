# Fix: Server Configuration Error in Admin Login

## Problem
Getting "Server configuration error" or "Service unavailable" when trying to login to admin panel.

## Root Cause
Firebase Admin SDK is not being initialized properly when the server starts, even though the service account key is configured.

## Solution

### Step 1: Verify Service Account Key

1. Check that `serviceAccountKey.json` exists in project root:
   ```bash
   ls serviceAccountKey.json
   # or on Windows:
   dir serviceAccountKey.json
   ```

2. Check `.env` file has:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

### Step 2: Restart the Server

**IMPORTANT:** You must restart the server after making changes:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev:server
```

### Step 3: Verify Server is Running

Check the server console output. You should see:
```
✅ Firebase Firestore initialized
✅ Connected to Firebase Firestore
🚀 Server running on http://localhost:3001
```

If you see warnings like:
```
⚠️  Database initialization failed
⚠️  Add FIREBASE_SERVICE_ACCOUNT_PATH to .env
```

Then the service account key is not being found.

### Step 4: Test the Connection

Run the test script:
```bash
node test-firebase-connection.js
```

You should see:
```
🎉 Firebase is FULLY CONNECTED!
```

### Step 5: Test Server Endpoints

Run the server auth test:
```bash
node test-server-auth.js
```

Check that `/api/health` shows:
```json
{
  "configured": "yes",
  "database": "Firebase Firestore"
}
```

## Common Issues

### Issue 1: Service Account File Not Found

**Symptom:** Server shows "Database initialization failed"

**Solution:**
1. Verify the file path in `.env` is correct
2. Use relative path: `./serviceAccountKey.json` (from project root)
3. Make sure the file is in the project root directory

### Issue 2: Server Not Restarted

**Symptom:** Changes to `.env` not taking effect

**Solution:**
- Always restart the server after changing `.env` file
- Stop server (Ctrl+C) and start again (`npm run dev:server`)

### Issue 3: Wrong File Path

**Symptom:** File exists but server can't find it

**Solution:**
- Check the path in `.env` matches the actual file location
- Use forward slashes: `./serviceAccountKey.json`
- Don't use backslashes: `.\serviceAccountKey.json` ❌

### Issue 4: Port Already in Use

**Symptom:** Server won't start

**Solution:**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## Verification Checklist

- [ ] `serviceAccountKey.json` exists in project root
- [ ] `.env` file has `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json`
- [ ] Server restarted after changes
- [ ] Server console shows "✅ Firebase Firestore initialized"
- [ ] `/api/health` endpoint shows `"configured": "yes"`
- [ ] `test-firebase-connection.js` shows "FULLY CONNECTED"

## Still Having Issues?

1. **Check server logs** when you try to login
2. **Check browser console** for error messages
3. **Check Network tab** in browser DevTools to see the actual API response
4. **Verify Firebase project** is correct in `.env` file

## Quick Test

After fixing, test login:
1. Start server: `npm run dev:server`
2. Start frontend: `npm run dev`
3. Go to: `http://localhost:8080/admin`
4. Try to login with your Firebase Auth credentials

If you still get "Server configuration error", check the server console logs for specific error messages.
