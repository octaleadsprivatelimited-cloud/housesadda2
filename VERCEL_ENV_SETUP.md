# Vercel Environment Variables Setup Guide

## Required Environment Variables

To fix "Server configuration error", you must set these environment variables in Vercel:

### Step 1: Go to Vercel Dashboard
1. Open your project on [vercel.com](https://vercel.com)
2. Click on your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Variables

Add each variable for **Production**, **Preview**, and **Development**:

#### 1. SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://ycsvgcvrknipvvrbjond.supabase.co
Environment: Production, Preview, Development
```

#### 2. SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Your service role key from Supabase]
Environment: Production, Preview, Development
```

**How to get Service Role Key:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **service_role** key (⚠️ Keep this secret!)

#### 3. SUPABASE_ANON_KEY
```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc3ZnY3Zya25pcHZ2cmJqb25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjA2NzQsImV4cCI6MjA4Mzc5NjY3NH0.g7qoi_wvhskcy64POMUJyq6tNYRbavtUMwIC7cBXWQE
Environment: Production, Preview, Development
```

#### 4. JWT_SECRET
```
Name: JWT_SECRET
Value: [A strong random string - generate one]
Environment: Production, Preview, Development
```

**Generate JWT_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use an online generator
# https://generate-secret.vercel.app/32
```

### Step 3: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger automatic redeploy.

## Verification

After redeploying, test the health endpoint:

```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "Supabase",
  "url": "configured"
}
```

If you see `"url": "not configured"`, the environment variables are not set correctly.

## Troubleshooting

### Still seeing "Server configuration error"?

1. **Check variable names** - Must be exactly:
   - `SUPABASE_URL` (not `VITE_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_KEY`)
   - `SUPABASE_ANON_KEY`
   - `JWT_SECRET`

2. **Check environments** - Make sure variables are set for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. **Redeploy** - Environment variables only apply to new deployments

4. **Check Vercel logs**:
   - Go to **Deployments** → Click on deployment → **Functions** tab
   - Look for error messages in the logs

5. **Verify Supabase credentials**:
   - Make sure your Supabase project is active (not paused)
   - Verify the URL is correct
   - Double-check the service role key

## Quick Checklist

- [ ] SUPABASE_URL is set
- [ ] SUPABASE_SERVICE_ROLE_KEY is set
- [ ] SUPABASE_ANON_KEY is set
- [ ] JWT_SECRET is set
- [ ] All variables set for Production, Preview, Development
- [ ] Redeployed after setting variables
- [ ] Checked Vercel function logs for errors

