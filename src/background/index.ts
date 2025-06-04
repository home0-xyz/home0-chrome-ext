// Background service worker for home0 Chrome extension
console.log('[BACKGROUND] Service worker starting...', new Date().toISOString());

import { MockAuthService, AuthStateManager } from '../shared/services/auth.service';
import { clerkAuthService } from '../shared/services/clerk-auth.service';
import { favoritesApiService } from '../shared/services/favorites-api.service';
import { Message, Property } from '../shared/types';
import { getClerkToken, isClerkAuthenticated } from './clerk-client';

console.log('[BACKGROUND] Imports completed');

const authService = new MockAuthService();

// Initialize services
console.log('[BACKGROUND] Initializing services...');
(async () => {
  try {
    await clerkAuthService.init();
    console.log('[BACKGROUND] Services initialized successfully');
  } catch (error) {
    console.error('[BACKGROUND] Failed to initialize services:', error);
  }
})();

// Listen for storage changes to update auth state
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.clerkAuth) {
    const newAuth = changes.clerkAuth.newValue;
    console.log('[Background] ClerkAuth storage changed:', {
      hasAuth: !!newAuth,
      hasUser: !!newAuth?.user,
      hasToken: !!newAuth?.token,
      tokenPreview: newAuth?.token ? newAuth.token.substring(0, 20) + '...' : 'none'
    });
    
    if (newAuth && newAuth.isAuthenticated && newAuth.user && newAuth.token) {
      console.log('[Background] Updating Clerk auth service with token');
      clerkAuthService.signIn(newAuth.user, newAuth.token);
    } else {
      console.log('[Background] Missing required auth data:', {
        isAuthenticated: newAuth?.isAuthenticated,
        hasUser: !!newAuth?.user,
        hasToken: !!newAuth?.token
      });
    }
  }
});

// Store current property info
let currentPropertyInfo: any = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('home0 extension installed');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request: any, sender, sendResponse) => {
  console.log('[BACKGROUND] Message received:', request.type, request);
  
  switch (request.type) {
    case 'LOGIN':
      handleLogin(request.payload, sendResponse);
      return true; // Keep channel open for async response
      
    case 'LOGOUT':
      handleLogout(sendResponse);
      return true;
      
    case 'CHECK_AUTH':
      handleCheckAuth(sendResponse);
      return true;
      
    case 'GET_CURRENT_USER':
      handleGetCurrentUser(sendResponse);
      return true;
      
    case 'OPEN_SIDEBAR':
      // Handle sidebar opening
      sendResponse({ success: true });
      break;
      
    case 'FAVORITE_PROPERTY':
      handleFavoriteProperty(request.payload, sendResponse);
      return true; // Keep channel open for async response
      
    case 'PROPERTY_PAGE_INFO':
      // Store property info from content script
      currentPropertyInfo = request;
      // Forward to sidebar iframe
      chrome.runtime.sendMessage({
        type: 'PROPERTY_INFO_UPDATE',
        isDetailPage: request.isDetailPage,
        property: request.property
      }).catch(() => {
        // Ignore if sidebar isn't open
      });
      sendResponse({ success: true });
      break;
      
    case 'GET_CURRENT_PROPERTY_INFO':
      // Return stored property info
      sendResponse({ 
        isDetailPage: currentPropertyInfo?.isDetailPage || false,
        property: currentPropertyInfo?.property || null 
      });
      break;
      
    case 'CLERK_AUTH_SUCCESS':
      // Handle Clerk authentication success
      console.log('Clerk auth success:', request.user);
      // Update Clerk auth service
      if (request.user && request.token) {
        clerkAuthService.signIn(request.user, request.token);
      }
      // Notify all tabs about auth state change
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'AUTH_STATE_CHANGED',
              isAuthenticated: true,
              user: request.user
            }).catch(() => {
              // Ignore errors for tabs that don't have our content script
            });
          }
        });
      });
      sendResponse({ success: true });
      break;
      
    case 'UNFAVORITE_PROPERTY':
      handleUnfavoriteProperty(request.payload, sendResponse);
      return true;
      
    case 'GET_FAVORITES':
      handleGetFavorites(sendResponse);
      return true;
      
    case 'DEBUG_AUTH':
      // Debug endpoint to check auth state
      (async () => {
        const storage = await chrome.storage.local.get(['clerkAuth']);
        const authState = clerkAuthService.getAuthState();
        const token = await clerkAuthService.getToken();
        
        sendResponse({
          storage: storage.clerkAuth,
          serviceState: authState,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 30) + '...' : 'null'
        });
      })();
      return true;
      
    case 'REFRESH_AUTH_TOKEN':
      // Open auth page to refresh token
      handleTokenRefresh();
      sendResponse({ success: true });
      break;
      
    case 'GET_CLERK_TOKEN':
      // Get fresh token from Clerk background client
      (async () => {
        try {
          const token = await getClerkToken();
          sendResponse({ success: true, token });
        } catch (error) {
          console.error('[Background] Failed to get Clerk token:', error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to get token' });
        }
      })();
      return true;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  return false;
});

// Authentication handlers
async function handleLogin(
  payload: { email: string; password: string }, 
  sendResponse: (response: any) => void
) {
  try {
    const result = await authService.login(payload.email, payload.password);
    
    if (result.success && result.token && result.user) {
      await AuthStateManager.saveAuthData(result.token, result.user);
      sendResponse({ success: true, user: result.user });
    } else {
      sendResponse({ success: false, error: result.error });
    }
  } catch (error) {
    sendResponse({ success: false, error: 'Login failed' });
  }
}

async function handleLogout(sendResponse: (response: any) => void) {
  try {
    await authService.logout();
    await AuthStateManager.clearAuthData();
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: 'Logout failed' });
  }
}

async function handleCheckAuth(sendResponse: (response: any) => void) {
  try {
    // Check both mock auth and Clerk auth
    const result = await chrome.storage.local.get(['isAuthenticated', 'clerkAuth']);
    const isAuthenticated = result.isAuthenticated || result.clerkAuth?.isAuthenticated || false;
    sendResponse({ isAuthenticated });
  } catch (error) {
    sendResponse({ isAuthenticated: false });
  }
}

async function handleGetCurrentUser(sendResponse: (response: any) => void) {
  try {
    const user = await AuthStateManager.getCurrentUser();
    sendResponse({ user });
  } catch (error) {
    sendResponse({ user: null });
  }
}

// Favorites handlers
async function handleFavoriteProperty(
  property: Property,
  sendResponse: (response: any) => void
) {
  try {
    await favoritesApiService.addFavorite(property);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to favorite property:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to favorite property' });
  }
}

async function handleUnfavoriteProperty(
  payload: { zpid: string },
  sendResponse: (response: any) => void
) {
  try {
    await favoritesApiService.removeFavorite(payload.zpid);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to unfavorite property:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to unfavorite property' });
  }
}

async function handleGetFavorites(sendResponse: (response: any) => void) {
  try {
    const favorites = await favoritesApiService.getAllFavorites();
    sendResponse({ success: true, favorites });
  } catch (error) {
    console.error('Failed to get favorites:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Failed to get favorites' });
  }
}

// Handle token refresh by opening auth page
async function handleTokenRefresh() {
  try {
    // Check if auth page is already open
    const authUrl = chrome.runtime.getURL('src/auth/index.html');
    const tabs = await chrome.tabs.query({ url: authUrl });
    
    if (tabs.length > 0 && tabs[0].id) {
      // Auth page already open, just focus it
      chrome.tabs.update(tabs[0].id, { active: true });
      // Send message to auth page to refresh token
      chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH_TOKEN' });
    } else {
      // Open auth page with refresh parameter
      chrome.tabs.create({ 
        url: authUrl + '?refresh=true',
        active: true 
      });
    }
  } catch (error) {
    console.error('Failed to handle token refresh:', error);
  }
}

export {};