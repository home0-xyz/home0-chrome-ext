# Switch to Mock Authentication (Temporary)

Due to Clerk's limitations with Chrome extension iframes, let's use mock authentication for now.

## Quick Switch

1. **Edit `.env` file**:
   ```
   VITE_USE_CLERK_AUTH=false
   ```

2. **Rebuild the extension**:
   ```bash
   npm run build
   ```

3. **Reload in Chrome**:
   - Go to chrome://extensions
   - Click refresh on the extension

## What This Does

- Uses a simple email/password mock authentication
- Stores auth state in Chrome storage
- No external API calls needed
- Works perfectly in iframe context

## Default Credentials

- Email: `user@example.com`
- Password: `password123`

## Benefits

1. **No 401 errors** - Works immediately
2. **Full functionality** - Can test all features
3. **Local storage** - No network dependencies
4. **Easy to switch back** - Just change the env variable

## Later: Production Auth Options

1. **Use Popup for Auth**: Have users authenticate in the extension popup (where Clerk works well), then use the sidebar for features
2. **Custom Backend**: Build your own auth endpoint that works with Chrome extensions
3. **Different Auth Provider**: Use a provider with better Chrome extension support

For now, mock auth will let you continue development without the Clerk issues.