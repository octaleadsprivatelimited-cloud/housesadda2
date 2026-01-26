# Manual Backend Server Start - See Errors

## Step-by-Step to Start Backend and See Errors

### 1. Open a New Terminal/PowerShell

### 2. Navigate to Project
```powershell
cd "c:\Users\navya\Downloads\houses-adda6-main (1)\houses-adda6-main"
```

### 3. Start Backend Server
```powershell
npm run dev:server
```

### 4. Watch for Errors

You should see one of these:

**✅ Success:**
```
✅ Connected to Firebase Firestore
🚀 Server running on http://localhost:3001
```

**❌ Error Examples:**
```
❌ Firebase initialization error: ...
❌ Failed to start server: ...
Error: Cannot find module ...
```

### 5. Common Errors and Fixes

#### Error: "Firebase initialization failed"
**Fix:** Check `.env` file has:
```env
FIREBASE_PROJECT_ID=housesadda-e756b
```

#### Error: "Cannot find module"
**Fix:** Run:
```bash
npm install
```

#### Error: "Port 3001 already in use"
**Fix:** Kill the process:
```powershell
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
Stop-Process -Id $process -Force
```

#### Error: Syntax errors
**Fix:** Should be fixed already, but if you see syntax errors, let me know.

### 6. Once Server Starts

Test it:
- Visit: http://localhost:3001/api/health
- Should return: `{"status":"ok",...}`

## Quick Commands

**Start backend:**
```bash
npm run dev:server
```

**Start frontend (in another terminal):**
```bash
npm run dev
```

**Start both together:**
```bash
npm run dev:all
```

## What to Look For

When you run `npm run dev:server`, you should see:

1. **Firebase connection messages**
2. **Database initialization**
3. **Server running message**
4. **Any error messages**

Copy and share any error messages you see, and I'll help fix them!
