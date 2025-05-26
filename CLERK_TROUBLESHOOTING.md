# Clerk Chrome Extension Troubleshooting

## Current Issue
Getting 401 errors when Clerk tries to initialize:
- `POST https://coherent-bear-81.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-04-10&_clerk_js_version=5.67.3&_method=PATCH`
- `GET https://coherent-bear-81.clerk.accounts.dev/v1/client?__clerk_api_version=2025-04-10&_clerk_js_version=5.67.3`

## What We've Verified

1. ✅ **Allowed Origins Added** via API:
   - `chrome-extension://ofildlgdeggjekidmehocamopeglfmle`
   - `http://localhost:5173`
   - `http://localhost:3000`

2. ✅ **Extension ID is Stable**: `ofildlgdeggjekidmehocamopeglfmle`

3. ✅ **Sidebar loads in iframe** with proper extension URL

4. ✅ **Manifest has correct permissions**:
   - cookies
   - host_permissions for Clerk domains
   - content_security_policy configured

## Testing Steps

### 1. Test Direct Extension Page
Navigate to:
```
chrome-extension://ofildlgdeggjekidmehocamopeglfmle/test-clerk-direct.html
```
This will test if Clerk works outside of the iframe context.

### 2. Check Console Debug Info
When opening the sidebar, look for:
- "Clerk Configuration:" - Shows extension ID and publishable key
- "Clerk Debug Info:" - Shows location and frame context
- "Clerk Request Details:" - Shows request headers

### 3. Try Development Mode
The errors might be related to the development environment. Try:

1. **Clear all extension data**:
   - Go to chrome://extensions
   - Remove the extension
   - Delete any stored data
   - Re-add the extension

2. **Check Clerk Dashboard Environment**:
   - Ensure you're in "Development" mode (not Production)
   - The `pk_test_` key confirms this is correct

## Possible Issues

### 1. API Version Mismatch
The error shows `__clerk_api_version=2025-04-10` which is a future date. This might indicate:
- Clerk SDK version mismatch
- Need to update @clerk/chrome-extension package

### 2. Cookie/Storage Issues
Chrome extensions have special cookie handling. The 401 might be because:
- Cookies aren't being set properly in the iframe context
- Third-party cookie blocking

### 3. Frame Ancestry
The sidebar runs in an iframe on Zillow.com, which might cause:
- Cross-origin restrictions
- Clerk seeing the request as coming from Zillow instead of the extension

## Alternative Solutions

### Option 1: Use Popup Instead of Sidebar
Clerk works better in extension popups:
1. Move authentication to the popup
2. Use the sidebar only after authentication

### Option 2: Use Background Service Worker
1. Handle authentication in the background script
2. Pass tokens to the sidebar via messaging

### Option 3: Proxy Authentication
1. Create a simple proxy endpoint
2. Have the extension authenticate through your own backend

### Option 4: Downgrade Clerk Package
Try an older version of @clerk/chrome-extension:
```bash
npm install @clerk/chrome-extension@1.0.0
```

## Next Steps

1. **Contact Clerk Support** with:
   - Extension ID: `ofildlgdeggjekidmehocamopeglfmle`
   - Error: 401 on `/v1/environment` and `/v1/client`
   - Context: Chrome extension sidebar in iframe

2. **Try the popup approach** as a workaround

3. **Check if cookies are being blocked** in Chrome settings

4. **Review Clerk's Chrome Extension examples** for working implementations