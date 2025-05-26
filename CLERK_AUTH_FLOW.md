# Clerk Authentication Flow for Chrome Extension

## How It Works

Since Clerk has issues with iframes in Chrome extensions, we've implemented a redirect flow:

### 1. User Clicks Sign In
- In the sidebar (iframe), user sees a "Sign In / Sign Up" button
- Clicking opens a new tab with the extension's auth page

### 2. Authentication Page
- URL: `chrome-extension://ofildlgdeggjekidmehocamopeglfmle/auth/index.html`
- This page runs in the extension context (not in an iframe)
- Clerk works perfectly here because it's a regular extension page
- Users can sign in with Google, email, or sign up

### 3. After Successful Auth
- Auth page saves the user data to Chrome storage
- Sends a message to the background script
- Background script notifies all tabs about the auth state change
- Auth page shows success message and closes automatically

### 4. Return to Zillow
- The sidebar detects the auth state change via Chrome storage
- Updates to show the user profile and enable features
- User can now favorite properties

## Benefits

1. **Works Around Clerk Limitations**: No more 401 errors
2. **Better UX**: Full-page auth experience instead of cramped sidebar
3. **Secure**: Uses Clerk's full security features
4. **Persistent**: Auth state saved in Chrome storage

## Technical Details

### Files Involved
- `/src/auth/index.tsx` - Authentication page component
- `/src/sidebar/components/ClerkSignIn.tsx` - Sign in button that opens auth page
- `/src/sidebar/hooks/useClerkAuth.tsx` - Hook that reads auth from storage
- `/src/background/index.ts` - Handles auth success messages

### Chrome Permissions Required
- `tabs` - To open the auth page in a new tab
- `storage` - To persist auth state
- `cookies` - For Clerk session management

### Testing
1. Reload extension in Chrome
2. Go to any Zillow property
3. Open sidebar with "h0" button
4. Click "Sign In / Sign Up"
5. Complete authentication in new tab
6. Return to Zillow - you should be logged in!

## Future Improvements

1. **Auto-close timing**: Adjust how long success message shows
2. **Deep linking**: Return to specific property after auth
3. **Popup auth**: Could also add auth to extension popup
4. **Session refresh**: Handle token expiration gracefully