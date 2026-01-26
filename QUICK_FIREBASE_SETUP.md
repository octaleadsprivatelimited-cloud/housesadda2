# Quick Firebase Setup Guide

## Current Status

✅ **Frontend Firebase**: Configured and ready  
❌ **Backend Firebase**: Needs service account credentials

## Step-by-Step Setup

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **housesadda-e756b**
3. Click the ⚙️ **Settings** icon (top left) > **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Click **Generate key** in the dialog
7. A JSON file will download (e.g., `housesadda-e756b-firebase-adminsdk-xxxxx.json`)

### Step 2: Save the Service Account Key

**Option A: Save as file (Recommended for local development)**

1. Rename the downloaded file to `serviceAccountKey.json`
2. Move it to your project root directory:
   ```
   c:\Users\navya\Downloads\houses-adda6-main (1)\houses-adda6-main\serviceAccountKey.json
   ```
3. Open `.env` file
4. Uncomment and update this line:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

**Option B: Use environment variable (Recommended for Vercel)**

1. Open the downloaded JSON file
2. Copy the entire JSON content
3. In `.env` file, add:
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"housesadda-e756b",...}
   ```
   (Paste the entire JSON as a single line, escape quotes if needed)

### Step 3: Verify Connection

Run the test script:
```bash
node test-firebase-connection.js
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
✅ Firestore database connection: Ready
✅ Firestore read operation: SUCCESS
🎉 Firebase is FULLY CONNECTED!
```

### Step 4: Test the Backend Server

Start the backend:
```bash
npm run dev:server
```

You should see:
```
✅ Firebase Firestore initialized
✅ Connected to Firebase Firestore
🚀 Server running on http://localhost:3001
```

## Troubleshooting

### Error: "Could not load the default credentials"

**Solution**: Make sure `FIREBASE_SERVICE_ACCOUNT_PATH` is set correctly in `.env` and the file exists.

### Error: "Service account file not found"

**Solution**: 
1. Check the file path in `.env` matches the actual file location
2. Use relative path: `./serviceAccountKey.json` (from project root)
3. Or use absolute path: `C:/Users/navya/Downloads/houses-adda6-main (1)/houses-adda6-main/serviceAccountKey.json`

### Error: "Permission denied"

**Solution**: 
1. Make sure the service account has proper permissions in Firebase Console
2. Go to Firebase Console > IAM & Admin > Service Accounts
3. Verify the service account has "Firebase Admin SDK Administrator Service Agent" role

## Security Notes

⚠️ **Important**: 
- Never commit `serviceAccountKey.json` to git (it's already in `.gitignore`)
- Never share your service account key publicly
- For production/Vercel, use environment variables instead of files

## Next Steps

After setting up Firebase:
1. ✅ Test backend: `npm run dev:server`
2. ✅ Test frontend: `npm run dev`
3. ✅ Test admin login at: `http://localhost:8080/admin`
4. ✅ Create admin user in Firebase Console > Authentication
