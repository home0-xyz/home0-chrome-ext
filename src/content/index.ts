// Content script for Zillow pages
import { checkAuthStatus, onAuthStateChanged } from '@/shared/utils/auth';
import { getSidebarState, onSidebarStateChanged, saveSidebarState } from '@/shared/utils/sidebar-state';
import { SidebarInjector } from './sidebar-injector';
import { ToggleButton } from './toggle-button';
import './styles.css';

console.log('home0 content script loaded');

let isAuthenticated = false;
let sidebar: SidebarInjector | null = null;
let toggleButton: ToggleButton | null = null;

// Property info interface
interface PropertyInfo {
  zpid: string;
  url: string;
  address: string;
  price: string;
  details?: {
    beds?: number;
    baths?: number;
    sqft?: number;
  };
  imageUrl?: string;
}

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
  
  // Send initial property info
  sendPropertyInfoToBackground();
  
  // Handle Zillow's single-page navigation
  let currentUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('Zillow navigation detected:', currentUrl);
      
      // Send updated property info after navigation
      setTimeout(sendPropertyInfoToBackground, 1000);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Function to extract property info from detail page
function extractPropertyInfo(): PropertyInfo | null {
  // Check if we're on a detail page
  if (!window.location.pathname.includes('/homedetails/')) {
    return null;
  }

  // Extract ZPID from URL
  const zpidMatch = window.location.pathname.match(/(\d+)_zpid/);
  if (!zpidMatch) return null;

  const zpid = zpidMatch[1];

  // Try multiple selectors for property details
  const addressElement = document.querySelector('h1[data-test="street-address"], h1[class*="street-address"]');
  const cityStateZipElement = document.querySelector('[data-test="address-citystatezip"], [class*="citystatezip"]');
  
  // Price can be in different places
  const priceElement = document.querySelector('[data-test="home-details-chip"] span[class*="Text"], span[data-testid="price"], .summary-container span[class*="Text"]');
  
  // Extract beds/baths/sqft
  const bedBathContainer = document.querySelector('[data-test="bed-bath-sqft-text-container"], [class*="bed-bath-item"]');
  let beds = 0, baths = 0, sqft = 0;
  
  if (bedBathContainer) {
    const spans = bedBathContainer.querySelectorAll('span');
    spans.forEach(span => {
      const text = span.textContent || '';
      if (text.includes('bd')) {
        beds = parseInt(text) || 0;
      } else if (text.includes('ba')) {
        baths = parseFloat(text) || 0;
      } else if (text.includes('sqft')) {
        sqft = parseInt(text.replace(/,/g, '')) || 0;
      }
    });
  }

  // Extract image
  const imageElement = document.querySelector('img[alt*="property photo"], img[class*="media-stream-photo"]') as HTMLImageElement;

  const address = [
    addressElement?.textContent,
    cityStateZipElement?.textContent
  ].filter(Boolean).join(' ').trim();

  return {
    zpid,
    url: window.location.href,
    address: address || 'Unknown Address',
    price: priceElement?.textContent || 'Price not available',
    details: {
      beds,
      baths,
      sqft
    },
    imageUrl: imageElement?.src
  };
}

// Send property info to background script
function sendPropertyInfoToBackground() {
  const propertyInfo = extractPropertyInfo();
  
  // Send message to background script
  chrome.runtime.sendMessage({
    type: 'PROPERTY_PAGE_INFO',
    isDetailPage: !!propertyInfo,
    property: propertyInfo
  });
}

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_SIDEBAR' && sidebar) {
    sidebar.toggle();
    toggleButton?.setOpen(sidebar.isVisible());
    sendResponse({ success: true });
  } else if (request.type === 'GET_CURRENT_PROPERTY') {
    const propertyInfo = extractPropertyInfo();
    sendResponse({ property: propertyInfo });
  }
  return true;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (sidebar) {
    // Save final state
    saveSidebarState(sidebar.isVisible());
  }
});

export {};