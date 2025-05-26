# Clerk Authentication Setup

This guide explains how to set up Clerk authentication for the home0 Chrome extension.

## Prerequisites

1. Create a Clerk account at https://clerk.com
2. Create a new application in the Clerk dashboard
3. Get your publishable key from the API Keys section

## Configuration

### 1. Add your Clerk publishable key

Edit the `.env` file in the project root:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

Replace `pk_test_YOUR_KEY_HERE` with your actual publishable key from Clerk.

### 2. Enable Clerk authentication

There are two ways to enable Clerk auth:

#### Option A: Environment variable (recommended)

Add to your `.env` file:
```bash
VITE_USE_CLERK_AUTH=true
```

#### Option B: Code configuration

Edit `src/sidebar/config/auth.config.ts`:
```typescript
export const USE_CLERK_AUTH = true;
```

### 3. Configure Clerk settings

In your Clerk dashboard:

1. **Allowed origins**: Add your Chrome extension URLs
   - `chrome-extension://YOUR_EXTENSION_ID`
   - `http://localhost:3000` (for development)

2. **Authentication methods**: Enable the methods you want
   - Email/password
   - Social logins (Google, GitHub, etc.)
   - Magic links

3. **User metadata**: Configure any custom fields you need

## Development

### Testing with mock auth

By default, the extension uses mock authentication for easier development. To test with mock auth:

1. Keep `USE_CLERK_AUTH = false` in the config
2. Use any email/password combination to sign in

### Testing with Clerk

1. Set `VITE_USE_CLERK_AUTH=true` in `.env`
2. Run `npm run dev`
3. The Clerk sign-in UI will appear in the sidebar

## Chrome Extension Considerations

### Content Security Policy

Clerk requires certain CSP rules. These are already configured in `manifest.json`:

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'; connect-src https://*.clerk.accounts.dev https://clerk.YOUR_DOMAIN.com;"
}
```

### Background Script

The background script is configured to handle both mock and Clerk authentication states. It checks both storage keys when determining auth status.

### Token Management

Clerk tokens are stored in `chrome.storage.local` under the `clerkAuth` key. The token is automatically refreshed by Clerk and synced to storage.

## API Integration

When making API calls to your backend:

```typescript
import { clerkAuthService } from '@/shared/services/clerk-auth.service';

const token = clerkAuthService.getToken();
const response = await fetch('https://api.home0.xyz/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Troubleshooting

### "Missing Publishable Key" error

Make sure your `.env` file contains the correct key and you've restarted the dev server.

### Authentication not persisting

Check that the Clerk auth state is being saved to `chrome.storage.local`. You can inspect this in Chrome DevTools.

### CORS errors

Ensure your Clerk application has the correct allowed origins configured.

## Next Steps

1. Set up Clerk webhooks for user events
2. Configure user metadata for storing home0-specific data
3. Implement Clerk Sync Host for sharing auth with the web app
4. Add organization support if needed