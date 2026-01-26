# Firebase Setup Guide for HousesAdda

This guide will help you set up Firebase for the HousesAdda project.

## Prerequisites

- A Firebase account (sign up at [firebase.google.com](https://firebase.google.com))
- Node.js and npm installed
- Basic knowledge of Firebase

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) and sign in (or create an account)
2. Click "Add project" or "Create a project"
3. Fill in the project details:
   - **Project name**: HousesAdda (or your preferred name)
   - **Google Analytics**: Optional (can enable later)
4. Click "Create project" and wait for it to be set up

## Step 2: Enable Firebase Services

### Enable Firestore Database

1. In your Firebase project dashboard, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development) or **Start in production mode**
4. Select a location closest to your users
5. Click "Enable"

### Enable Authentication

1. In your Firebase project dashboard, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### Enable Storage (Optional - for property images)

1. Go to **Storage**
2. Click "Get started"
3. Choose **Start in test mode** (for development)
4. Select a location
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In your Firebase project dashboard, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "HousesAdda Web")
5. Copy the Firebase configuration object (already configured in `src/lib/firebase.ts`)

## Step 4: Get Service Account Key (for Backend)

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file (keep it secure!)
4. Save it in your project root or a secure location

## Step 5: Configure Environment Variables

Update your `.env` file in the project root:

```env
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
VITE_API_URL=http://localhost:3001/api

# Firebase Configuration (Backend)
# Option 1: Use service account JSON file path (Recommended)
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Option 2: Use project ID only (for Firebase hosting/Cloud Run)
FIREBASE_PROJECT_ID=housesadda-e756b
```

**Important Notes:**
- Replace `./serviceAccountKey.json` with the actual path to your downloaded service account key
- Never commit the service account key file to version control!
- Add `serviceAccountKey.json` to `.gitignore`

## Step 6: Install Dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

The Firebase client and admin libraries should already be installed:
- `firebase` - Client-side Firebase SDK
- `firebase-admin` - Server-side Firebase Admin SDK

## Step 7: Start the Application

Start both the frontend and backend with Firebase:

```bash
npm run dev:all
```

Or start them separately:

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend with Firebase):**
```bash
npm run dev:server
```

## Step 8: Verify Setup

1. Open your browser and go to `http://localhost:8080` (or the port shown)
2. Check the backend logs - you should see:
   - `✅ Connected to Firebase Firestore`
   - `✅ Admin user created (admin/admin123)`
   - `✅ Property types created`
   - `✅ Default locations created`
   - `✅ Database initialized successfully`

3. Test the admin login:
   - Go to `http://localhost:8080/admin`
   - Username: `admin`
   - Password: `admin123`

## Default Data

The database initialization includes:
- **Admin User**: `admin` / `admin123` (⚠️ Change this in production!)
- **Property Types**: Apartment, Villa, Plot, Commercial, PG
- **Locations**: Various Hyderabad locations

## Firebase Collections Structure

The Firestore database uses the following collections:

- `admin_users` - Admin user accounts
- `properties` - Property listings
- `property_types` - Property type definitions
- `locations` - Location/area data
- `property_images` - Property image URLs

## Using Firebase Auth (Frontend)

The project includes Firebase Authentication helpers:

```typescript
import { authService } from '@/lib/firebase-auth';
import { useAuth } from '@/hooks/useAuth';

// In a component
const { user, loading, signIn, signOut } = useAuth();

// Sign in
await signIn('email@example.com', 'password');

// Sign out
await signOut();
```

## Troubleshooting

### Error: "Firebase initialization failed"
- Make sure your `.env` file has the correct Firebase configuration
- Verify the service account key file path is correct
- Check that Firestore Database is enabled in Firebase Console

### Error: "Permission denied"
- Check Firestore security rules in Firebase Console
- For development, you can use test mode rules:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.time < timestamp.date(2025, 12, 31);
      }
    }
  }
  ```

### Error: "Table does not exist"
- Collections are created automatically when data is inserted
- The server will create default data on first run
- Check the server logs for initialization messages

### Connection Issues
- Verify your Firebase project is active (not paused)
- Check your internet connection
- Ensure the Firebase project ID is correct in `.env`

## Security Best Practices

1. **Never commit service account keys** - Add them to `.gitignore`
2. **Use environment variables** - Keep credentials in `.env` file
3. **Set up Firestore security rules** - Restrict access appropriately
4. **Change default admin password** - Update it immediately after first login
5. **Use Firebase App Check** - Protect your backend resources (optional)

## Production Deployment

For production:

1. Create a new Firebase project for production (or use the same one)
2. Set up proper Firestore security rules
3. Update production environment variables
4. Use strong `JWT_SECRET`
5. Enable Firebase App Check for additional security
6. Set up proper CORS settings

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Review the server console output
3. Verify all environment variables are set correctly
4. Ensure Firestore Database is enabled and accessible
