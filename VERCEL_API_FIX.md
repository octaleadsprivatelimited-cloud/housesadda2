# Vercel API 404/405 Fix Guide

## Problem Diagnosis

**Root Causes:**
1. Express routes don't work on Vercel - need Vercel Serverless Functions
2. Missing `/api` route handlers in Vercel Functions directory
3. CORS preflight (OPTIONS) not handled
4. Method mismatch (405) when OPTIONS not handled first

**What to Check:**

**Browser DevTools:**
- Network tab: Full request URL (`https://your-domain.vercel.app/api/auth/login`)
- Request Method: Should be POST (or OPTIONS for preflight)
- Request Headers: `Content-Type: application/json`, `Origin`
- Response Status: 404 (route not found) or 405 (method not allowed)
- Response Headers: Check for CORS headers

**Vercel Dashboard:**
- Functions tab: Should show `/api/auth/login` function
- Deployment logs: Check for function invocation errors
- Environment Variables: Verify `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`

## Curl Commands to Test

Replace `<YOUR_DOMAIN>` with your Vercel domain:

```bash
# Test OPTIONS preflight
curl -X OPTIONS https://<YOUR_DOMAIN>/api/auth/login \
  -H "Origin: https://<YOUR_DOMAIN>" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test POST login
curl -X POST https://<YOUR_DOMAIN>/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://<YOUR_DOMAIN>" \
  -d '{"username":"admin","password":"admin123"}' \
  -v

# Test GET verify
curl -X GET https://<YOUR_DOMAIN>/api/auth/verify \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Origin: https://<YOUR_DOMAIN>" \
  -v
```

## Solution Applied

Created Vercel Serverless Functions in `/api` directory:
- `/api/auth/login.js` - Handles POST login
- `/api/auth/verify.js` - Handles GET token verification  
- `/api/auth/update-credentials.js` - Handles PUT credential updates

Each function:
- ✅ Handles OPTIONS preflight (returns 204)
- ✅ Sets proper CORS headers
- ✅ Logs requests for debugging
- ✅ Uses Supabase for database operations
- ✅ Returns proper error responses

## Required Vercel Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
SUPABASE_URL=https://ycsvgcvrknipvvrbjond.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-secret-key-change-in-production
```

**Important:** Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code - only use in serverless functions.

## Troubleshooting Checklist

1. ✅ **Functions exist**: Check `/api/auth/login.js` exists in your repo
2. ✅ **Deployed**: Push code and verify functions appear in Vercel Functions tab
3. ✅ **Env vars set**: All required env vars are set in Vercel dashboard
4. ✅ **CORS headers**: Functions return proper CORS headers
5. ✅ **OPTIONS handled**: Preflight requests return 204
6. ✅ **Method match**: Client uses POST for login, GET for verify

## Expected Responses

**After fix:**
- OPTIONS `/api/auth/login`: `204 No Content` with CORS headers
- POST `/api/auth/login`: `200 OK` with `{ success: true, token: "...", user: {...} }`
- GET `/api/auth/verify`: `200 OK` with `{ success: true, user: {...} }`

## Testing Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev

# Test locally
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Next Steps

1. Push these changes to your repository
2. Vercel will automatically deploy the new functions
3. Set environment variables in Vercel dashboard
4. Test login functionality
5. Check Vercel Functions logs if issues persist

