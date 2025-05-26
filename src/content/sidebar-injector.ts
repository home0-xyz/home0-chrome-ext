import { SIDEBAR_WIDTH } from '@/shared/constants';
import { saveSidebarState } from '@/shared/utils/sidebar-state';

export class SidebarInjector {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private isOpen: boolean = false;

  constructor() {
    this.injectSidebar();
  }

  private injectSidebar() {
    // Create container element
    this.container = document.createElement('div');
    this.container.id = 'home0-sidebar-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: ${SIDEBAR_WIDTH}px;
      height: 100vh;
      z-index: 999998;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    `;

    // Create shadow root
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Create styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = this.getStyles();
    this.shadowRoot.appendChild(styleSheet);

    // Create sidebar host element
    const sidebarHost = document.createElement('div');
    sidebarHost.id = 'home0-sidebar-host';
    sidebarHost.innerHTML = `
      <div class="sidebar-frame">
        <div id="sidebar-root"></div>
      </div>
    `;
    this.shadowRoot.appendChild(sidebarHost);

    // Append to body
    document.body.appendChild(this.container);

    // Load React app into shadow DOM
    this.loadReactApp();
  }

  private getStyles(): string {
    return `
      :host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      .sidebar-frame {
        width: 100%;
        height: 100%;
        background: white;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        position: relative;
      }

      #sidebar-root {
        width: 100%;
        height: 100%;
      }
    `;
  }

  private async loadReactApp() {
    // We'll implement this next - it will dynamically load the React app
    const root = this.shadowRoot?.getElementById('sidebar-root');
    if (!root) return;

    // For now, just add a placeholder
    root.innerHTML = `
      <div style="padding: 20px;">
        <h2>home0 Sidebar</h2>
        <p>React app will load here</p>
      </div>
    `;
  }

  public toggle() {
    this.isOpen = !this.isOpen;
    console.log('Sidebar toggled, isOpen:', this.isOpen);
    this.updateVisibility();
  }

  public open() {
    this.isOpen = true;
    this.updateVisibility();
  }

  public close() {
    this.isOpen = false;
    this.updateVisibility();
  }

  private updateVisibility() {
    if (this.container) {
      this.container.style.transform = this.isOpen ? 'translateX(0)' : 'translateX(100%)';
      this.container.style.boxShadow = this.isOpen 
        ? '-4px 0 24px rgba(0, 0, 0, 0.15)' 
        : '0 0 0 rgba(0, 0, 0, 0)';
    }
    
    // Save state to storage
    saveSidebarState(this.isOpen);
  }

  public isVisible(): boolean {
    return this.isOpen;
  }
}