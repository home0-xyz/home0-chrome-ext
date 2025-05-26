// Utility functions for authentication that can be used across extension components

export async function checkAuthStatus(): Promise<boolean> {
  try {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.warn('Extension context invalidated, returning false for auth check');
      return false;
    }
    
    const response = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    return response.isAuthenticated || false;
  } catch (error: any) {
    // Silently handle extension context invalidated errors
    if (error?.message?.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated during auth check');
    } else {
      console.error('Failed to check auth status:', error);
    }
    return false;
  }
}

export async function getCurrentUser() {
  try {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.warn('Extension context invalidated, returning null user');
      return null;
    }
    
    const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' });
    return response.user || null;
  } catch (error: any) {
    // Silently handle extension context invalidated errors
    if (error?.message?.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated during user fetch');
    } else {
      console.error('Failed to get current user:', error);
    }
    return null;
  }
}

// Subscribe to auth state changes
export function onAuthStateChanged(callback: (isAuthenticated: boolean) => void) {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'local' && changes.isAuthenticated) {
      callback(changes.isAuthenticated.newValue || false);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return unsubscribe function
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}