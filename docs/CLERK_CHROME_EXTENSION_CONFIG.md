# Clerk Chrome Extension Configuration

Your Chrome extension now has a stable CRX ID that won't change between installations.

## Extension Details

- **Extension ID**: `ofildlgdeggjekidmehocamopeglfmle`
- **Extension Origin**: `chrome-extension://ofildlgdeggjekidmehocamopeglfmle`

## Configure Clerk Dashboard

To allow your Chrome extension to work with Clerk, you need to add the extension origin to your Clerk application settings.

### Steps:

1. **Go to your Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your application (coherent-bear-81)

2. **Navigate to Settings**
   - In the sidebar, click on "Settings"
   - Go to "Domains" or "Allowed Origins"

3. **Add Chrome Extension Origin**
   Add the following URL to the allowed origins:
   ```
   chrome-extension://ofildlgdeggjekidmehocamopeglfmle
   ```

4. **Add Development URLs (if needed)**
   Also add these for local development:
   ```
   http://localhost:3000
   http://localhost:5173
   ```

5. **Save Changes**

## Verify Configuration

After building and loading the extension:

1. Open Chrome and go to `chrome://extensions`
2. Remove any existing version of the extension
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the `dist` folder
5. Verify the Extension ID matches: `ofildlgdeggjekidmehocamopeglfmle`

## Important Files

- **Private Key**: `key.pem` (NEVER commit this to git)
- **Public Key**: In `manifest.json` under the `key` field
- **Extension Keys Info**: `extension-keys.txt`

## Security Notes

- The private key (`key.pem`) is already added to `.gitignore`
- Never share or commit the private key
- The public key in manifest.json is safe to commit
- The extension ID will remain stable across all installations

## Troubleshooting

If you see CORS or origin errors:
1. Double-check the extension ID in chrome://extensions
2. Ensure the exact origin is added to Clerk's allowed origins
3. Clear extension storage and reload
4. Check browser console for specific error messages