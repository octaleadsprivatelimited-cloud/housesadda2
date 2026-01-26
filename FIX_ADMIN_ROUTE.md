# Fix: Cannot GET /admin Error

## Problem
Getting "Cannot GET /admin" error when trying to access the admin panel.

## Root Cause
This error typically occurs when:
1. Frontend dev server is not running
2. Direct URL access to a client-side route (React Router handles routing client-side)
3. Missing index route for nested admin routes

## Solutions

### Solution 1: Start Frontend Dev Server

The frontend must be running for React Router to handle the `/admin` route:

```bash
npm run dev
```

This starts the Vite dev server on port 8080.

### Solution 2: Access Through Browser

**Important:** React Router uses client-side routing. You should:
1. Start the frontend: `npm run dev`
2. Open browser: `http://localhost:8080`
3. Navigate to: `http://localhost:8080/admin` (or click a link)

**Don't** try to access `/admin` directly via curl or API tools - it's a client-side route.

### Solution 3: Check Both Servers Are Running

Make sure both servers are running:

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Should show: `Local: http://localhost:8080/`

**Terminal 2 - Backend:**
```bash
npm run dev:server
```
Should show: `Server running on http://localhost:3001`

### Solution 4: Verify Route Configuration

The route is correctly configured in `src/App.tsx`:
```tsx
<Route path="/admin" element={<AdminLogin />} />
<Route path="/admin/*" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="dashboard" element={<AdminDashboard />} />
  ...
</Route>
```

## Quick Fix Steps

1. **Check if frontend is running:**
   ```bash
   # Check port 8080
   netstat -ano | findstr :8080
   ```

2. **Start frontend if not running:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - Go to: `http://localhost:8080`
   - Then navigate to: `http://localhost:8080/admin`

4. **If still having issues:**
   - Hard refresh: `Ctrl + Shift + R`
   - Clear browser cache
   - Check browser console for errors

## Expected Behavior

When you visit `http://localhost:8080/admin`:
- ✅ Should show AdminLogin component
- ✅ After login, redirects to `/admin/dashboard`
- ✅ All admin routes work correctly

## Common Issues

### Issue: "Cannot GET /admin" in browser
**Solution:** Frontend server not running. Start with `npm run dev`

### Issue: Blank page at /admin
**Solution:** 
- Check browser console for errors
- Verify AdminLogin component is imported correctly
- Check if there are any JavaScript errors

### Issue: Redirects to login even when logged in
**Solution:** 
- Check localStorage for `adminSession`
- Verify session format matches expected structure
- Check AdminLayout authentication logic

## Testing

After starting the frontend server:

1. **Test login page:**
   ```
   http://localhost:8080/admin
   ```
   Should show login form

2. **Test after login:**
   ```
   http://localhost:8080/admin/dashboard
   ```
   Should show dashboard (if authenticated)

3. **Test other routes:**
   ```
   http://localhost:8080/admin/properties
   http://localhost:8080/admin/locations
   ```

## Notes

- React Router handles all `/admin/*` routes client-side
- The backend API is separate and runs on port 3001
- Frontend (port 8080) handles UI routing
- Backend (port 3001) handles API requests
