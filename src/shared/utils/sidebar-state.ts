// Utility for managing sidebar state persistence

const SIDEBAR_STATE_KEY = 'home0_sidebar_state';

export interface SidebarState {
  isOpen: boolean;
  lastUpdated: number;
}

export async function saveSidebarState(isOpen: boolean): Promise<void> {
  try {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.warn('Extension context invalidated, skipping state save');
      return;
    }
    
    await chrome.storage.local.set({
      [SIDEBAR_STATE_KEY]: {
        isOpen,
        lastUpdated: Date.now()
      } as SidebarState
    });
  } catch (error: any) {
    // Silently ignore extension context invalidated errors
    if (error?.message?.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated, skipping state save');
    } else {
      console.error('Failed to save sidebar state:', error);
    }
  }
}

export async function getSidebarState(): Promise<SidebarState | null> {
  try {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.warn('Extension context invalidated, returning null state');
      return null;
    }
    
    const result = await chrome.storage.local.get(SIDEBAR_STATE_KEY);
    return result[SIDEBAR_STATE_KEY] || null;
  } catch (error: any) {
    // Silently handle extension context invalidated errors
    if (error?.message?.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated, returning null state');
    } else {
      console.error('Failed to get sidebar state:', error);
    }
    return null;
  }
}

export function onSidebarStateChanged(callback: (state: SidebarState) => void): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
    if (area === 'local' && changes[SIDEBAR_STATE_KEY]) {
      callback(changes[SIDEBAR_STATE_KEY].newValue);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}