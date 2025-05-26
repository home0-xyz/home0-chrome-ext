import { useEffect } from 'react';

export function useClerkDebug() {
  useEffect(() => {
    // Debug Clerk initialization
    console.log('Clerk Debug Info:', {
      // Location info
      href: window.location.href,
      origin: window.location.origin,
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: window.location.pathname,
      
      // Chrome extension info
      inExtension: typeof chrome !== 'undefined' && chrome.runtime,
      extensionId: chrome?.runtime?.id,
      extensionURL: chrome?.runtime?.getURL('/'),
      
      // Frame info
      isTopLevel: window === window.top,
      parentOrigin: window.parent !== window ? 'Has parent' : 'No parent',
      
      // Environment
      publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
      nodeEnv: import.meta.env.NODE_ENV,
    });

    // Intercept fetch to see what Clerk is trying to do
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      if (typeof url === 'string' && url.includes('clerk')) {
        console.log('Clerk API Request:', {
          url,
          method: options?.method || 'GET',
          headers: options?.headers,
        });
      }
      
      try {
        const response = await originalFetch(...args);
        
        if (typeof url === 'string' && url.includes('clerk') && !response.ok) {
          console.error('Clerk API Error:', {
            url,
            status: response.status,
            statusText: response.statusText,
          });
        }
        
        return response;
      } catch (error) {
        if (typeof url === 'string' && url.includes('clerk')) {
          console.error('Clerk Fetch Error:', error);
        }
        throw error;
      }
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}