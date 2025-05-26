// Handles property detail pages on Zillow

import { FavoriteButton } from './favorite-button';
import { FavoritesService } from '@/shared/services/favorites.service';

export class DetailPageHandler {
  private favoriteButton: FavoriteButton | null = null;
  private navFavoriteButton: FavoriteButton | null = null;
  private favoritesService: FavoritesService;
  private zpid: string | null = null;
  
  constructor(favoritesService: FavoritesService) {
    this.favoritesService = favoritesService;
  }
  
  public init() {
    // Check if we're on a detail page
    if (!this.isDetailPage()) return;
    
    // Extract ZPID from URL
    this.zpid = this.extractZPIDFromURL();
    if (!this.zpid) return;
    
    // Replace Zillow's save button
    this.replaceZillowSaveButton();
    
    // Add our button to navigation
    this.addNavButton();
    
    // Watch for dynamic updates
    this.observeChanges();
  }
  
  private isDetailPage(): boolean {
    return window.location.pathname.includes('/homedetails/');
  }
  
  private extractZPIDFromURL(): string | null {
    const match = window.location.pathname.match(/\/(\d+)_zpid/);
    return match ? match[1] : null;
  }
  
  private replaceZillowSaveButton() {
    // Hide ALL Zillow save buttons on the page
    this.hideAllZillowSaveButtons();
    
    // Find the main save button to replace with ours
    const saveButtonSelectors = [
      'button[aria-label="Save"]',
      'button[data-test="bdp-save-button"]',
      'button[class*="save"][class*="button"]',
      'button svg[data-testid="heart-outline-icon"]',
      'button svg[data-testid="heart-filled-icon"]',
    ];
    
    let zillowButton: HTMLElement | null = null;
    
    for (const selector of saveButtonSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const button = element.closest('button') as HTMLElement;
        if (button && button.textContent?.includes('Save') && !button.style.display) {
          zillowButton = button;
          break;
        }
      }
      if (zillowButton) break;
    }
    
    if (!zillowButton || !this.zpid) return;
    
    // Hide Zillow's button
    zillowButton.style.display = 'none';
    
    // Extract property details
    const propertyData = this.extractPropertyData();
    
    // Create our favorite button
    const isFavorited = this.favoritesService.isFavorited(this.zpid);
    
    this.favoriteButton = new FavoriteButton({
      zpid: this.zpid,
      isFavorited,
      onToggle: async (zpid, isFavorited) => {
        if (isFavorited) {
          await this.favoritesService.addFavorite({
            zpid,
            url: window.location.href,
            address: propertyData.address,
            price: propertyData.price,
            details: propertyData.details
          });
        } else {
          await this.favoritesService.removeFavorite(zpid);
        }
      }
    });
    
    // Create a wrapper for our button
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    `;
    
    // Insert our wrapper where Zillow's button was
    zillowButton.parentNode?.insertBefore(wrapper, zillowButton);
    
    // Attach our button
    this.favoriteButton.attach(wrapper);
    
    // Update button styles for detail page
    if (this.favoriteButton['button']) {
      const btn = this.favoriteButton['button'] as HTMLButtonElement;
      btn.style.position = 'static';
      btn.style.width = '48px';
      btn.style.height = '48px';
    }
    
    // Add label
    const label = document.createElement('span');
    label.textContent = 'Save to home0';
    label.style.cssText = `
      font-size: 16px;
      font-weight: 500;
      color: #2e3f51;
    `;
    wrapper.appendChild(label);
  }
  
  private extractPropertyData() {
    const data = {
      address: 'Unknown Address',
      price: 'Price not available',
      details: {} as any
    };
    
    // Extract address
    const addressSelectors = [
      'h1[class*="Address"]',
      '[data-test="bdp-building-address"]',
      'div[class*="hdp__sc"] h1',
    ];
    
    for (const selector of addressSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent) {
        data.address = element.textContent.trim();
        break;
      }
    }
    
    // Extract price
    const priceSelectors = [
      'span[data-test="bdp-price"]',
      'span[class*="Price"]',
      'div[class*="hdp__sc"] span[class*="Text"]',
    ];
    
    for (const selector of priceSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.includes('$')) {
        data.price = element.textContent.trim();
        break;
      }
    }
    
    // Extract details (beds, baths, sqft)
    const detailSelectors = [
      '[data-test="bed-bath-sqft-fact"]',
      'span[data-test="bed-bath-item"]',
      'div[class*="hdp__sc"] span',
    ];
    
    for (const selector of detailSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent?.toLowerCase() || '';
        
        if (text.includes('bed')) {
          const match = text.match(/(\d+)/);
          if (match) data.details.beds = parseInt(match[1]);
        } else if (text.includes('bath')) {
          const match = text.match(/(\d+)/);
          if (match) data.details.baths = parseInt(match[1]);
        } else if (text.includes('sqft') || text.includes('sq ft')) {
          const match = text.match(/(\d+,?\d*)/);
          if (match) data.details.sqft = parseInt(match[1].replace(',', ''));
        }
      });
    }
    
    return data;
  }
  
  private hideAllZillowSaveButtons() {
    // Hide all Save buttons including in navigation
    const allSaveButtons = [
      'button[aria-label="Save"]',
      'button[data-test="bdp-save-button"]',
      'button:has(svg[data-testid="heart-outline-icon"])',
      'button:has(svg[data-testid="heart-filled-icon"])',
      'button:has(svg path[d*="M20.84"])', // Heart path
      'nav button[aria-label="Save"]',
      'header button[aria-label="Save"]',
    ];
    
    allSaveButtons.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(button => {
          const btn = button as HTMLElement;
          if (btn.textContent?.includes('Save') || btn.querySelector('svg')) {
            btn.style.display = 'none';
          }
        });
      } catch (e) {
        // Ignore selector errors for older browsers
      }
    });
  }
  
  private observeChanges() {
    const observer = new MutationObserver(() => {
      // Re-hide Zillow buttons if they reappear
      this.hideAllZillowSaveButtons();
      
      // Check if our button was removed
      if (this.favoriteButton && !document.contains(this.favoriteButton['button'] as HTMLElement)) {
        this.replaceZillowSaveButton();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  private addNavButton() {
    if (!this.zpid) return;
    
    // Find navigation buttons area
    const navSelectors = [
      'nav button[aria-label="Share"]',
      'header button[aria-label="Share"]',
      'button[aria-label="Share"]',
    ];
    
    let shareButton: HTMLElement | null = null;
    
    for (const selector of navSelectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        shareButton = element;
        break;
      }
    }
    
    if (!shareButton) return;
    
    // Extract property data
    const propertyData = this.extractPropertyData();
    const isFavorited = this.favoritesService.isFavorited(this.zpid);
    
    // Create nav favorite button
    this.navFavoriteButton = new FavoriteButton({
      zpid: this.zpid,
      isFavorited,
      onToggle: async (zpid, isFavorited) => {
        if (isFavorited) {
          await this.favoritesService.addFavorite({
            zpid,
            url: window.location.href,
            address: propertyData.address,
            price: propertyData.price,
            details: propertyData.details
          });
        } else {
          await this.favoritesService.removeFavorite(zpid);
        }
        
        // Sync with main button
        if (this.favoriteButton) {
          this.favoriteButton.setFavorited(isFavorited);
        }
      }
    });
    
    // Create wrapper that matches Zillow's button style
    const wrapper = document.createElement('button');
    wrapper.className = shareButton.className;
    wrapper.style.cssText = `
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    `;
    
    // Insert before Share button
    shareButton.parentNode?.insertBefore(wrapper, shareButton);
    
    // Attach our button
    this.navFavoriteButton.attach(wrapper);
    
    // Update nav button styles
    if (this.navFavoriteButton['button']) {
      const btn = this.navFavoriteButton['button'] as HTMLButtonElement;
      btn.style.position = 'static';
      btn.style.backgroundColor = 'transparent';
      btn.style.boxShadow = 'none';
      btn.style.width = '24px';
      btn.style.height = '24px';
    }
    
    // Add label
    const label = document.createElement('span');
    label.textContent = 'Save';
    label.style.cssText = `
      font-size: 16px;
      font-weight: 500;
      color: inherit;
    `;
    wrapper.appendChild(label);
  }
  
  public updateFavoriteState(zpid: string, isFavorited: boolean) {
    if (this.zpid === zpid) {
      if (this.favoriteButton) {
        this.favoriteButton.setFavorited(isFavorited);
      }
      if (this.navFavoriteButton) {
        this.navFavoriteButton.setFavorited(isFavorited);
      }
    }
  }
}