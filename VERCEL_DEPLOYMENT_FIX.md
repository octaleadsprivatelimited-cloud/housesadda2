# Vercel Deployment Fix Guide

## Common Vercel Deployment Errors and Solutions

### Error 1: Firebase Admin SDK Initialization Failed

**Problem:** `FIREBASE_SERVICE_ACCOUNT_PATH` doesn't work in Vercel serverless functions because they don't have file system access.

**Solution:** Use environment variables instead of file paths.

#### Step 1: Get Your Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file

#### Step 2: Set Environment Variables in Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables for **Production**, **Preview**, and **Development**:

**Option A: Single JSON String (Recommended)**
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: {"type":"service_account","project_id":"your-project-id","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",...}
```

**Option B: Individual Variables (Alternative)**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important Notes:**
- For `FIREBASE_SERVICE_ACCOUNT`: Copy the entire JSON content as a single-line string
- For `FIREBASE_PRIVATE_KEY`: Keep the `\n` characters for newlines
- Make sure to set these for all environments (Production, Preview, Development)

#### Step 3: Add Other Required Variables

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=/api
JWT_SECRET=your-random-secret-key
NODE_ENV=production
CORS_ORIGIN=https://your-domain.vercel.app
```

### Error 2: API Routes Returning 404

**Problem:** API routes not being routed correctly.

**Solution:** Verify `vercel.json` configuration:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

Make sure `api/index.js` exists and exports the Express app correctly.

### Error 3: Build Failures

**Problem:** Build command fails or dependencies not installed.

**Solution:** Check `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist"
}
```

### Error 4: Function Timeout

**Problem:** Serverless functions timing out.

**Solution:** Increase timeout in `vercel.json`:

```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Error 5: CORS Errors

**Problem:** Frontend can't access API due to CORS.

**Solution:** Set `CORS_ORIGIN` environment variable in Vercel:

```
CORS_ORIGIN=https://your-domain.vercel.app
```

Or set to `true` to allow all origins (less secure, for testing only).

## Quick Deployment Checklist

- [ ] Set `FIREBASE_SERVICE_ACCOUNT` or individual Firebase credentials in Vercel
- [ ] Set all `VITE_FIREBASE_*` variables
- [ ] Set `JWT_SECRET` (generate a random string)
- [ ] Set `NODE_ENV=production`
- [ ] Set `VITE_API_URL=/api`
- [ ] Set `CORS_ORIGIN` to your Vercel domain
- [ ] Verify `vercel.json` configuration
- [ ] Verify `api/index.js` exists
- [ ] Redeploy after setting environment variables

## Testing Deployment

After deployment, test these endpoints:

1. **Health Check:**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```
   Should return: `{"status":"ok","database":"Firebase Firestore"}`

2. **API Routes:**
   ```bash
   curl https://your-domain.vercel.app/api/properties
   ```

3. **Frontend:**
   - Visit your Vercel domain
   - Check browser console for errors
   - Test property listing
   - Test admin login

## Troubleshooting

### Check Vercel Logs

1. Go to **Vercel Dashboard** → **Deployments**
2. Click on your deployment
3. Go to **Functions** tab
4. Check logs for errors

### Common Log Messages

**Good:**
- `✅ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT`
- `✅ Firebase Firestore initialized`

**Bad:**
- `❌ Firebase initialization error`
- `⚠️ FIREBASE_SERVICE_ACCOUNT_PATH not supported in serverless`

### Still Having Issues?

1. **Verify Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Make sure all variables are set for the correct environment
   - Check for typos in variable names

2. **Redeploy:**
   - After changing environment variables, you must redeploy
   - Go to Deployments → Click ⋯ → Redeploy

3. **Check Firebase Console:**
   - Verify Firestore Database is enabled
   - Verify Authentication is enabled
   - Check service account permissions

4. **Test Locally First:**
   - Make sure everything works locally
   - Use `npm run build` to test build process
   - Check for any build errors

## Environment Variables Reference

See `.env.example` for all available environment variables and their descriptions.
