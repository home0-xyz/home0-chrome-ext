// Clerk authentication service for Chrome extension
import type { UserResource } from '@clerk/types';

export interface ClerkAuthState {
  isAuthenticated: boolean;
  user: UserResource | null;
  token: string | null;
  tokenTimestamp: number;
}

class ClerkAuthService {
  private authState: ClerkAuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    tokenTimestamp: 0
  };

  // Initialize auth state from storage
  async init() {
    try {
      const stored = await chrome.storage.local.get(['clerkAuth']);
      console.log('[ClerkAuthService] Initializing, found stored auth:', {
        hasClerkAuth: !!stored.clerkAuth,
        hasToken: !!stored.clerkAuth?.token,
        tokenPreview: stored.clerkAuth?.token ? stored.clerkAuth.token.substring(0, 20) + '...' : 'none'
      });
      
      if (stored.clerkAuth) {
        // Make sure we extract the properties correctly
        this.authState = {
          isAuthenticated: stored.clerkAuth.isAuthenticated || false,
          user: stored.clerkAuth.user || null,
          token: stored.clerkAuth.token || null,
          tokenTimestamp: stored.clerkAuth.tokenTimestamp || 0
        };
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }

  // Update auth state and persist to storage
  async updateAuthState(state: Partial<ClerkAuthState>) {
    this.authState = { ...this.authState, ...state };
    try {
      await chrome.storage.local.set({ clerkAuth: this.authState });
      // Notify other parts of the extension
      chrome.runtime.sendMessage({
        type: 'CLERK_AUTH_STATE_CHANGED',
        authState: this.authState
      });
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  // Get current auth state
  getAuthState(): ClerkAuthState {
    return this.authState;
  }

  // Sign in (called from sidebar with Clerk data)
  async signIn(user: UserResource, token: string) {
    await this.updateAuthState({
      isAuthenticated: true,
      user,
      token,
      tokenTimestamp: Date.now()
    });
  }

  // Sign out
  async signOut() {
    await this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      tokenTimestamp: 0
    });
  }

  // Get auth token for API calls
  async getToken(): Promise<string | null> {
    try {
      if (!this.authState.isAuthenticated || !this.authState.token) {
        console.log('[ClerkAuthService] Not authenticated or no token available');
        return null;
      }
      
      // Check if token is expired (simple check - tokens are valid for 60 seconds)
      const tokenAge = Date.now() - this.authState.tokenTimestamp;
      if (tokenAge > 50000) { // Refresh if older than 50 seconds
        console.log('[ClerkAuthService] Token might be expiring soon, consider refresh');
      }
      
      return this.authState.token;
    } catch (error) {
      console.error('[ClerkAuthService] Failed to get token:', error);
      return null;
    }
  }


  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Listen for auth state changes
  onAuthStateChange(callback: (state: ClerkAuthState) => void) {
    const listener = (request: any) => {
      if (request.type === 'CLERK_AUTH_STATE_CHANGED') {
        callback(request.authState);
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }
}

export const clerkAuthService = new ClerkAuthService();