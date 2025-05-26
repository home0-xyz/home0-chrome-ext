// Clerk authentication service for Chrome extension
import type { UserResource } from '@clerk/types';

export interface ClerkAuthState {
  isAuthenticated: boolean;
  user: UserResource | null;
  token: string | null;
}

class ClerkAuthService {
  private authState: ClerkAuthState = {
    isAuthenticated: false,
    user: null,
    token: null
  };

  // Initialize auth state from storage
  async init() {
    try {
      const stored = await chrome.storage.local.get(['clerkAuth']);
      if (stored.clerkAuth) {
        this.authState = stored.clerkAuth;
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
      token
    });
  }

  // Sign out
  async signOut() {
    await this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  // Get auth token for API calls
  getToken(): string | null {
    return this.authState.token;
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