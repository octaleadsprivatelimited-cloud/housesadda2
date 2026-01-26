# Admin Login - Firestore Setup Guide

## Default Admin Credentials

When the server starts for the first time, it automatically creates a default admin user in Firestore:

- **Username**: `admin`
- **Password**: `admin123`

## How to Login

1. Make sure your server is running:
   ```bash
   npm run dev:server
   ```

2. Navigate to the admin login page in your browser

3. Use the default credentials:
   - Username: `admin`
   - Password: `admin123`

## Verify Admin User Exists

You can check if the admin user was created by visiting:
```
http://localhost:3001/api/auth/check-admin
```

This will show:
- ✅ If admin user exists in Firestore
- ✅ The user ID and username
- ❌ If admin user doesn't exist (with instructions to restart server)

## Troubleshooting

### Issue: "Invalid username or password"

**Solution 1: Check if admin user exists**
1. Visit: `http://localhost:3001/api/auth/check-admin`
2. If it says "Admin user not found", restart your server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev:server
   ```
3. Look for this message in the console:
   ```
   ✅ Admin user created in Firestore
      Username: admin
      Password: admin123
   ```

**Solution 2: Check server logs**
When you try to login, check the server console for:
- `🔐 Login attempt:` - Shows the username being used
- `📦 Querying Firestore for user:` - Confirms Firestore query
- `✅ User found in Firestore:` - Confirms user exists
- `❌ User not found in Firestore:` - User doesn't exist

**Solution 3: Verify Firestore connection**
1. Check your `.env` file has:
   ```
   FIREBASE_PROJECT_ID=housesadda-e756b
   ```
2. Make sure Firebase Admin SDK is initialized correctly
3. Check server startup logs for:
   ```
   ✅ Connected to Firebase Firestore
   ✅ Admin user already exists in Firestore
   ```

**Solution 4: Manually create admin user**
If the automatic creation fails, you can manually create the admin user in Firebase Console:
1. Go to Firebase Console → Firestore Database
2. Create collection: `admin_users`
3. Add document with:
   - `username`: `admin`
   - `password`: (hashed password - use bcrypt with salt rounds 10)
   - `created_at`: (timestamp)
   - `updated_at`: (timestamp)

   Or restart the server and it will create automatically.

## Change Default Password

After logging in, you can change the password using the admin settings page.

## Server Logs

When you attempt to login, you should see detailed logs:
```
🔐 Login attempt: { username: 'admin', hasPassword: true }
📦 Querying Firestore for user: admin
✅ User found in Firestore: { id: '...', username: 'admin', hasPassword: true }
🔒 Verifying password...
✅ Password verified successfully
✅ Login successful for user: admin
```

If you see errors, they will be logged with details to help debug.
