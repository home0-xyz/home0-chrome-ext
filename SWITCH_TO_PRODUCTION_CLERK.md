# Switching to Production Clerk Instance

## Steps to Switch from Development to Production

### 1. Create a Production Instance in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click on your organization name (top-left)
3. Select "Create application"
4. Name it something like "home0-production"
5. Choose "Production" environment
6. Select your authentication methods (Email/Password recommended)

### 2. Get Your Production Keys

After creating the production instance:

1. Go to **API Keys** in the dashboard
2. Copy the **Publishable key** (starts with `pk_live_`)
3. Copy the **Secret key** (starts with `sk_live_`) - for backend use

### 3. Update Chrome Extension Configuration

1. Update `.env`:
```env
# Production Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY_HERE
```

2. Update the hardcoded key in `src/auth/index.tsx` if present:
```typescript
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_live_YOUR_KEY';
```

3. Update the hardcoded key in `src/background/clerk-client.ts`:
```typescript
const publishableKey = 'pk_live_YOUR_PRODUCTION_KEY_HERE';
```

### 4. Add Chrome Extension Origin to Production Instance

Run the script with your production secret key:
```bash
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY npm run clerk:add-origin
```

This will add `chrome-extension://imceomkapknekhogmhpncnjhcdhimiof` to allowed origins.

### 5. Update Backend Configuration

Your backend also needs the production keys:
- Update `CLERK_SECRET_KEY` to the production secret key
- Update `CLERK_PUBLISHABLE_KEY` to the production publishable key

### 6. Production API URL

If you're also switching to production API:
1. Update `src/shared/config/environment.ts`:
```typescript
production: {
  name: 'production',
  apiBaseUrl: 'https://api.home0.xyz', // Your production API
  clerkPublishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  enableDebugLogging: false,
}
```

### 7. Build and Test

```bash
npm run build
```

Then reload the extension and test signing up.

## Benefits of Production Instance

1. **No browser authentication required** - Works immediately
2. **Better performance** - Production infrastructure
3. **No development warnings**
4. **Ready for real users**

## Important Notes

- Production instances use `pk_live_` and `sk_live_` prefixes
- Development instances use `pk_test_` and `sk_test_` prefixes
- Make sure to keep production keys secure
- Don't commit production keys to git