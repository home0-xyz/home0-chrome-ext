# Fix Clerk Development Authentication Error

## The Problem
Clerk development instances require browser authentication. The error `dev_browser_unauthenticated` means your browser isn't authenticated with Clerk's development dashboard.

## Quick Fix (Choose One)

### Option 1: Authenticate Your Browser (Recommended)
1. Open a new tab and go to: https://dashboard.clerk.com
2. Sign in to your Clerk account
3. Make sure you can see your dashboard
4. Go back to your extension and reload - it should work now

### Option 2: Use Production Keys Instead
If you have production keys, use those instead:
1. Edit `.env`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
   ```
2. Rebuild: `npm run build`

### Option 3: Disable Clerk Dev Browser Check
Add this to your auth page URL parameters:
1. Visit: https://coherent-bear-81.clerk.accounts.dev
2. This should set the necessary cookies
3. Then try your extension again

## Why This Happens

Clerk's development instances have extra security:
- They require the browser to be authenticated with Clerk
- This prevents unauthorized access to development data
- The authentication is stored in cookies

## Permanent Solution

For Chrome extensions, it's often better to:
1. Use production Clerk instance (even for development)
2. Or create a dedicated development instance with relaxed security

## Test After Fix

1. After authenticating with Clerk dashboard
2. Reload your extension
3. Try the sign-in flow again
4. The 401 errors should be gone