# Start Backend Server

## Quick Start

```bash
npm run dev:server
```

Or directly:
```bash
node server/index-firebase.js
```

## Verify Backend is Running

### Test 1: Health Check
Visit: http://localhost:3001/api/health

Should return:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "Firebase Firestore",
  "configured": "yes"
}
```

### Test 2: Test Route
Visit: http://localhost:3001/api/auth/test-route

Should return:
```json
{
  "message": "Firebase auth route is active!",
  "route": "auth-firebase.js",
  "timestamp": "..."
}
```

## Expected Server Output

When the server starts successfully, you should see:
```
✅ Connected to Firebase Firestore
✅ Admin user already exists in Firestore
✅ Property types created
✅ Default locations created
✅ Database initialized successfully
🚀 Server running on http://localhost:3001
📦 Using Firebase Firestore database
🔗 Firebase Project: housesadda-e756b
✅ Routes registered: /api/auth, /api/properties, /api/locations, /api/types
✅ Using auth-firebase.js route handler
🧪 Test route: http://localhost:3001/api/auth/test-route
```

## Troubleshooting

### If Server Doesn't Start

1. **Check for errors in terminal**
   - Look for error messages
   - Common: Firebase initialization errors, port conflicts

2. **Check Firebase Configuration**
   - Verify `.env` has: `FIREBASE_PROJECT_ID=housesadda-e756b`
   - Check Firebase project is active

3. **Check Port 3001**
   ```powershell
   Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
   ```
   - If something is using it, kill it or change PORT in `.env`

4. **Kill All Node Processes**
   ```powershell
   Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```
   Then restart: `npm run dev:server`

### Common Errors

**Error: Firebase initialization failed**
- Check `.env` file has `FIREBASE_PROJECT_ID`
- Verify Firebase project exists

**Error: Port 3001 already in use**
- Kill the process using port 3001
- Or change PORT in `.env` file

**Error: Cannot find module**
- Run: `npm install`

## Manual Start Steps

1. **Open terminal**
2. **Navigate to project:**
   ```bash
   cd "c:\Users\navya\Downloads\houses-adda6-main (1)\houses-adda6-main"
   ```

3. **Start server:**
   ```bash
   npm run dev:server
   ```

4. **Wait for:**
   ```
   🚀 Server running on http://localhost:3001
   ```

5. **Test it:**
   - Visit: http://localhost:3001/api/health
   - Should see: `{"status":"ok",...}`

## Keep Server Running

- Don't close the terminal
- Server runs until you press `Ctrl + C`
- For production, use PM2 or similar process manager
