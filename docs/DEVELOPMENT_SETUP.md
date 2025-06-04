# Development Setup Guide

## Environment Configuration

The extension supports separate configurations for development and production environments.

### Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| Extension Name | "home0 for Zillow (DEV)" | "home0 for Zillow" |
| API Endpoint | http://localhost:8787 | https://api.home0.xyz |
| Mock Auth | Enabled | Disabled |
| Debug Logging | Enabled | Disabled |
| Manifest | manifest.dev.json | manifest.prod.json |

### Build Commands

```bash
# Development build (with hot reload)
npm run dev

# Development build (one-time)
npm run build:dev

# Production build
npm run build
```

### Local Development Setup

1. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

2. **Add your Clerk publishable key to `.env`**
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

3. **Start local API server (if working on API)**
   ```bash
   # In your Cloudflare Worker directory
   wrangler dev --port 8787
   ```

4. **Build and load extension**
   ```bash
   npm run dev
   ```

5. **Load in Chrome**
   - Open `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `dist` folder

### Testing Production Build Locally

```bash
# Build production version
npm run build

# The extension in dist/ will connect to api.home0.xyz
# This is useful for testing against the production API
```

### Environment Detection

The extension automatically detects its environment based on:
- Build mode (`NODE_ENV`)
- Manifest key presence (dev builds don't have a key)

You can check the current environment in the console:
```javascript
// In background script or content script console
chrome.runtime.getManifest().name // Shows "(DEV)" suffix in development
```

### API Testing

Use the provided test page to verify API connectivity:
```bash
# For local development
open test-api.html

# Update the API_BASE in the file to test different endpoints
```

### Debugging Tips

1. **Check environment config**
   - Open extension background page
   - Console: `import('./shared/config/environment.js').then(m => console.log(m.environment))`

2. **View API requests**
   - Network tab in background page shows all API calls
   - Look for debug logs in console (dev mode only)

3. **Mock authentication**
   - In dev mode, you can use mock auth for testing
   - Set `VITE_ENABLE_MOCK_AUTH=true` in `.env`