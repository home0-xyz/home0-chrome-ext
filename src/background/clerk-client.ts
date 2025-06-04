import { clerkAuthService } from '../shared/services/clerk-auth.service';

// Initialize Clerk client for background service worker
const publishableKey = 'pk_test_Y29oZXJlbnQtYmVhci04MS5jbGVyay5hY2NvdW50cy5kZXYk';

// Export for use in background script
export async function getClerkToken() {
  try {
    console.log('[Clerk] Getting token from auth service');
    const token = await clerkAuthService.getToken();
    console.log('[Clerk] Token received:', token ? 'present' : 'null');
    return token;
  } catch (error) {
    console.error('[Clerk] Failed to get token:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isClerkAuthenticated() {
  try {
    const authState = clerkAuthService.getAuthState();
    return authState.isAuthenticated;
  } catch (error) {
    console.error('[Clerk] Failed to check auth:', error);
    return false;
  }
}