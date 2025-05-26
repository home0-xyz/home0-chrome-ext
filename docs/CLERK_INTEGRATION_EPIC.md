# Clerk Authentication Integration Epic

## Overview
Replace the mock authentication system with Clerk authentication, providing secure user management and seamless integration between the Chrome extension and the home0 web application.

## Background
The current implementation uses a mock authentication service (`MockAuthService`) that stores credentials in chrome.storage.local. This epic will replace it with Clerk's Chrome Extension SDK, which provides:
- Secure authentication with JWT tokens
- User management and profiles
- Sync Host feature for sharing auth state with web app
- Built-in React components and hooks

## Technical Considerations

### Chrome Extension Limitations
1. **OAuth/SAML**: Not supported due to redirect requirements
2. **Email Links**: Challenging due to popup closure behavior
3. **Content Scripts**: Require special handling with `createClerkClient()`
4. **Origin Restrictions**: Content scripts can run on any domain

### Architecture Changes
1. Replace `MockAuthService` with Clerk client
2. Update `AuthStateManager` to use Clerk session management
3. Implement Sync Host for web app integration
4. Update background worker message handlers
5. Replace custom auth UI with Clerk components

## User Stories

### Story 1: Install and Configure Clerk SDK
**As a** developer  
**I want to** install and configure the Clerk Chrome Extension SDK  
**So that** I can start implementing Clerk authentication

**Acceptance Criteria:**
- [ ] Install `@clerk/chrome-extension` package
- [ ] Create Clerk application in dashboard
- [ ] Configure environment variables:
  - `PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_FRONTEND_API`
  - `PLASMO_PUBLIC_CLERK_SYNC_HOST`
- [ ] Configure stable CRX ID for consistent extension ID
- [ ] Update TypeScript types for Clerk

**Technical Tasks:**
1. Run `npm install @clerk/chrome-extension`
2. Create `.env.development` and `.env.production` files
3. Update `manifest.json` with required permissions
4. Configure webpack/vite to handle environment variables
5. Add Clerk types to `tsconfig.json`

### Story 2: Implement Clerk Provider and Core Authentication
**As a** developer  
**I want to** replace the mock auth service with Clerk  
**So that** users can authenticate securely

**Acceptance Criteria:**
- [ ] Wrap sidebar app with `ClerkProvider`
- [ ] Replace `MockAuthService` with Clerk client
- [ ] Update `AuthStateManager` to use Clerk session
- [ ] Implement `createClerkClient()` for background worker
- [ ] Handle authentication state changes

**Technical Tasks:**
1. Update `src/sidebar/index.tsx`:
   ```typescript
   import { ClerkProvider } from '@clerk/chrome-extension'
   
   <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
     <App />
   </ClerkProvider>
   ```

2. Create `src/shared/services/clerk.service.ts`:
   ```typescript
   import { createClerkClient } from '@clerk/chrome-extension'
   
   export const clerkClient = createClerkClient({
     publishableKey: process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY!,
   })
   ```

3. Update background worker authentication handlers
4. Implement session token retrieval for API calls

### Story 3: Replace Authentication UI Components
**As a** user  
**I want to** sign in using Clerk's UI components  
**So that** I have a familiar and secure authentication experience

**Acceptance Criteria:**
- [ ] Replace `SignInForm` with Clerk's `<SignIn />` component
- [ ] Update `UserProfile` to use Clerk's user data
- [ ] Implement sign out functionality
- [ ] Add loading states during authentication
- [ ] Handle authentication errors gracefully

**Technical Tasks:**
1. Replace custom sign-in form:
   ```typescript
   import { SignIn } from '@clerk/chrome-extension'
   
   <SignIn routing="path" path="/sign-in" />
   ```

2. Update user profile component to use `useUser()` hook
3. Implement `useAuth()` hook wrapper for Clerk
4. Add error boundaries for auth failures

### Story 4: Implement Sync Host for Web App Integration
**As a** user  
**I want to** share authentication between the web app and extension  
**So that** I don't need to sign in twice

**Acceptance Criteria:**
- [ ] Configure Sync Host in Clerk dashboard
- [ ] Implement sync host client in extension
- [ ] Test authentication sync from web app
- [ ] Handle sync failures gracefully
- [ ] Document sync host setup

**Technical Tasks:**
1. Add allowed origins in Clerk dashboard
2. Configure `PLASMO_PUBLIC_CLERK_SYNC_HOST`
3. Implement sync detection in background worker
4. Add sync status indicator in UI
5. Handle offline/sync failure scenarios

### Story 5: Update API Integration for Clerk Tokens
**As a** developer  
**I want to** use Clerk JWT tokens for API authentication  
**So that** the backend can verify user identity

**Acceptance Criteria:**
- [ ] Update API client to use Clerk session tokens
- [ ] Implement token refresh logic
- [ ] Update Cloudflare Worker to verify Clerk JWTs
- [ ] Handle token expiration gracefully
- [ ] Test API calls with real tokens

**Technical Tasks:**
1. Update `src/services/api/client.ts`:
   ```typescript
   const token = await clerkClient.session?.getToken()
   ```

2. Add Clerk JWT verification to Cloudflare Worker
3. Implement automatic token refresh
4. Update error handling for 401 responses
5. Add retry logic with fresh tokens

### Story 6: Implement React Router for Authentication Flow
**As a** user  
**I want to** navigate between sign-in and app screens  
**So that** I have a smooth authentication experience

**Acceptance Criteria:**
- [ ] Add React Router to sidebar app
- [ ] Implement protected routes
- [ ] Add navigation guards for unauthenticated users
- [ ] Handle deep linking from web app
- [ ] Implement smooth transitions

**Technical Tasks:**
1. Install `react-router-dom`
2. Configure routes:
   - `/sign-in` - Sign in page
   - `/sign-up` - Sign up page
   - `/` - Main app (protected)
3. Implement `<AuthGuard>` component
4. Add route-based code splitting
5. Handle browser back/forward in popup

### Story 7: Migration and Cleanup
**As a** developer  
**I want to** remove mock authentication code  
**So that** the codebase is clean and maintainable

**Acceptance Criteria:**
- [ ] Remove `MockAuthService` class
- [ ] Remove mock authentication UI components
- [ ] Update tests to use Clerk mocks
- [ ] Update documentation
- [ ] Clean up unused dependencies

**Technical Tasks:**
1. Delete `src/shared/services/auth.service.ts`
2. Remove mock sign-in form components
3. Update unit tests with Clerk test utilities
4. Update README with Clerk setup instructions
5. Remove unused auth-related npm packages

### Story 8: Production Configuration and Security
**As a** developer  
**I want to** configure Clerk for production  
**So that** the extension is secure and ready for release

**Acceptance Criteria:**
- [ ] Configure production Clerk instance
- [ ] Set up proper CORS policies
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Configure error tracking

**Technical Tasks:**
1. Create production Clerk application
2. Configure production environment variables
3. Set up Sentry error tracking for auth failures
4. Implement CSP headers for extension
5. Add authentication analytics

## Testing Strategy

### Unit Tests
- Mock Clerk hooks and components
- Test authentication state management
- Test API client with mock tokens
- Test error handling scenarios

### Integration Tests
- Test sign-in flow end-to-end
- Test sync host functionality
- Test token refresh mechanism
- Test offline behavior

### Manual Testing Checklist
- [ ] Sign in with email/password
- [ ] Sign out functionality
- [ ] Session persistence across browser restarts
- [ ] Sync with web app authentication
- [ ] API calls with authentication
- [ ] Error states and messages
- [ ] Offline functionality

## Rollback Plan
If Clerk integration fails:
1. Keep mock auth service in a feature branch
2. Use feature flags to toggle between mock and Clerk
3. Maintain backward compatibility with existing tokens
4. Document rollback procedure

## Success Metrics
- Zero authentication-related errors in production
- < 2 second sign-in time
- 100% uptime for authentication service
- Successful sync rate > 95%
- User satisfaction with auth experience

## Dependencies
- Clerk Chrome Extension SDK
- React Router for navigation
- Environment variable management
- Stable extension ID configuration

## Timeline Estimate
- **Total Duration**: 2-3 sprints (4-6 weeks)
- **Story 1-2**: Sprint 1 (Core integration)
- **Story 3-5**: Sprint 2 (UI and API updates)
- **Story 6-8**: Sprint 3 (Router, cleanup, production)

## Risks and Mitigations
1. **Risk**: Chrome extension limitations with OAuth
   - **Mitigation**: Use email/password auth, document limitations

2. **Risk**: Sync host complexity
   - **Mitigation**: Provide detailed setup documentation, fallback options

3. **Risk**: Token expiration during long sessions
   - **Mitigation**: Implement robust token refresh, offline queue

4. **Risk**: Breaking changes in Clerk SDK
   - **Mitigation**: Pin SDK version, monitor changelog