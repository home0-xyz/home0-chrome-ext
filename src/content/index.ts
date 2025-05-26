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

  // Try multiple selectors for address - Zillow frequently changes these
  const addressSelectors = [
    'h1[data-test="street-address"]',
    'h1[class*="street-address"]',
    'h1[class*="Text-"]',
    '[data-test="property-summary-address"] h1',
    'h1'
  ];
  
  let addressElement: Element | null = null;
  for (const selector of addressSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (el.textContent?.match(/\d+\s+\w+/)) { // Has number + word (street pattern)
          addressElement = el;
          break;
        }
      }
      if (addressElement) break;
    } catch (e) {
      // Skip invalid selectors
    }
  }

  const cityStateZipSelectors = [
    '[data-test="address-citystatezip"]',
    '[class*="citystatezip"]',
    'h1 + span[class*="Text-"]',
    '[data-test="property-summary-address"] span'
  ];
  
  let cityStateZipElement: Element | null = null;
  for (const selector of cityStateZipSelectors) {
    cityStateZipElement = document.querySelector(selector);
    if (cityStateZipElement?.textContent?.match(/\d{5}/)) break; // Has a zip code
  }
  
  // Price selectors
  const priceSelectors = [
    '[data-test="home-details-chip"] span[class*="Text"]',
    'span[data-testid="price"]',
    '[data-test="home-price"] span',
    'span[class*="Text-"]',
    '.summary-container span[class*="Text"]',
    '[data-test="price"] span'
  ];
  
  let priceElement: Element | null = null;
  for (const selector of priceSelectors) {
    try {
      priceElement = document.querySelector(selector);
      if (priceElement?.textContent?.includes('$')) break;
    } catch (e) {
      // Skip invalid selectors
    }
  }
  
  // Extract beds/baths/sqft - try multiple approaches
  let beds = 0, baths = 0, sqft = 0;
  
  // Note: These selectors are defined but not used in the current approach
  // keeping them for potential future use
  
  // Try to find bed/bath/sqft in the page
  const allSpans = document.querySelectorAll('span');
  for (const span of allSpans) {
    const text = span.textContent || '';
    
    // Look for bed pattern
    if (!beds && text.match(/^\d+$/)) {
      const nextText = span.nextSibling?.textContent || '';
      const prevText = span.previousSibling?.textContent || '';
      if (nextText.includes('bd') || nextText.includes('bed') || prevText.includes('bd') || prevText.includes('bed')) {
        beds = parseInt(text) || 0;
      }
    }
    
    // Look for bath pattern
    if (!baths && text.match(/^\d+(?:\.\d+)?$/)) {
      const nextText = span.nextSibling?.textContent || '';
      const prevText = span.previousSibling?.textContent || '';
      if (nextText.includes('ba') || nextText.includes('bath') || prevText.includes('ba') || prevText.includes('bath')) {
        baths = parseFloat(text) || 0;
      }
    }
    
    // Look for sqft pattern
    if (!sqft && text.match(/^[\d,]+$/)) {
      const nextText = span.nextSibling?.textContent || '';
      const prevText = span.previousSibling?.textContent || '';
      if (nextText.includes('sqft') || nextText.includes('sq ft') || prevText.includes('sqft') || prevText.includes('sq ft')) {
        sqft = parseInt(text.replace(/,/g, '')) || 0;
      }
    }
  }
  
  // If still not found, try container approach
  if (!beds || !baths || !sqft) {
    const bedBathSelectors = [
      '[data-test="bed-bath-sqft-text-container"]',
      '[data-test="bed-bath-beyond"]',
      '[class*="bed-bath"]',
      '.summary-container',
      'div[class*="Text-"]'
    ];
    
    for (const selector of bedBathSelectors) {
      const containers = document.querySelectorAll(selector);
      for (const container of containers) {
        const text = container.textContent || '';
        
        if (!beds) {
          const bedsMatch = text.match(/(\d+)\s*(?:bd|bed|beds)/i);
          if (bedsMatch) beds = parseInt(bedsMatch[1]) || 0;
        }
        
        if (!baths) {
          const bathsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath|baths)/i);
          if (bathsMatch) baths = parseFloat(bathsMatch[1]) || 0;
        }
        
        if (!sqft) {
          const sqftMatch = text.match(/([\d,]+)\s*(?:sqft|sq\s*ft)/i);
          if (sqftMatch) sqft = parseInt(sqftMatch[1].replace(/,/g, '')) || 0;
        }
        
        if (beds && baths && sqft) break;
      }
      if (beds && baths && sqft) break;
    }
  }
  
  // Extract image - try multiple selectors
  const imageSelectors = [
    'img[alt*="property photo"]',
    'img[class*="media-stream-photo"]',
    '[data-test="hero-image"] img',
    '.photo-carousel img',
    'picture img'
  ];
  
  let imageElement: HTMLImageElement | null = null;
  for (const selector of imageSelectors) {
    imageElement = document.querySelector(selector) as HTMLImageElement;
    if (imageElement?.src) break;
  }

  const address = [
    addressElement?.textContent?.trim(),
    cityStateZipElement?.textContent?.trim()
  ].filter(Boolean).join(' ').trim();

  const propertyInfo = {
    zpid,
    url: window.location.href,
    address: address || 'Unknown Address',
    price: priceElement?.textContent?.trim() || 'Price not available',
    details: {
      beds,
      baths,
      sqft
    },
    imageUrl: imageElement?.src
  };

  // Debug: Look for bed/bath info in common patterns
  const debugInfo: string[] = [];
  document.querySelectorAll('span, div').forEach((el) => {
    const text = el.textContent?.trim() || '';
    if (text.match(/\d+\s*(bd|bed|ba|bath|sqft)/i) && text.length < 50) {
      debugInfo.push(text);
    }
  });

  console.log('Extracted property info:', {
    addressElement: addressElement?.textContent,
    cityStateZipElement: cityStateZipElement?.textContent,
    priceElement: priceElement?.textContent,
    beds, baths, sqft,
    potentialBedBathText: debugInfo.slice(0, 10),
    final: propertyInfo
  });

  return propertyInfo;
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