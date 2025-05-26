import { useEffect } from 'react';

export function useClerkHeaders() {
  useEffect(() => {
    // Intercept all fetch requests to debug headers
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const [url, options = {}] = args;
      
      // Log Clerk requests
      if (typeof url === 'string' && url.includes('clerk')) {
        console.log('Clerk Request Details:', {
          url,
          method: options.method || 'GET',
          headers: options.headers || {},
          origin: window.location.origin,
          referrer: document.referrer,
          isInIframe: window !== window.top,
        });
        
        // Log request headers
        if (options.headers) {
          console.log('Request Headers:', options.headers);
        }
      }
      
      try {
        const response = await originalFetch.apply(this, args);
        
        if (typeof url === 'string' && url.includes('clerk') && response.status === 401) {
          // Clone response to read headers
          const clonedResponse = response.clone();
          const responseHeaders: Record<string, string> = {};
          
          clonedResponse.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });
          
          console.error('Clerk 401 Response Headers:', responseHeaders);
          
          // Try to read error body
          try {
            const errorBody = await clonedResponse.text();
            console.error('Clerk 401 Response Body:', errorBody);
          } catch (e) {
            console.error('Could not read error body');
          }
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}