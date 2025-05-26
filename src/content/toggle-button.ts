import { TOGGLE_BUTTON_SIZE, Z_INDEX } from '@/shared/constants';

export class ToggleButton {
  private button: HTMLButtonElement | null = null;
  private isOpen: boolean = false;

  constructor(private onToggle: () => void) {
    this.createButton();
  }

  private createButton() {
    this.button = document.createElement('button');
    this.button.id = 'home0-toggle-button';
    this.button.setAttribute('aria-label', 'Toggle home0 sidebar');
    
    // Set styles
    this.button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: ${TOGGLE_BUTTON_SIZE}px;
      height: ${TOGGLE_BUTTON_SIZE}px;
      border-radius: 50%;
      background-color: #1e293b;
      color: white;
      border: none;
      cursor: pointer;
      z-index: ${Z_INDEX.TOGGLE_BUTTON};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 20px;
      font-weight: bold;
      user-select: none;
    `;

    // Set initial icon
    this.updateIcon();

    // Add hover effect
    this.button.addEventListener('mouseenter', () => {
      if (this.button) {
        const rotation = this.isOpen ? '90deg' : '0deg';
        this.button.style.transform = `scale(1.1) rotate(${rotation})`;
        this.button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
      }
    });

    this.button.addEventListener('mouseleave', () => {
      if (this.button) {
        const rotation = this.isOpen ? '90deg' : '0deg';
        this.button.style.transform = `scale(1) rotate(${rotation})`;
        this.button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      }
    });

    // Add click handler
    this.button.addEventListener('click', () => {
      console.log('Toggle button clicked, current state:', this.isOpen);
      this.onToggle();
      // Don't update isOpen here - it will be set by setOpen() callback
    });

    // Append to body
    document.body.appendChild(this.button);
  }

  private updateIcon() {
    if (this.button) {
      // Use HTML entities for better compatibility
      this.button.innerHTML = this.isOpen ? '&times;' : 'h0';
      
      // Add rotation animation
      this.button.style.transform = 'scale(1) rotate(0deg)';
      requestAnimationFrame(() => {
        if (this.button) {
          this.button.style.transform = this.isOpen 
            ? 'scale(1) rotate(90deg)' 
            : 'scale(1) rotate(0deg)';
        }
      });
    }
  }

  public setOpen(isOpen: boolean) {
    console.log('Toggle button setOpen called with:', isOpen);
    this.isOpen = isOpen;
    this.updateIcon();
  }

  public remove() {
    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
    }
  }
}