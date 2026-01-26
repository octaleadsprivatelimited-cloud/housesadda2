# How to Run on Localhost

## Quick Start

### Option 1: Run Both Frontend and Backend Together (Recommended)
```bash
npm run dev:all
```

This will start:
- Frontend: http://localhost:5173 (Vite default port)
- Backend: http://localhost:3001

### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```
Backend runs on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

## Prerequisites

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Make sure your `.env` file has:
```env
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
VITE_API_URL=http://localhost:3001/api

# Firebase Configuration
FIREBASE_PROJECT_ID=housesadda-e756b
```

### 3. Firebase Setup
- Make sure Firebase project is configured
- Firestore Database is enabled
- Firebase Authentication is enabled
- User exists in Firebase Auth (housesaddadigital@gmail.com)

## Access the Application

### Frontend (User-facing):
- **URL**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin/login
  - Email: `housesaddadigital@gmail.com`
  - Password: `Housesadda@2026`

### Backend API:
- **Health Check**: http://localhost:3001/api/health
- **API Base**: http://localhost:3001/api

## Verify Everything is Working

### 1. Check Backend is Running
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

### 2. Check Frontend is Running
Visit: http://localhost:5173

Should show the website homepage.

### 3. Test Admin Login
1. Go to: http://localhost:5173/admin/login
2. Enter:
   - Email: `housesaddadigital@gmail.com`
   - Password: `Housesadda@2026`
3. Should redirect to dashboard

## Troubleshooting

### Port Already in Use
If port 3001 is already in use:
1. Change PORT in `.env` file
2. Update `VITE_API_URL` to match
3. Restart server

### Backend Not Starting
- Check Firebase configuration in `.env`
- Verify `FIREBASE_PROJECT_ID` is correct
- Check server console for errors

### Frontend Can't Connect to Backend
- Make sure backend is running on port 3001
- Check `VITE_API_URL` in `.env` matches backend port
- Check browser console for CORS errors

### Firebase Errors
- Verify Firebase project ID is correct
- Check Firebase Console for enabled services
- Make sure user exists in Firebase Auth

## Development Workflow

1. **Start both servers:**
   ```bash
   npm run dev:all
   ```

2. **Make changes:**
   - Frontend: Auto-reloads on save
   - Backend: Restart required for changes

3. **View logs:**
   - Frontend: Browser console (F12)
   - Backend: Terminal where server is running

4. **Stop servers:**
   - Press `Ctrl + C` in terminal

## Common Commands

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev:all

# Run only backend
npm run dev:server

# Run only frontend
npm run dev

# Build for production
npm run build
```

## Default Ports

- **Frontend (Vite)**: 5173
- **Backend (Express)**: 3001

To change ports:
- Frontend: Edit `vite.config.ts`
- Backend: Change `PORT` in `.env` file
