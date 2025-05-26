// Content script for Zillow pages
import { checkAuthStatus, onAuthStateChanged } from '@/shared/utils/auth';
import { getSidebarState, onSidebarStateChanged, saveSidebarState } from '@/shared/utils/sidebar-state';
import { SidebarInjector } from './sidebar-injector';
import { ToggleButton } from './toggle-button';

console.log('home0 content script loaded');

let isAuthenticated = false;
let sidebar: SidebarInjector | null = null;
let toggleButton: ToggleButton | null = null;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

async function initialize() {
  console.log('Initializing home0 extension on Zillow');
  
  // Check initial auth status
  isAuthenticated = await checkAuthStatus();
  console.log('User authenticated:', isAuthenticated);
  
  // Listen for auth state changes
  const unsubscribe = onAuthStateChanged((newAuthState) => {
    console.log('Auth state changed:', newAuthState);
    isAuthenticated = newAuthState;
    
    // Update UI based on auth state
    updateUIForAuthState();
  });
  
  // Inject sidebar
  sidebar = new SidebarInjector();
  
  // Create toggle button
  toggleButton = new ToggleButton(() => {
    if (sidebar) {
      sidebar.toggle();
      toggleButton?.setOpen(sidebar.isVisible());
    }
  });
  
  
  // Restore sidebar state
  const savedState = await getSidebarState();
  if (savedState && savedState.isOpen) {
    sidebar.open();
    toggleButton?.setOpen(true);
  }
  
  // Listen for sidebar state changes from other tabs
  onSidebarStateChanged((state) => {
    if (state && sidebar && toggleButton) {
      if (state.isOpen && !sidebar.isVisible()) {
        sidebar.open();
        toggleButton.setOpen(true);
      } else if (!state.isOpen && sidebar.isVisible()) {
        sidebar.close();
        toggleButton.setOpen(false);
      }
    }
  });
  
  // Handle Zillow's single-page navigation
  let currentUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('Zillow navigation detected:', currentUrl);
      // Sidebar and toggle button persist across navigation
      // Just log for now, components remain in DOM
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Will add favorite button injection here
  
  // Initial UI update
  updateUIForAuthState();
}

function updateUIForAuthState() {
  console.log('Updating UI for auth state:', isAuthenticated);
  // Will update sidebar content based on auth state
}

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_SIDEBAR' && sidebar) {
    sidebar.toggle();
    toggleButton?.setOpen(sidebar.isVisible());
    sendResponse({ success: true });
  }
  return false;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (sidebar) {
    // Save final state
    saveSidebarState(sidebar.isVisible());
  }
});

export {};