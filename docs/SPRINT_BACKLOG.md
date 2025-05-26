# Sprint Backlog
## home0 Chrome Extension

### Development Order
1. Authentication (with stubbed data)
2. Sidebar UI (with stubbed data)
3. Favorite Button Injection
4. API Integration (replace stubs)

---

## Epic 1: Project Setup & Foundation

### Story 1.1: Initialize Chrome Extension Project
**As a** developer  
**I want** to set up the basic Chrome extension structure  
**So that** I have a working foundation to build upon

**Acceptance Criteria:**
- [ ] Manifest V3 file created with proper permissions
- [ ] Basic folder structure established
- [ ] Extension loads in Chrome developer mode
- [ ] Background service worker runs without errors
- [ ] Build system configured (Vite)

**Technical Notes:**
- Use TypeScript from the start
- Configure Vite for multiple entry points (background, content, sidebar)

---

### Story 1.2: Setup Development Environment
**As a** developer  
**I want** to configure hot reload and development tools  
**So that** I can develop efficiently

**Acceptance Criteria:**
- [ ] Hot reload works for all extension components
- [ ] TypeScript compilation works
- [ ] Source maps enabled for debugging
- [ ] npm scripts for dev/build/test configured

---

### Story 1.3: Install and Configure shadcn/ui
**As a** developer  
**I want** to setup shadcn/ui and Tailwind CSS  
**So that** I can use the design system

**Acceptance Criteria:**
- [ ] Tailwind CSS configured
- [ ] shadcn/ui initialized
- [ ] Required components installed (Card, Button, ScrollArea, Skeleton)
- [ ] Lucide icons available
- [ ] Theme matches UI specification

---

## Epic 2: Authentication (Stubbed)

### Story 2.1: Create Mock Auth Service
**As a** developer  
**I want** to create a mock authentication service  
**So that** I can develop auth flow without Clerk initially

**Acceptance Criteria:**
- [ ] Mock auth service with login/logout methods
- [ ] Mock user object structure defined
- [ ] Auth state persisted in chrome.storage.local
- [ ] Mock JWT token generation

**Technical Notes:**
```typescript
interface MockUser {
  id: string;
  email: string;
  name: string;
}

class MockAuthService {
  login(): Promise<MockUser>
  logout(): Promise<void>
  getUser(): Promise<MockUser | null>
  getToken(): Promise<string | null>
}
```

---

### Story 2.2: Build Auth UI Components
**As a** user  
**I want** to see sign in/out UI in the sidebar  
**So that** I can authenticate with home0

**Acceptance Criteria:**
- [ ] Sign in button/card displays when logged out
- [ ] User info displays when logged in
- [ ] Sign out button available when authenticated
- [ ] Loading states during auth operations
- [ ] Mock sign in immediately succeeds

---

### Story 2.3: Implement Auth State Management
**As a** developer  
**I want** auth state synchronized across extension components  
**So that** all parts know the current auth status

**Acceptance Criteria:**
- [ ] Auth state stored in chrome.storage.local
- [ ] Background worker manages auth state
- [ ] Content script can check auth status
- [ ] Sidebar updates when auth state changes
- [ ] Message passing for auth events works

---

## Epic 3: Sidebar UI (Stubbed Data)

### Story 3.1: Create Sidebar Container
**As a** user  
**I want** a sidebar that opens on Zillow pages  
**So that** I can see my favorited properties

**Acceptance Criteria:**
- [ ] Sidebar injects and displays on zillow.com
- [ ] Sidebar has correct width (380px) and styling
- [ ] Close button works
- [ ] Sidebar persists across page navigation
- [ ] Sidebar auto-opens on Zillow

---

### Story 3.2: Build Favorites List with Mock Data
**As a** user  
**I want** to see a list of my favorite properties  
**So that** I can review what I've saved

**Acceptance Criteria:**
- [ ] Mock favorites data structure created
- [ ] Favorite cards display with all fields (image, address, price, date)
- [ ] Empty state shows when no favorites
- [ ] Scrollable list for many favorites
- [ ] Cards match UI specification

**Mock Data Structure:**
```typescript
interface MockFavorite {
  id: string;
  zpid: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  imageUrl: string;
  favoritedAt: Date;
  url: string;
}
```

---

### Story 3.3: Implement Favorite Card Actions
**As a** user  
**I want** to interact with my favorited properties  
**So that** I can view details or remove them

**Acceptance Criteria:**
- [ ] AI Report button shows (clicks log to console)
- [ ] Zillow link button opens property in new tab
- [ ] Remove button appears on hover
- [ ] Remove updates mock data and UI
- [ ] Action feedback (hover states, clicks)

---

### Story 3.4: Add Loading and Error States
**As a** user  
**I want** to see loading progress and errors  
**So that** I know what's happening

**Acceptance Criteria:**
- [ ] Skeleton loaders show while "fetching"
- [ ] Error state for failed "requests"
- [ ] Retry button on errors
- [ ] Proper error messages

---

## Epic 4: Favorite Button Injection

### Story 4.1: Detect Zillow Property Elements
**As a** developer  
**I want** to identify property cards and pages  
**So that** I can inject favorite buttons

**Acceptance Criteria:**
- [ ] Detect property detail pages
- [ ] Detect property cards in search results
- [ ] Extract zpid from URLs
- [ ] Extract zpid from card elements
- [ ] Handle dynamic content loading

---

### Story 4.2: Inject Favorite Buttons
**As a** user  
**I want** to see favorite buttons on Zillow properties  
**So that** I can save properties I like

**Acceptance Criteria:**
- [ ] Heart button appears on property cards
- [ ] Heart button appears on property pages
- [ ] Buttons positioned correctly
- [ ] Buttons don't break Zillow layout
- [ ] Multiple buttons don't inject on same element

---

### Story 4.3: Implement Favorite Button Functionality
**As a** user  
**I want** favorite buttons to save properties  
**So that** they appear in my sidebar

**Acceptance Criteria:**
- [ ] Click toggles favorited state
- [ ] Heart fills when favorited
- [ ] Property gets glow effect
- [ ] Updates mock favorites list
- [ ] Sidebar updates immediately
- [ ] Auth check before favoriting

---

### Story 4.4: Sync Favorite States
**As a** user  
**I want** favorite buttons to reflect current state  
**So that** I know what I've already saved

**Acceptance Criteria:**
- [ ] Buttons show filled heart for favorited properties
- [ ] State persists across page loads
- [ ] State syncs when sidebar changes
- [ ] Multiple buttons for same property sync

---

## Epic 5: API Integration

### Story 5.1: Replace Mock Auth with Clerk
**As a** developer  
**I want** to integrate real Clerk authentication  
**So that** users can actually sign in

**Acceptance Criteria:**
- [ ] Clerk SDK integrated
- [ ] Real sign in/out flow works
- [ ] JWT tokens properly stored
- [ ] User data from Clerk displayed
- [ ] Remove mock auth service

**Technical Notes:**
- Follow Clerk's Chrome extension guide
- Ensure proper redirect URIs

---

### Story 5.2: Create API Client
**As a** developer  
**I want** a centralized API client  
**So that** all API calls go through one place

**Acceptance Criteria:**
- [ ] API client class created
- [ ] Base URL configurable (api.home0.xyz)
- [ ] Auth headers automatically added
- [ ] Error handling standardized
- [ ] Request/response logging for debugging

---

### Story 5.3: Implement Favorites API Endpoints
**As a** developer  
**I want** to connect to real favorites API  
**So that** data persists on the backend

**Acceptance Criteria:**
- [ ] GET /api/favorites works
- [ ] POST /api/favorites works
- [ ] DELETE /api/favorites/:id works
- [ ] Error handling for failed requests
- [ ] Optimistic updates with rollback

---

### Story 5.4: Add Offline Support
**As a** user  
**I want** the extension to work offline  
**So that** I don't lose functionality

**Acceptance Criteria:**
- [ ] Queue favorites when offline
- [ ] Sync when back online
- [ ] Show offline indicator
- [ ] Local cache for favorites list
- [ ] Conflict resolution for syncing

---

## Epic 6: Polish & Production

### Story 6.1: Add Error Tracking
**As a** developer  
**I want** to track errors in production  
**So that** I can fix issues quickly

**Acceptance Criteria:**
- [ ] Sentry integration configured
- [ ] Errors logged with context
- [ ] User info excluded from logs
- [ ] Source maps uploaded

---

### Story 6.2: Performance Optimization
**As a** user  
**I want** the extension to be fast  
**So that** it doesn't slow down my browsing

**Acceptance Criteria:**
- [ ] Bundle size under 1MB
- [ ] Sidebar loads in <500ms
- [ ] No memory leaks
- [ ] Efficient DOM manipulation
- [ ] Virtual scrolling for long lists

---

### Story 6.3: Cross-browser Testing
**As a** user  
**I want** the extension to work reliably  
**So that** I can trust it with my data

**Acceptance Criteria:**
- [ ] Works on Chrome/Edge (same engine)
- [ ] Works with Zillow's mobile site
- [ ] Handles Zillow updates gracefully
- [ ] All features thoroughly tested
- [ ] Edge cases handled

---

### Story 6.4: Production Deployment
**As a** developer  
**I want** to deploy to Chrome Web Store  
**So that** users can install the extension

**Acceptance Criteria:**
- [ ] Production build created
- [ ] Icons and screenshots prepared
- [ ] Store listing written
- [ ] Privacy policy updated
- [ ] Extension published

---

## Definition of Done (All Stories)
- [ ] Code implemented and committed
- [ ] Unit tests written and passing
- [ ] Manual testing completed
- [ ] Code reviewed (self-review for solo dev)
- [ ] Documentation updated
- [ ] No console errors
- [ ] Follows UI specification