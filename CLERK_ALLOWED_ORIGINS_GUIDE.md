# How to Add Chrome Extension Origin to Clerk - Detailed Guide

## Step 1: Access Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Sign in with your Clerk account

## Step 2: Select Your Application
- You should see your applications listed
- Click on **"coherent-bear-81"** (or your application name)

## Step 3: Navigate to Allowed Origins

### Option A: Via Customization Menu
1. In the left sidebar, look for **"Customization"**
2. Under Customization, click on **"Allowlist"**
3. You'll see sections for:
   - Allowed redirect URLs
   - Allowed origins

### Option B: Via Settings Menu
1. In the left sidebar, click **"Settings"**
2. Look for **"Paths"** or **"URLs & Redirects"**
3. Find the **"Allowed origins"** section

### Option C: Via API & SDKs Menu
1. In the left sidebar, click **"API Keys"**
2. Scroll down to find **"Allowed origins"** section

## Step 4: Add the Chrome Extension Origin

1. In the **Allowed origins** section, click **"Add origin"** or **"+ Add"**
2. Enter exactly (copy and paste this):
   ```
   chrome-extension://ofildlgdeggjekidmehocamopeglfmle
   ```
3. Also add these for local development:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
4. Click **"Save"** or **"Add origin"**

## Step 5: Verify the Origins Were Added
- You should see all three origins listed:
  - `chrome-extension://ofildlgdeggjekidmehocamopeglfmle`
  - `http://localhost:5173`
  - `http://localhost:3000`

## Step 6: Wait for Propagation
- Changes may take 1-2 minutes to propagate
- Try reloading your Chrome extension after waiting

## Alternative: Using Clerk CLI

If you have the Clerk CLI installed, you can also add origins via command line:

```bash
# First, set your secret key
export CLERK_SECRET_KEY=your_secret_key_here

# Add the Chrome extension origin
clerk origins add chrome-extension://ofildlgdeggjekidmehocamopeglfmle
```

## What the Allowed Origins Setting Looks Like

The setting might appear in different ways:
- A text input field where you can add URLs
- A list with an "Add" button
- A table showing existing origins with an option to add more

## Troubleshooting

### Can't Find Allowed Origins?
1. Try searching for "origins" in the dashboard search
2. Check under **Development** → **API Keys**
3. Look for **CORS** or **Security** settings

### Still Getting 401 Errors?
1. Clear your browser cache
2. Remove and re-add the extension in Chrome
3. Make sure you're using the correct publishable key
4. Check that the extension ID matches: `ofildlgdeggjekidmehocamopeglfmle`

## Visual Indicators You're in the Right Place
- You should see other origins already listed (like your production domain)
- There should be an input field or button to add new origins
- The page might mention "CORS", "Cross-origin", or "Security"

## Common Locations in Different Clerk Versions
- **Newer Dashboard**: Customization → Allowlist → Allowed origins
- **Older Dashboard**: Settings → URLs & Redirects → Allowed origins
- **API Section**: Configure → API Keys → Allowed origins

If you still can't find it, try using the dashboard search feature and search for "allowed origins" or "CORS".