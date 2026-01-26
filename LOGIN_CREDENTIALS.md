# Admin Login Credentials

## Your Login Details

- **Email**: `housesaddadigital@gmail.com`
- **Password**: `Housesadda@2026`

## How to Login

1. Go to the admin login page
2. Enter your **email**: `housesaddadigital@gmail.com`
3. Enter your **password**: `Housesadda@2026`
4. Click "Sign In"

## Troubleshooting "Username and password are required" Error

### Solution 1: Clear Browser Cache
The error might be from cached old code. Try:

1. **Hard Refresh**:
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Clear Browser Cache**:
   - Open browser settings
   - Clear browsing data
   - Select "Cached images and files"
   - Clear data

3. **Try Incognito/Private Window**:
   - Open a new incognito/private window
   - Navigate to admin login page
   - Try logging in

### Solution 2: Verify User Exists in Firebase Auth

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **housesadda-e756b**
3. Navigate to **Authentication** → **Users**
4. Check if user with email `housesaddadigital@gmail.com` exists
5. If not, create it:
   - Click "Add user"
   - Email: `housesaddadigital@gmail.com`
   - Password: `Housesadda@2026`
   - Click "Add user"

### Solution 3: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Try to login
4. Look for any error messages
5. Check **Network** tab for failed requests

### Solution 4: Verify Firebase Auth is Enabled

1. Go to Firebase Console
2. Navigate to **Authentication** → **Sign-in method**
3. Make sure **Email/Password** is enabled
4. If not, enable it:
   - Click on "Email/Password"
   - Enable "Email/Password"
   - Click "Save"

### Solution 5: Check Server Logs

1. Make sure backend server is running:
   ```bash
   npm run dev:server
   ```

2. Check server console for error messages when you try to login

3. Look for messages like:
   - `🔐 Login attempt:`
   - `📦 Firebase Auth result:`
   - Any error messages

## Expected Behavior

When you login successfully, you should:
1. See a "Welcome back!" toast message
2. Be redirected to `/admin/dashboard`
3. See your email in the admin panel

## Common Errors

### "Invalid email or password"
- Check email spelling: `housesaddadigital@gmail.com`
- Check password: `Housesadda@2026` (case-sensitive)
- Verify user exists in Firebase Auth

### "No account found with this email address"
- User doesn't exist in Firebase Auth
- Create the user in Firebase Console

### "Cannot connect to server"
- Backend server not running
- Run: `npm run dev:server`

### "Username and password are required"
- Usually a browser cache issue
- Try hard refresh or clear cache
- Check browser console for errors

## Quick Test

1. Open browser console (F12)
2. Try to login
3. Check console for:
   - `🔐 Attempting login with:`
   - `📦 Firebase Auth result:`
   - Any error messages

This will help identify where the issue is.
