# Firebase Authentication Login Setup

## Overview

The admin panel now uses **Firebase Authentication** instead of custom user management. Users must be created in Firebase Authentication (not Firestore database).

## How It Works

1. **Frontend**: User enters email/password → Authenticates with Firebase Auth
2. **Frontend**: Gets Firebase Auth ID token → Sends to backend
3. **Backend**: Verifies ID token → Creates session JWT token
4. **Backend**: Returns session token for API authentication

## Creating Users in Firebase Auth

### Option 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **housesadda-e756b**
3. Navigate to **Authentication** → **Users** tab
4. Click **Add user**
5. Enter:
   - **Email**: User's email address
   - **Password**: User's password (min 6 characters)
6. Click **Add user**

### Option 2: Programmatically (via Admin SDK)

You can create users programmatically using Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');
await admin.auth().createUser({
  email: 'admin@example.com',
  password: 'securepassword123',
  displayName: 'Admin User'
});
```

## Login Flow

### Frontend (AdminLogin.tsx)
1. User enters **email** and **password**
2. Frontend calls `authService.signIn(email, password)` (Firebase Auth)
3. Gets Firebase Auth ID token
4. Sends ID token to backend: `authAPI.loginWithFirebase(idToken)`
5. Backend verifies token and returns session token
6. Session token stored in localStorage

### Backend (auth-firebase.js)
1. Receives Firebase Auth ID token
2. Verifies token with `admin.auth().verifyIdToken(idToken)`
3. Gets user details from Firebase Auth
4. Creates custom JWT session token
5. Returns session token to frontend

## API Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "idToken": "firebase-auth-id-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "token": "session-jwt-token",
  "user": {
    "id": "firebase-uid",
    "email": "user@example.com",
    "displayName": "User Name",
    "emailVerified": true
  }
}
```

### GET /api/auth/verify
Verifies the session token and returns user info.

### GET /api/auth/list-users
Lists all Firebase Auth users (for debugging).

### PUT /api/auth/update-profile
Updates user profile (displayName, email).

## Authentication Middleware

The `authenticateToken` middleware now supports:
1. **Firebase Auth ID tokens** (direct verification)
2. **Custom JWT session tokens** (created after Firebase Auth login)

Both token types are automatically detected and verified.

## Migration from Custom Users

If you were using the custom `admin_users` collection:

1. **Create users in Firebase Auth** (see above)
2. **Use email instead of username** for login
3. **Old custom users are no longer used**

## Troubleshooting

### "Invalid authentication token"
- Make sure you're sending the Firebase Auth ID token
- Check that the token hasn't expired
- Verify Firebase Admin SDK is properly initialized

### "User not found in Firebase Auth"
- User doesn't exist in Firebase Authentication
- Create the user in Firebase Console first

### "Invalid email or password"
- Check email/password in Firebase Console
- Make sure Firebase Auth is enabled in your project
- Verify email is correct (case-sensitive)

### "Cannot connect to server"
- Make sure backend is running: `npm run dev:server`
- Check that port 3001 is available
- Verify API URL in `.env` file

## Security Notes

1. **Firebase Auth handles password security** - No need to hash passwords manually
2. **ID tokens expire** - Frontend should refresh tokens as needed
3. **Session tokens** - Custom JWT tokens for API authentication (24h expiry)
4. **Firebase Admin SDK** - Only backend can verify ID tokens (secure)

## Example: Creating Admin User

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Email: `admin@housesadda.com`
4. Password: `your-secure-password`
5. Click "Add user"
6. Login to admin panel with these credentials

## Frontend Changes

- Login form now uses **email** instead of **username**
- Uses Firebase Auth client SDK for authentication
- Sends Firebase Auth ID token to backend
- Stores session token for API calls

## Backend Changes

- Verifies Firebase Auth ID tokens
- Creates session JWT tokens
- Middleware supports both token types
- No longer uses custom `admin_users` collection
