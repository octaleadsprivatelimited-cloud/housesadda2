# Debug 400 Bad Request Error

## Issue
Getting "Failed to load resource: the server responded with a status of 400 (Bad Request)" error.

## Debugging Steps

### 1. Check Browser Console
When you try to login, check the browser console (F12) for:
- `🔐 Attempting login with:` - Shows email being used
- `📦 Firebase Auth result:` - Shows if Firebase Auth succeeded
- `🎫 Got ID token from Firebase:` - Shows if ID token was received
- `📤 Sending ID token to backend...` - Shows request is being sent
- `📤 API: Preparing login request:` - Shows request details
- Any error messages

### 2. Check Server Console
When you try to login, check the server console for:
- `🔐 Login request received:` - Shows what the server received
- `✅ ID token received, length: XXX` - Shows token was received
- `❌ Missing or invalid ID token:` - Shows if token is missing
- Any error messages

### 3. Check Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Find the `/api/auth/login` request
5. Check:
   - **Request Method**: Should be `POST`
   - **Request Payload**: Should have `{"idToken":"..."}`
   - **Status Code**: 400
   - **Response**: What error message is returned?

### 4. Common Causes

#### Cause 1: ID Token Not Being Sent
**Symptoms:**
- Server logs show: `hasIdToken: false`
- Browser logs show ID token was received

**Fix:**
- Check if `authAPI.loginWithFirebase(idToken)` is being called
- Verify `idToken` is not null/undefined

#### Cause 2: Request Body Not Parsed
**Symptoms:**
- Server logs show: `bodyType: undefined` or `no body`

**Fix:**
- Check server middleware: `app.use(express.json())`
- Verify Content-Type header: `application/json`

#### Cause 3: ID Token is Empty String
**Symptoms:**
- Server logs show: `idTokenLength: 0`

**Fix:**
- Check Firebase Auth is working
- Verify `getIdToken()` is returning a valid token

#### Cause 4: Wrong Endpoint
**Symptoms:**
- Network tab shows request going to wrong URL

**Fix:**
- Check `VITE_API_URL` in `.env`
- Should be: `http://localhost:3001/api`

## Quick Fixes

### Fix 1: Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev:server
```

### Fix 2: Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R`
- Or use Incognito window

### Fix 3: Check Environment Variables
Verify `.env` file has:
```env
VITE_API_URL=http://localhost:3001/api
```

### Fix 4: Verify Server is Running
Visit: http://localhost:3001/api/health
Should return: `{"status":"ok",...}`

## Expected Flow

1. **Frontend**: User enters email/password
2. **Frontend**: Calls `authService.signIn()` → Firebase Auth
3. **Frontend**: Gets ID token from Firebase Auth
4. **Frontend**: Sends ID token to backend: `POST /api/auth/login` with `{"idToken":"..."}`
5. **Backend**: Receives request, validates ID token
6. **Backend**: Verifies token with Firebase Admin SDK
7. **Backend**: Returns session JWT token
8. **Frontend**: Stores token and redirects

## What to Check

### In Browser Console:
```
🔐 Attempting login with: { email: '...', hasPassword: true }
📦 Firebase Auth result: { success: true, ... }
🎫 Got ID token from Firebase: { hasToken: true, tokenLength: 800+ }
📤 Sending ID token to backend...
📤 API: Preparing login request: { hasIdToken: true, ... }
```

### In Server Console:
```
🔐 Login request received: { bodyHasIdToken: 'yes', bodyIdTokenLength: 800+ }
✅ ID token received, length: 800+
✅ Firebase Auth ID token verified: { uid: '...', email: '...' }
✅ Login successful for Firebase Auth user: ...
```

## If Still Getting 400 Error

1. **Check the exact error message** in Network tab → Response
2. **Check server logs** for what was received
3. **Check browser logs** for what was sent
4. **Compare** - see if there's a mismatch

The detailed logging I added will help identify exactly where the issue is!
