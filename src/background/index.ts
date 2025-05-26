// Background service worker for home0 Chrome extension
import { MockAuthService, AuthStateManager } from '../shared/services/auth.service';
import { Message } from '../shared/types';

const authService = new MockAuthService();

// Store current property info
let currentPropertyInfo: any = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('home0 extension installed');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request: any, sender, sendResponse) => {
  console.log('Message received:', request);
  
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
      // Handle favoriting property
      sendResponse({ success: true });
      break;
      
    case 'PROPERTY_PAGE_INFO':
      // Store property info from content script
      currentPropertyInfo = request;
      // Forward to sidebar iframe
      chrome.runtime.sendMessage({
        type: 'PROPERTY_INFO_UPDATE',
        isDetailPage: request.isDetailPage,
        property: request.property
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

export {};