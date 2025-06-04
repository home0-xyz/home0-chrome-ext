# Migration Plan: Using Clerk's Official Chrome Extension Template

## Overview
We'll start fresh with Clerk's official Chrome extension template and then migrate our existing functionality.

## Step 1: Clone Clerk's Template
```bash
# Create a new directory for the fresh start
cd ~/Projects
git clone https://github.com/clerk/clerk-chrome-extension-starter.git home0-chrome-ext-v2

# Or use their recommended approach
npx create-clerk-app@latest --template chrome-extension
```

## Step 2: Features to Migrate

### Core Features
1. **Zillow Integration**
   - Property detection (`src/content/property-detector.ts`)
   - Detail page handler (`src/content/detail-page-handler.ts`)
   - Sidebar injection (`src/content/sidebar-injector.ts`)

2. **Favorites System**
   - API service (`src/shared/services/api.service.ts`)
   - Favorites service (`src/shared/services/favorites.service.ts`)
   - Favorites UI components

3. **Sidebar UI**
   - Sidebar app (`src/sidebar/App.tsx`)
   - All sidebar components
   - Tailwind + shadcn/ui setup

4. **API Integration**
   - Backend communication
   - CRUD operations for favorites
   - Environment configuration

### Key Files to Migrate
```
src/
├── content/
│   ├── property-detector.ts
│   ├── detail-page-handler.ts
│   ├── sidebar-injector.ts
│   └── favorite-button.ts
├── sidebar/
│   ├── App.tsx
│   ├── components/
│   └── hooks/
├── shared/
│   ├── services/
│   │   ├── api.service.ts
│   │   └── favorites.service.ts
│   ├── types/
│   └── utils/
└── background/
    └── (merge with Clerk's background script)
```

## Step 3: Configuration Updates

1. **Manifest.json**
   - Keep Clerk's auth setup
   - Add our content script permissions
   - Add Zillow host permissions

2. **Environment Variables**
   - Clerk keys (from their setup)
   - API endpoint configuration

3. **Build Process**
   - Integrate our Vite config
   - Add our build scripts

## Step 4: Testing Checklist

- [ ] Clerk authentication works
- [ ] Extension loads on Zillow
- [ ] Property detection works
- [ ] Sidebar opens/closes
- [ ] Favorites can be added/removed
- [ ] API communication works
- [ ] Data persists correctly

## Benefits of This Approach

1. **Proven Auth Setup** - Clerk's template handles all the auth edge cases
2. **Proper Configuration** - Correct manifest setup for Clerk
3. **Best Practices** - Following Clerk's recommended patterns
4. **Easier Debugging** - Starting from a working base

## Next Steps

1. Clone the Clerk template
2. Get basic auth working
3. Gradually migrate our features
4. Test each feature as we go