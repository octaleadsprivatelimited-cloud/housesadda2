# Firebase Admin SDK Credentials Setup

## Problem
The backend server needs Firebase Admin SDK credentials to connect to Firestore. Currently, it's trying to use default credentials which don't exist locally.

## Solution: Get Service Account Key

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Select your project: **housesadda-e756b**

### Step 2: Generate Service Account Key
1. Click the **⚙️ Settings** icon (top left)
2. Select **Project settings**
3. Go to the **Service accounts** tab
4. Click **Generate new private key**
5. Click **Generate key** in the dialog
6. A JSON file will download (e.g., `housesadda-e756b-firebase-adminsdk-xxxxx.json`)

### Step 3: Save the JSON File
1. **Move the downloaded JSON file** to your project root:
   ```
   houses-adda6-main/
   └── serviceAccountKey.json
   ```

2. **IMPORTANT:** Add to `.gitignore` (already should be there):
   ```
   serviceAccountKey.json
   *.json
   ```

### Step 4: Update .env File
Add this line to your `.env` file:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Step 5: Restart Server
```bash
npm run dev:server
```

## Alternative: Use Environment Variables

If you prefer not to use a file, you can extract values from the JSON and add to `.env`:

```env
FIREBASE_PROJECT_ID=housesadda-e756b
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@housesadda-e756b.iam.gserviceaccount.com
```

**Note:** The private key must include `\n` for newlines, or use the actual newlines in the .env file.

## Verify It Works

After setting up credentials, start the server:
```bash
npm run dev:server
```

You should see:
```
✅ Connected to Firebase Firestore
🚀 Server running on http://localhost:3001
```

## Security Notes

⚠️ **NEVER commit the service account key to Git!**
- The `.gitignore` should already exclude `*.json` files
- Service account keys have full admin access to your Firebase project
- If exposed, immediately revoke and regenerate the key
