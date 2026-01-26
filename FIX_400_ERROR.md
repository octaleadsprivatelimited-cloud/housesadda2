# Fix 400 Bad Request: "Username and password are required"

## Problem
The error "Username and password are required" is coming from the backend, but the frontend is correctly sending `idToken`. This means **the server is running old code**.

## Solution: RESTART THE SERVER

The server MUST be restarted to load the new Firebase auth code.

### Steps:

1. **Stop the current server:**
   - Find the terminal where the server is running
   - Press `Ctrl + C` to stop it
   - Wait for it to fully stop

2. **Start the server again:**
   ```bash
   npm run dev:server
   ```

3. **Verify the server is using Firebase routes:**
   When the server starts, you should see:
   ```
   🚀 Server running on http://localhost:3001
   📦 Using Firebase Firestore database
   🔗 Firebase Project: housesadda-e756b
   ✅ Routes registered: /api/auth, /api/properties, /api/locations, /api/types
   ```

4. **Check server logs when you login:**
   You should see:
   ```
   🔐 Login request received: { bodyHasIdToken: 'yes', bodyIdTokenLength: 948, ... }
   ✅ ID token received, length: 948
   ✅ Firebase Auth ID token verified: { uid: '...', email: '...' }
   ✅ Login successful for Firebase Auth user: housesaddadigital@gmail.com
   ```

   **NOT:**
   ```
   ❌ Username and password are required
   ```

## Why This Happens

The error "Username and password are required" is from **old code** that expected username/password. The new Firebase auth code expects `idToken`, but the server hasn't been restarted to load the new code.

## Verification

After restarting, when you try to login:

### Browser Console Should Show:
```
🎫 Got ID token from Firebase: {hasToken: true, tokenLength: 948, ...}
📤 Sending ID token to backend...
🌐 API Request: {url: 'http://localhost:3001/api/auth/login', method: 'POST', ...}
📥 API Response: {status: 200, ok: true}
✅ Backend login successful
```

### Server Console Should Show:
```
🔐 Login request received: { bodyHasIdToken: 'yes', bodyIdTokenLength: 948, ... }
✅ ID token received, length: 948
✅ Firebase Auth ID token verified: { uid: '...', email: '...' }
✅ Login successful for Firebase Auth user: housesaddadigital@gmail.com
```

## If Still Getting 400 After Restart

1. **Check server console** - Look for the `🔐 Login request received:` log
2. **Check what it shows:**
   - If `bodyHasIdToken: 'no'` → Request body not being parsed
   - If `bodyHasIdToken: 'yes'` but still 400 → Check the error message

3. **Verify the route file:**
   - Make sure `server/routes/auth-firebase.js` exists
   - Make sure `server/index-firebase.js` imports it

4. **Check package.json:**
   ```json
   "dev:server": "node server/index-firebase.js"
   ```

## Quick Test

After restarting, test the health endpoint:
```
http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "Firebase Firestore",
  "configured": "yes"
}
```

If this works, the server is running. Then try login again.

## Summary

**The issue is: Server is running old code**

**The fix is: Restart the server with `npm run dev:server`**

After restarting, the login should work! 🎉
