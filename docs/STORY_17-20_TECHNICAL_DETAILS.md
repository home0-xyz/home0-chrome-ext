# Technical Details for Stories #17-20: Favorite Button Injection

## Overview
This document provides technical research and implementation details for injecting favorite buttons on Zillow property pages (Stories #17-20).

## Zillow Page Structure

### Property Page URL Patterns
- **Detail Page**: `https://www.zillow.com/homedetails/{address}/{zpid}_zpid/`
- **Example**: `https://www.zillow.com/homedetails/130-Water-St-APT-12D-New-York-NY-10005/2064142765_zpid/`

### ZPID Extraction
The ZPID (Zillow Property ID) is a unique identifier for each property. It can be extracted from:

1. **URL Pattern**: 
```javascript
function extractZpidFromUrl(url) {
  const match = url.match(/\/(\d+)_zpid/);
  return match ? match[1] : null;
}
```

2. **Alternative Method**:
```javascript
function extractZpidAlternative(url) {
  const parts = url.split('/');
  const zpidPart = parts.find(part => part.includes('_zpid'));
  return zpidPart ? zpidPart.split('_')[0] : null;
}
```

## DOM Element Selectors

### Property Card Selectors (Search Results)
- **Container**: `#grid-search-results`
- **Individual Cards**: `<article>` elements within property list
- **Address**: `[data-test="property-card-addr"]`
- **Price/Zestimate**: `[data-testid="primary-zestimate"]`

### Existing Heart/Save Button
- Zillow already has a heart icon for saving properties
- Located in top-left of property images on cards
- Changes from outline to filled when clicked
- Text changes from "Save" to "Saved"

### Property Details Page
- Property data often stored in: `<script id="__NEXT_DATA__" type="application/json">`
- This contains structured data about the property

## MutationObserver Implementation

### Best Practices for Dynamic Content

```javascript
// Initialize observer for dynamic content
function initPropertyObserver() {
  const config = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-testid']
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if it's a property card
            if (node.matches && node.matches('article')) {
              injectFavoriteButton(node);
            }
            // Check for property cards within added nodes
            if (node.querySelectorAll) {
              const cards = node.querySelectorAll('article');
              cards.forEach(card => injectFavoriteButton(card));
            }
          }
        });
      }
    });
  });

  // Start observing when DOM is ready
  const targetNode = document.querySelector('#search-page-react-content') || document.body;
  observer.observe(targetNode, config);
}

// Debounce function to prevent excessive processing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

### Performance Considerations
1. Use specific selectors rather than observing entire document
2. Debounce mutation callbacks for frequently changing content
3. Mark processed elements to avoid duplicate injection
4. Disconnect observer when not needed

## CSS for Favorite Button

### Positioning Strategy
```css
/* Container for our custom favorite button */
.home0-favorite-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.home0-favorite-container:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Heart icon styling */
.home0-favorite-icon {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: #006AFF;
  stroke-width: 2;
  transition: all 0.3s ease;
}

.home0-favorite-icon.favorited {
  fill: #006AFF;
  stroke: #006AFF;
}

/* Glow effect for favorited properties */
.home0-property-glow {
  box-shadow: 0 0 20px rgba(0, 106, 255, 0.4);
  border: 2px solid #006AFF;
  transition: all 0.3s ease;
}

/* Animation for heart fill */
@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1); }
  75% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.home0-favorite-icon.animating {
  animation: heartBeat 0.8s ease;
}
```

## Implementation Guidelines

### 1. Property Detection
```javascript
function detectPropertyElements() {
  // For search results page
  const propertyCards = document.querySelectorAll('article[data-test="property-card"]');
  
  // For property detail page
  const isDetailPage = window.location.pathname.includes('/homedetails/');
  
  return { propertyCards, isDetailPage };
}
```

### 2. Button Injection
```javascript
function injectFavoriteButton(element) {
  // Check if already processed
  if (element.dataset.home0Processed) return;
  
  // Extract ZPID
  const link = element.querySelector('a[href*="_zpid"]');
  if (!link) return;
  
  const zpid = extractZpidFromUrl(link.href);
  if (!zpid) return;
  
  // Create button container
  const container = document.createElement('div');
  container.className = 'home0-favorite-container';
  container.dataset.zpid = zpid;
  
  // Create heart SVG
  const svg = createHeartSvg();
  container.appendChild(svg);
  
  // Find appropriate parent for positioning
  const imageContainer = element.querySelector('[data-test="property-card-img"]') || 
                        element.querySelector('img')?.parentElement;
  
  if (imageContainer) {
    imageContainer.style.position = 'relative';
    imageContainer.appendChild(container);
  }
  
  // Mark as processed
  element.dataset.home0Processed = 'true';
  
  // Add click handler
  container.addEventListener('click', handleFavoriteClick);
}
```

### 3. Event Handling
```javascript
async function handleFavoriteClick(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const container = event.currentTarget;
  const zpid = container.dataset.zpid;
  const icon = container.querySelector('.home0-favorite-icon');
  
  // Add animation
  icon.classList.add('animating');
  
  // Toggle favorite state
  const isFavorited = icon.classList.contains('favorited');
  
  try {
    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      action: isFavorited ? 'removeFavorite' : 'addFavorite',
      zpid: zpid,
      url: window.location.href
    });
    
    if (response.success) {
      icon.classList.toggle('favorited');
      
      // Add glow to property card
      const propertyCard = container.closest('article');
      if (propertyCard) {
        propertyCard.classList.toggle('home0-property-glow', !isFavorited);
      }
    }
  } catch (error) {
    console.error('Failed to update favorite:', error);
  }
  
  // Remove animation class
  setTimeout(() => icon.classList.remove('animating'), 800);
}
```

## Best Practices for Non-Intrusive Injection

### 1. Avoid Breaking Existing Functionality
- Don't modify existing Zillow event listeners
- Use event.stopPropagation() carefully
- Position buttons to not overlap critical UI elements

### 2. Responsive Design
```css
/* Adjust for mobile viewports */
@media (max-width: 768px) {
  .home0-favorite-container {
    width: 36px;
    height: 36px;
  }
  
  .home0-favorite-icon {
    width: 20px;
    height: 20px;
  }
}
```

### 3. Error Handling
```javascript
function safeInject() {
  try {
    // Wait for initial page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initInjection);
    } else {
      initInjection();
    }
  } catch (error) {
    console.error('home0 extension error:', error);
    // Report to error tracking service
  }
}
```

### 4. Clean Injection Strategy
1. Use unique class prefixes (e.g., `home0-`) to avoid conflicts
2. Inject styles via `<style>` tag or Chrome's insertCSS API
3. Clean up observers and listeners when navigation occurs
4. Use Chrome storage to cache favorite states locally

## Summary

Key implementation points for Stories #17-20:
1. Use MutationObserver to handle Zillow's dynamic content loading
2. Extract ZPID from URLs using regex patterns
3. Position favorite buttons absolutely within image containers
4. Implement smooth animations and visual feedback
5. Handle both search results and detail pages
6. Ensure non-intrusive integration that doesn't break Zillow's functionality