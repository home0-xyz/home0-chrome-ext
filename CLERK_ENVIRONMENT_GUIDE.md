# Clerk Development vs Production Environment Guide

## Which Environment to Use?

### For Testing (Recommended First)
Use **Development** environment because:
- Your publishable key starts with `pk_test_` (test = development)
- No risk to production users
- Easier to debug and experiment
- Same features as production

### How to Switch Environments in Clerk Dashboard

1. **Look for Environment Switcher** (usually at the top of dashboard)
   - Might show "Development" and "Production" tabs
   - Or a dropdown saying "Development" or "Production"
   - Sometimes shows as "Dev" and "Prod"

2. **Make Sure You're in Development**
   - Select "Development" or "Dev"
   - The URL might change to include "dev" or "development"
   - Your test keys will be visible

3. **Add Origins to Development Environment**
   - Follow the same steps to find "Allowed origins"
   - Add the Chrome extension origin there
   - This won't affect your production app

## Your Current Setup

Your `.env` file shows:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29oZXJlbnQtYmVhci04MS5jbGVyay5hY2NvdW50cy5kZXYk
```

The `pk_test_` prefix confirms you're using the **Development** environment, which is perfect for testing.

## Step by Step

1. **In Clerk Dashboard**, ensure you're in **Development** mode
2. Navigate to one of these:
   - Customization → Allowlist
   - Configure → API Keys
   - Settings → URLs & Redirects
3. Add to **Allowed origins**:
   ```
   chrome-extension://ofildlgdeggjekidmehocamopeglfmle
   http://localhost:5173
   http://localhost:3000
   ```
4. Save changes

## When to Use Production?

Only add to Production when:
- Your extension is fully tested
- You're ready to publish to Chrome Web Store
- You have production API endpoints set up

For production, you would:
1. Switch to "Production" environment in Clerk
2. Add the same Chrome extension origin
3. Update your `.env` to use `pk_live_` key instead of `pk_test_`

## Current Status

Since you're using `pk_test_` (development key), you only need to add the origins to the **Development** environment to fix the 401 errors.