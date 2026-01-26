# Vercel Deployment Guide for HousesAdda

This guide explains how to deploy HousesAdda frontend on Vercel and connect it to your backend API.

## Problem: Localhost Permission Prompt

If you see a browser permission prompt asking to "Look for and connect to any device on your local network" when opening your Vercel-deployed site, it means the frontend is trying to connect to `localhost:3001`, which doesn't exist in production.

## Solution Options

### Option 1: Deploy Backend Separately (Recommended)

1. **Deploy your backend API** to a service like:
   - Railway (https://railway.app)
   - Render (https://render.com)
   - Fly.io (https://fly.io)
   - Or your own VPS (see DEPLOYMENT.md)

2. **Get your backend API URL** (e.g., `https://your-api.railway.app`)

3. **Set Environment Variable in Vercel:**
   - Go to your Vercel project dashboard
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_API_URL` = `https://your-api.railway.app/api`
   - Redeploy your site

### Option 2: Use Vercel Proxy (If Backend is on Same Domain)

If your backend is deployed and accessible, you can configure Vercel to proxy API requests:

1. **Update `vercel.json`:**
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-backend-api-url.com/api/:path*"
       }
     ]
   }
   ```

2. The frontend will automatically use relative URLs (`/api`) in production, which will be proxied to your backend.

### Option 3: Use Supabase (No Separate Backend Needed)

If you're using Supabase, you can deploy the backend as Vercel serverless functions or use Supabase's built-in API.

## Current Fix Applied

The code has been updated to:
- ✅ Automatically detect production environment
- ✅ Use relative URLs (`/api`) in production instead of `localhost:3001`
- ✅ Only use `localhost:3001` in development

## Steps to Fix Your Current Deployment

1. **If you have a backend deployed:**
   - Set `VITE_API_URL` in Vercel environment variables to your backend URL
   - Example: `https://your-backend.railway.app/api`

2. **If you don't have a backend yet:**
   - Deploy your backend to Railway, Render, or another service
   - Use the Supabase setup (see SUPABASE_SETUP.md) for cloud database
   - Set `VITE_API_URL` in Vercel to point to your backend

3. **Redeploy on Vercel:**
   - Push your changes (the API fix is already in the code)
   - Vercel will automatically redeploy, or you can trigger a redeploy manually

## Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-api-url.com/api
```

**Important:** 
- Replace `your-backend-api-url.com` with your actual backend URL
- Don't include `/api` at the end if your backend already serves from `/api`
- The URL should be the full URL including `https://`

## Testing

After deployment:
1. Visit your Vercel site
2. Open browser console (F12)
3. Check the console logs - you should see: `🔗 API Base URL: /api` or your configured URL
4. The permission prompt should no longer appear
5. Properties should load correctly

## Troubleshooting

### Still seeing the permission prompt?
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly in Vercel
- Make sure your backend is accessible and CORS is configured

### Properties not loading?
- Check if your backend API is running and accessible
- Verify CORS settings on your backend allow requests from your Vercel domain
- Check browser network tab to see API request status

### Backend CORS Configuration

Make sure your backend allows requests from your Vercel domain:

```javascript
// In your Express server
app.use(cors({
  origin: [
    'https://houses-adda.vercel.app',
    'https://your-domain.vercel.app',
    // Add your Vercel domain here
  ],
  credentials: true
}));
```

Or for development:
```javascript
app.use(cors({
  origin: true, // Allow all origins (less secure, but works for development)
  credentials: true
}));
```

