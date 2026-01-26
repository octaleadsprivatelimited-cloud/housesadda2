# Debug Login Issue: "Username and password required"

## Problem
Still getting "username and password required" error even though code uses email/password with Firebase Auth.

## Steps to Debug

### 1. **RESTART THE SERVER** (Most Important!)
The error suggests old code is still running. You MUST restart:

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev:server
```

### 2. Check Server Console
When you try to login, look for these logs in the server console:

**Expected logs:**
```
🔐 Login request received: { method: 'POST', url: '/login', ... }
🔐 Login attempt received: { hasIdToken: true, idTokenLength: 800+, ... }
✅ Firebase Auth ID token verified: { uid: '...', email: '...' }
✅ Login successful for Firebase Auth user: housesaddadigital@gmail.com
```

**If you see:**
- "Username and password are required" → Server is using OLD code
- No logs at all → Request not reaching server
- "Missing required fields" → idToken not being sent

### 3. Check Browser Console
When you login, check browser console for:

**Expected logs:**
```
🔐 Attempting login with: { email: 'housesaddadigital@gmail.com', hasPassword: true }
📦 Firebase Auth result: { success: true, ... }
🎫 Got ID token from Firebase Auth: { hasToken: true, tokenLength: 800+ }
📤 Sending ID token to backend...
📤 API: Sending login request with idToken: { hasIdToken: true, ... }
```

**If you see:**
- "Username and password required" → Check where this error is coming from
- Network error → Server not running
- Firebase Auth error → Check credentials

### 4. Verify Server is Using Firebase Route
Check `package.json`:
```json
"dev:server": "node server/index-firebase.js"
```

Check `server/index-firebase.js` imports:
```javascript
import authRoutes from './routes/auth-firebase.js';
```

### 5. Clear Browser Cache
1. Hard refresh: `Ctrl + Shift + R`
2. Or use Incognito/Private window
3. Clear browser cache completely

### 6. Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Find the `/api/auth/login` request
5. Check:
   - **Request Payload**: Should have `{"idToken":"..."}`
   - **Response**: What error message is returned?
   - **Status Code**: 400, 401, or 500?

### 7. Verify Firebase Auth User Exists
1. Go to Firebase Console
2. Authentication → Users
3. Check if `housesaddadigital@gmail.com` exists
4. If not, create it with password `Housesadda@2026`

### 8. Test Direct API Call
Test the backend directly:

```bash
# First, get an ID token (you'll need to login via frontend to get this)
# Then test:
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"YOUR_ID_TOKEN_HERE"}'
```

## Common Issues

### Issue 1: Server Not Restarted
**Symptom**: Error message doesn't match current code
**Fix**: Restart server with `npm run dev:server`

### Issue 2: Old Code Cached
**Symptom**: Browser showing old error messages
**Fix**: Hard refresh (Ctrl+Shift+R) or clear cache

### Issue 3: Wrong Server Running
**Symptom**: Different port or no logs
**Fix**: Check which server is running, kill old processes

### Issue 4: idToken Not Being Sent
**Symptom**: Backend logs show `hasIdToken: false`
**Fix**: Check Firebase Auth is working, check browser console logs

### Issue 5: Request Not Reaching Backend
**Symptom**: No server logs at all
**Fix**: Check server is running, check API URL in frontend

## Quick Fix Checklist

- [ ] Server restarted with `npm run dev:server`
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Check server console for logs when logging in
- [ ] Check browser console for logs
- [ ] Verify Firebase Auth user exists
- [ ] Check Network tab for actual request/response
- [ ] Verify `package.json` points to `index-firebase.js`

## Expected Flow

1. User enters email/password
2. Frontend calls `authService.signIn(email, password)` → Firebase Auth
3. Firebase Auth returns user + ID token
4. Frontend sends ID token to backend: `authAPI.loginWithFirebase(idToken)`
5. Backend verifies ID token with Firebase Admin SDK
6. Backend returns session JWT token
7. Frontend stores token and redirects

If any step fails, check the logs to see where it's failing.
