# Troubleshooting: Cannot GET /api/auth/list-users

## Issue
Getting "Cannot GET /api/auth/list-users" error.

## Solutions

### 1. Make Sure Server is Running
The server must be running for routes to work. Check:

```bash
# Start the server
npm run dev:server
```

You should see:
```
🚀 Server running on http://localhost:3001
📦 Using Firebase Firestore database
✅ Routes registered: /api/auth, /api/properties, /api/locations, /api/types
```

### 2. Verify Server is Using Correct Entry Point
Check `package.json` - the `dev:server` script should be:
```json
"dev:server": "node server/index-firebase.js"
```

### 3. Test Routes
Try these URLs in your browser or Postman:

1. **Health Check** (should work):
   ```
   http://localhost:3001/api/health
   ```

2. **Test Route** (should work):
   ```
   http://localhost:3001/api/test
   ```

3. **List Users** (should work if server is running):
   ```
   http://localhost:3001/api/auth/list-users
   ```

### 4. Check Server Logs
When you try to access `/api/auth/list-users`, check the server console for:
- Route registration messages
- Any error messages
- Request logs

### 5. Verify Route is Registered
The route is defined in `server/routes/auth-firebase.js` at line 163:
```javascript
router.get('/list-users', async (req, res) => {
  // ...
});
```

And exported at line 240:
```javascript
export default router;
```

### 6. Common Issues

**Issue**: Server not running
- **Solution**: Run `npm run dev:server`

**Issue**: Wrong server file being used
- **Solution**: Make sure `package.json` has `"dev:server": "node server/index-firebase.js"`

**Issue**: Routes registered after server starts listening
- **Solution**: Routes are registered correctly before `app.listen()` is called

**Issue**: Port conflict
- **Solution**: Check if port 3001 is already in use, change PORT in `.env` if needed

### 7. Debug Steps

1. **Check if server is running**:
   ```bash
   # In PowerShell
   netstat -ano | findstr :3001
   ```

2. **Check server logs**:
   Look for route registration messages when server starts

3. **Test with curl** (if available):
   ```bash
   curl http://localhost:3001/api/health
   curl http://localhost:3001/api/auth/list-users
   ```

4. **Check browser console**:
   If accessing from browser, check Network tab for actual request/response

### 8. Quick Fix

If the route still doesn't work:

1. **Restart the server**:
   ```bash
   # Stop server (Ctrl+C)
   # Then restart
   npm run dev:server
   ```

2. **Check Firebase Admin initialization**:
   Make sure Firebase Admin SDK is initialized correctly in `server/db-firebase.js`

3. **Verify environment variables**:
   Check `.env` file has:
   ```
   FIREBASE_PROJECT_ID=housesadda-e756b
   ```

### 9. Alternative: Check Route Directly

You can also verify the route exists by checking the router:
```javascript
// In server/routes/auth-firebase.js
console.log('Routes:', router.stack.map(r => r.route?.path));
```

This will log all registered routes when the file is loaded.

## Expected Behavior

When you access `http://localhost:3001/api/auth/list-users`, you should get:

```json
{
  "success": true,
  "count": 1,
  "users": [
    {
      "uid": "user-id-here",
      "email": "user@example.com",
      "displayName": "User Name",
      "emailVerified": true,
      "disabled": false,
      "createdAt": "2025-01-26T..."
    }
  ],
  "message": "Firebase Auth users retrieved successfully"
}
```

If you get an error, check the server console for the actual error message.
