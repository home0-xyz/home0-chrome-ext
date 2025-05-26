# Technical Architecture Document
## home0 Chrome Extension

### Overview

This document outlines the technical architecture for the home0 Chrome extension that integrates with Zillow to provide property favoriting and AI-powered insights.

### Architecture Principles

1. **Minimal Permissions** - Request only necessary Chrome permissions
2. **Secure by Design** - All data transmission encrypted, auth tokens never exposed
3. **Performance First** - Lightweight, non-blocking operations
4. **Maintainable** - Clear separation of concerns, modular design
5. **User Privacy** - No unnecessary data collection or tracking

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Chrome Browser                        │
├─────────────────────────────────────────────────────────────┤
│                    Chrome Extension                          │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Background      │  │Content Script│  │    Sidebar     │ │
│  │  Service Worker  │  │  (Injected)  │  │  (React App)   │ │
│  └────────┬─────────┘  └──────┬───────┘  └────────┬───────┘ │
│           │                    │                    │         │
│           └────────────────────┴────────────────────┘         │
│                              │                                │
├──────────────────────────────┼────────────────────────────────┤
│                              │ HTTPS                          │
│                              ↓                                │
│                   ┌─────────────────────┐                     │
│                   │   Clerk.js Auth     │                     │
│                   └──────────┬──────────┘                     │
│                              │ JWT                            │
│                              ↓                                │
│              ┌───────────────────────────────┐                │
│              │   Cloudflare Workers API      │                │
│              │   ┌─────────────────────┐     │                │
│              │   │  /api/favorites/*   │     │                │
│              │   └──────────┬──────────┘     │                │
│              └──────────────┼────────────────┘                │
│                             │                                 │
│              ┌──────────────┴────────────────┐                │
│              │    Cloudflare D1 Database     │                │
│              │    (favorites, user_prefs)    │                │
│              └───────────────────────────────┘                │
└───────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. Background Service Worker (`background.js`)
**Purpose:** Central message hub and API communication

**Responsibilities:**
- Handle authentication state
- Manage API requests to Cloudflare Workers
- Chrome storage management
- Message routing between components

**Key APIs:**
```javascript
// Message handlers
chrome.runtime.onMessage
chrome.runtime.onInstalled

// Storage
chrome.storage.local

// Auth
chrome.identity (if needed for OAuth flow)
```

#### 2. Content Script (`content.js`)
**Purpose:** Inject UI elements into Zillow pages

**Responsibilities:**
- Detect Zillow property pages AND search results
- Extract zpid from URL or data attributes
- Inject favorite button on both property pages and search result cards
- Add visual effects (glow, heart fill)
- Communicate with sidebar

**DOM Manipulation:**
- MutationObserver for dynamic content
- Event delegation for click handlers
- CSS injection for styling

#### 3. Sidebar Component (`sidebar/`)
**Purpose:** Main user interface for viewing and managing favorites

**Tech Stack:**
- React 18
- Tailwind CSS for styling
- Vite for bundling

**Structure:**
```
sidebar/
├── index.html
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── SignIn.jsx
│   │   │   └── SignOut.jsx
│   │   ├── Favorites/
│   │   │   ├── FavoritesList.jsx
│   │   │   ├── FavoriteItem.jsx
│   │   │   └── EmptyState.jsx
│   │   └── Layout/
│   │       ├── Header.jsx
│   │       └── Sidebar.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFavorites.js
│   │   └── useChrome.js
│   └── utils/
│       ├── api.js
│       ├── chrome.js
│       └── constants.js
```

### Data Flow

#### Favoriting a Property
```
1. User clicks favorite button on Zillow
2. Content script captures:
   - zpid from URL
   - Current page URL
   - Basic property info (if visible)
3. Content script sends message to background worker
4. Background worker:
   - Validates auth token
   - Makes API call to POST /api/favorites
   - Updates local cache
5. Background worker notifies sidebar
6. Sidebar updates UI with new favorite
7. Content script shows visual confirmation
```

#### Authentication Flow
```
1. User clicks sign in
2. Sidebar renders Clerk's pre-built <SignIn /> component
3. Clerk handles the auth flow with their UI
4. On successful auth:
   - Clerk provides JWT/session token
   - Store token in chrome.storage.local
   - Set auth headers for all API requests
   - Fetch user's existing favorites
5. On sign out:
   - Use Clerk's <SignOut /> component
   - Clear stored tokens
   - Clear favorites cache
   - Reset UI to signed-out state
```

### API Design

#### Endpoints

**POST /api/favorites**
```json
Request:
{
  "zpid": "12345678",
  "url": "https://zillow.com/...",
  "metadata": {
    "address": "123 Main St",
    "price": 500000,
    "imageUrl": "https://..."
  }
}

Response:
{
  "id": "fav_123",
  "userId": "user_456",
  "zpid": "12345678",
  "url": "https://zillow.com/...",
  "createdAt": "2024-01-20T..."
}
```

**GET /api/favorites**
```json
Response:
{
  "favorites": [
    {
      "id": "fav_123",
      "zpid": "12345678",
      "url": "https://zillow.com/...",
      "metadata": {...},
      "createdAt": "2024-01-20T..."
    }
  ],
  "total": 15
}
```

**DELETE /api/favorites/:id**
```json
Response:
{
  "success": true,
  "id": "fav_123"
}
```

### Chrome Extension Manifest (V3)

```json
{
  "manifest_version": 3,
  "name": "home0 - Zillow Property Favorites",
  "version": "1.0.0",
  "description": "Save and analyze Zillow properties with AI-powered insights",
  "permissions": [
    "storage",
    "tabs"
  ],
  // Host permissions allow the extension to access these domains
  // Required for content script injection and API calls
  "host_permissions": [
    "https://*.zillow.com/*",
    "https://api.home0.xyz/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://*.zillow.com/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "web_accessible_resources": [
    {
      "resources": ["sidebar.html", "assets/*"],
      "matches": ["https://*.zillow.com/*"]
    }
  ]
}
```

### Security Considerations

1. **Authentication**
   - JWT tokens stored in chrome.storage.local (encrypted)
   - Tokens never exposed in content scripts
   - All API calls through background worker

2. **Content Security Policy**
   - Strict CSP for extension pages
   - No inline scripts
   - No external script loading except Clerk.js

3. **Data Privacy**
   - No PII collection beyond user ID
   - Property data stays on Cloudflare
   - No tracking or analytics in MVP

### Performance Optimization

1. **Lazy Loading**
   - Load sidebar only when needed
   - Paginate favorites list
   - Virtual scrolling for large lists

2. **Caching Strategy**
   - Cache favorites in chrome.storage.local
   - Invalidate on user actions
   - Background sync when online

3. **Bundle Size**
   - Code splitting for sidebar app
   - Tree shaking unused code
   - Minimize external dependencies

### Development Setup

```bash
# Install dependencies
npm install

# Development build with watch
npm run dev

# Production build
npm run build

# Load extension in Chrome
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the dist/ folder
```

### Testing Strategy

1. **Unit Tests**
   - Jest for business logic
   - React Testing Library for components
   - Mock Chrome APIs

2. **Integration Tests**
   - Test API communication
   - Test message passing
   - Test auth flow

3. **E2E Tests**
   - Puppeteer for full flow testing
   - Test on actual Zillow pages
   - Verify favorite synchronization

### Deployment

1. **Build Process**
   - GitHub Actions for CI/CD
   - Automated testing
   - Version bumping

2. **Chrome Web Store**
   - Automated submission
   - Staged rollout
   - Error monitoring

### Monitoring & Analytics

1. **Error Tracking**
   - Sentry for error reporting
   - Background worker errors
   - API failures

2. **Usage Metrics** (Post-MVP)
   - Favorites per user
   - Feature adoption
   - Performance metrics

### Future Technical Considerations

1. **Offline Support**
   - Queue favorites when offline
   - Sync when connection restored

2. **Real-time Updates**
   - WebSocket for live updates
   - Multi-device sync

3. **AI Integration**
   - Streaming AI responses
   - Report caching
   - Feedback loop

This architecture provides a solid foundation for the home0 Chrome extension while maintaining flexibility for future enhancements.