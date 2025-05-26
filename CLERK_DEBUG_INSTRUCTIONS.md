# Clerk Chrome Extension Debug Instructions

## Current Issue
The sidebar shows a blank screen with 401 errors when Clerk tries to call its API endpoints:
- `https://coherent-bear-81.clerk.accounts.dev/v1/environment?_clerk_js_version=5.41.0`
- `https://coherent-bear-81.clerk.accounts.dev/v1/client?_clerk_js_version=5.41.0`

## Debugging Steps

### 1. Verify Extension ID
1. Open `chrome://extensions`
2. Find "home0 for Zillow"
3. Verify the ID is: `ofildlgdeggjekidmehocamopeglfmle`
4. If it's different, the manifest key is not working correctly

### 2. Check Clerk Dashboard Configuration
1. Go to https://dashboard.clerk.com
2. Sign in and select your application (coherent-bear-81)
3. Navigate to **Settings → Domains** (or **Allowed Origins**)
4. Verify these origins are listed:
   - `chrome-extension://ofildlgdeggjekidmehocamopeglfmle`
   - `http://localhost:3000`
   - `http://localhost:5173`

### 3. Add Missing Origins (if needed)
If the Chrome extension origin is missing:
1. Click "Add origin" or similar button
2. Add exactly: `chrome-extension://ofildlgdeggjekidmehocamopeglfmle`
3. Save changes
4. Wait a few minutes for propagation

### 4. Test Direct Extension Page
1. Build the extension: `npm run build`
2. Load in Chrome via `chrome://extensions`
3. Open a new tab and navigate to:
   ```
   chrome-extension://ofildlgdeggjekidmehocamopeglfmle/test-clerk.html
   ```
4. Check if the extension ID matches

### 5. Console Debug Information
When you open the sidebar on Zillow, check the console for:
- "Clerk Configuration:" log with extension details
- "Clerk Debug Info:" with location/frame information
- "Clerk API Request:" showing the failing requests

### 6. Alternative Solutions

#### Option A: Use Mock Auth
If Clerk continues to have issues:
1. Edit `.env` and set `VITE_USE_CLERK_AUTH=false`
2. Rebuild: `npm run build`
3. This will use the mock authentication system

#### Option B: Verify Clerk Instance
The publishable key decodes to: `coherent-bear-81.clerk.accounts.dev`
Ensure this matches your Clerk instance URL.

#### Option C: Check Network Tab
1. Open DevTools in the sidebar iframe
2. Go to Network tab
3. Look for the failing Clerk requests
4. Check the Response Headers for CORS errors

## Expected Behavior
When properly configured:
1. Sidebar should show Clerk sign-in form
2. No 401 errors in console
3. Can authenticate with Google/email
4. User profile shows after sign-in

## Current Configuration
- **Publishable Key**: `pk_test_Y29oZXJlbnQtYmVhci04MS5jbGVyay5hY2NvdW50cy5kZXYk`
- **Clerk Domain**: `coherent-bear-81.clerk.accounts.dev`
- **Extension ID**: `ofildlgdeggjekidmehocamopeglfmle`
- **Package**: `@clerk/chrome-extension@2.4.8`