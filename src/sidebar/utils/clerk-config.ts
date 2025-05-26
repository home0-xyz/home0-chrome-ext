// Clerk configuration for Chrome Extension

export function getClerkConfig() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  // For Chrome extensions, we need to ensure the origin is properly set
  const extensionOrigin = chrome.runtime.getURL('').slice(0, -1); // Remove trailing slash
  const extensionId = chrome.runtime.id;
  
  console.log('Clerk Extension Config:', {
    publishableKey,
    extensionOrigin,
    extensionId,
    expectedId: 'ofildlgdeggjekidmehocamopeglfmle',
    matches: extensionId === 'ofildlgdeggjekidmehocamopeglfmle'
  });

  return {
    publishableKey,
    // Chrome extensions need these specific settings
    isSatellite: false,
    signInUrl: undefined,
    signUpUrl: undefined,
    // Explicitly set the domain to avoid CORS issues
    domain: undefined,
  };
}