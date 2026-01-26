# How to Start Servers on Localhost

## Quick Start (Both Servers)

### Option 1: Run Both Together (Recommended)
```bash
npm run dev:all
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Verify Servers Are Running

### Check Backend:
Visit: http://localhost:3001/api/health

Should return:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "Firebase Firestore"
}
```

### Check Frontend:
Visit: http://localhost:5173

Should show the website homepage.

## Troubleshooting ERR_CONNECTION_REFUSED

### Issue 1: Servers Not Started
**Solution:** Start the servers using one of the commands above.

### Issue 2: Port Already in Use
**Check what's using the port:**
```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
```

**Kill the process:**
```powershell
# Find process ID
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
# Kill it
Stop-Process -Id $process -Force
```

### Issue 3: Wrong Directory
**Make sure you're in the project directory:**
```bash
cd "c:\Users\navya\Downloads\houses-adda6-main (1)\houses-adda6-main"
```

### Issue 4: Dependencies Not Installed
**Install dependencies:**
```bash
npm install
```

## Step-by-Step Start

1. **Open terminal in project directory:**
   ```bash
   cd "c:\Users\navya\Downloads\houses-adda6-main (1)\houses-adda6-main"
   ```

2. **Start both servers:**
   ```bash
   npm run dev:all
   ```

3. **Wait for both to start:**
   - Backend: `🚀 Server running on http://localhost:3001`
   - Frontend: `VITE v... ready in ...`

4. **Open browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api/health

## Expected Output

### Backend Console:
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
```

### Frontend Console:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Quick Test

1. **Test backend:** http://localhost:3001/api/health
2. **Test frontend:** http://localhost:5173
3. **Test auth route:** http://localhost:3001/api/auth/test-route

If all three work, servers are running correctly!
