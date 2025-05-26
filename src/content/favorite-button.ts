// Favorite button that gets injected into property cards

export interface FavoriteButtonOptions {
  zpid: string;
  isFavorited: boolean;
  onToggle: (zpid: string, isFavorited: boolean) => void;
}

export class FavoriteButton {
  private button: HTMLButtonElement | null = null;
  private zpid: string;
  private isFavorited: boolean;
  private onToggle: (zpid: string, isFavorited: boolean) => void;

  constructor(options: FavoriteButtonOptions) {
    this.zpid = options.zpid;
    this.isFavorited = options.isFavorited;
    this.onToggle = options.onToggle;
    this.createButton();
  }

  private createButton() {
    this.button = document.createElement('button');
    this.button.className = 'home0-favorite-button';
    this.button.setAttribute('aria-label', 'Add to favorites');
    this.button.setAttribute('data-zpid', this.zpid);
    
    // Set styles
    this.button.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.9);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      z-index: 10;
      backdrop-filter: blur(4px);
    `;

    // Set initial icon
    this.updateIcon();

    // Add hover effect
    this.button.addEventListener('mouseenter', () => {
      if (this.button) {
        this.button.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        this.button.style.transform = 'scale(1.1)';
        this.button.style.boxShadow = this.isFavorited 
          ? '0 4px 12px rgba(245, 158, 11, 0.5)' 
          : '0 4px 8px rgba(0, 0, 0, 0.15)';
      }
    });

    this.button.addEventListener('mouseleave', () => {
      if (this.button) {
        this.button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        this.button.style.transform = 'scale(1)';
        this.button.style.boxShadow = this.isFavorited 
          ? '0 2px 8px rgba(245, 158, 11, 0.4)' 
          : '0 2px 4px rgba(0, 0, 0, 0.1)';
      }
    });

    // Add click handler
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
  }

  private updateIcon() {
    if (!this.button) return;

    // SVG heart icon - gold when favorited
    const svg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="${this.isFavorited ? '#f59e0b' : 'none'}" stroke="${this.isFavorited ? '#f59e0b' : '#6b7280'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;
    
    this.button.innerHTML = svg;
    this.button.setAttribute('aria-label', this.isFavorited ? 'Remove from favorites' : 'Add to favorites');
    
    // Add pulse animation and glow when favorited
    if (this.isFavorited) {
      this.button.style.animation = 'pulse 0.4s ease-out';
      this.button.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.4)';
      setTimeout(() => {
        if (this.button) {
          this.button.style.animation = '';
        }
      }, 400);
    } else {
      this.button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }
  }

  private toggle() {
    this.isFavorited = !this.isFavorited;
    this.updateIcon();
    this.onToggle(this.zpid, this.isFavorited);
  }

  public setFavorited(isFavorited: boolean) {
    if (this.isFavorited !== isFavorited) {
      this.isFavorited = isFavorited;
      this.updateIcon();
    }
  }

  public attach(container: HTMLElement) {
    if (!this.button) return;

    // Ensure container has relative positioning for absolute button
    const position = window.getComputedStyle(container).position;
    if (position === 'static') {
      container.style.position = 'relative';
    }

    container.appendChild(this.button);
  }

  public remove() {
    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
    }
  }
}