// Detects and tracks Zillow property cards on the page

export interface PropertyCard {
  element: HTMLElement;
  zpid: string;
  url: string;
  price?: string;
  address?: string;
  details?: {
    beds?: number;
    baths?: number;
    sqft?: number;
  };
}

export class PropertyDetector {
  private cards: Map<string, PropertyCard> = new Map();
  private observer: MutationObserver | null = null;
  private onCardDetected: (card: PropertyCard) => void;

  constructor(onCardDetected: (card: PropertyCard) => void) {
    this.onCardDetected = onCardDetected;
  }

  public start() {
    // Initial scan
    this.scanForCards();

    // Watch for new cards being added
    this.observer = new MutationObserver(() => {
      this.scanForCards();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  public stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private scanForCards() {
    // Hide Zillow's save buttons on property cards
    this.hideZillowHearts();
    
    // Try multiple selectors for better compatibility
    const selectors = [
      'article[data-test="property-card"]',
      'article.property-card',
      'article[class*="property-card"]',
      'div[class*="list-card"]',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      if (elements.length > 0) {
        elements.forEach(element => this.processCard(element));
        break; // Use first selector that finds results
      }
    }
  }
  
  private hideZillowHearts() {
    // Hide Zillow's heart buttons on property cards
    const heartSelectors = [
      'button[data-test="property-card-save"]',
      '.list-card-save',
      'button[class*="save-button"]:not(.home0-favorite-button)',
    ];
    
    heartSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(button => {
          const buttonEl = button as HTMLElement;
          // Don't hide our buttons
          if (!buttonEl.hasAttribute('data-zpid') && !buttonEl.classList.contains('home0-favorite-button')) {
            buttonEl.style.display = 'none';
          }
        });
      } catch (e) {
        // Ignore selector errors
      }
    });
  }

  private processCard(element: HTMLElement) {
    // Find the property link
    const link = element.querySelector('a[href*="/homedetails/"]') as HTMLAnchorElement;
    if (!link) return;

    // Extract ZPID from URL
    const zpid = this.extractZPID(link.href);
    if (!zpid) return;

    // Skip if already processed
    if (this.cards.has(zpid)) return;

    // Extract property details
    const card: PropertyCard = {
      element,
      zpid,
      url: link.href,
      price: this.extractPrice(element),
      address: this.extractAddress(element),
      details: this.extractDetails(element),
    };

    // Store and notify
    this.cards.set(zpid, card);
    this.onCardDetected(card);
  }

  private extractZPID(url: string): string | null {
    const match = url.match(/\/(\d+)_zpid/);
    return match ? match[1] : null;
  }

  private extractPrice(element: HTMLElement): string | undefined {
    const priceSelectors = [
      '[data-test="property-card-price"]',
      '.list-card-price',
      '[class*="Price"]',
      'span[class*="price"]',
    ];

    for (const selector of priceSelectors) {
      const priceEl = element.querySelector(selector);
      if (priceEl?.textContent) {
        return priceEl.textContent.trim();
      }
    }
    return undefined;
  }

  private extractAddress(element: HTMLElement): string | undefined {
    const addressSelectors = [
      '[data-test="property-card-addr"]',
      'address',
      '[class*="address"]',
      '[class*="Address"]',
    ];

    for (const selector of addressSelectors) {
      const addressEl = element.querySelector(selector);
      if (addressEl?.textContent) {
        return addressEl.textContent.trim();
      }
    }
    return undefined;
  }

  private extractDetails(element: HTMLElement): PropertyCard['details'] {
    const details: PropertyCard['details'] = {};

    // Try to find details list
    const detailsSelectors = [
      'ul[class*="PropertyCardHomeDetailsList"]',
      'ul[class*="details"]',
      'ul li',
    ];

    for (const selector of detailsSelectors) {
      const detailsList = element.querySelector(selector);
      if (detailsList) {
        const items = detailsList.querySelectorAll('li');
        
        items.forEach((item, index) => {
          const text = item.textContent?.toLowerCase() || '';
          const value = parseInt(text.match(/\d+/)?.[0] || '0');
          
          if (text.includes('bd') || text.includes('bed') || index === 0) {
            details.beds = value;
          } else if (text.includes('ba') || text.includes('bath') || index === 1) {
            details.baths = value;
          } else if (text.includes('sqft') || text.includes('sq') || index === 2) {
            details.sqft = value;
          }
        });
        
        break;
      }
    }

    return details;
  }

  public getCard(zpid: string): PropertyCard | undefined {
    return this.cards.get(zpid);
  }

  public getAllCards(): PropertyCard[] {
    return Array.from(this.cards.values());
  }
}