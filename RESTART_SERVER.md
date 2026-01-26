# How to Restart the Server

## Quick Steps

### 1. Stop the Current Server
If the server is running in a terminal:
- Press `Ctrl + C` to stop it
- Wait for it to fully stop

### 2. Start the Server Again
```bash
npm run dev:server
```

## Full Restart (if Ctrl+C doesn't work)

### Windows PowerShell:
```powershell
# Find the process using port 3001
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

# Kill the process (replace PID with the number from above)
Stop-Process -Id <PID> -Force

# Or kill all node processes (be careful!)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Then start again:
```bash
npm run dev:server
```

## What You Should See

After restarting, you should see:
```
✅ Connected to Firebase Firestore
✅ Admin user already exists in Firestore (or created)
✅ Property types created
✅ Default locations created
✅ Database initialized successfully
🚀 Server running on http://localhost:3001
📦 Using Firebase Firestore database
🔗 Firebase Project: housesadda-e756b
✅ Routes registered: /api/auth, /api/properties, /api/locations, /api/types
```

## Test the Server

After restarting, test these URLs:
- Health check: http://localhost:3001/api/health
- List users: http://localhost:3001/api/auth/list-users
- Test route: http://localhost:3001/api/test
