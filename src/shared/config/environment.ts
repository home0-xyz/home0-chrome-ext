// Environment configuration for Chrome extension

export interface EnvironmentConfig {
  name: 'development' | 'production';
  apiBaseUrl: string;
  clerkPublishableKey: string;
  enableDebugLogging: boolean;
}

// Determine environment based on manifest key or build flag
const isDevelopment = process.env.NODE_ENV === 'development' || 
  chrome.runtime.getManifest().key === undefined;

const config: { [key: string]: EnvironmentConfig } = {
  development: {
    name: 'development',
    apiBaseUrl: 'http://localhost:8787', // Local Wrangler dev server
    clerkPublishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY || '',
    enableDebugLogging: true,
  },
  production: {
    name: 'production',
    apiBaseUrl: 'https://api.home0.xyz',
    clerkPublishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY || '',
    enableDebugLogging: false,
  }
};

export const environment: EnvironmentConfig = isDevelopment ? config.development : config.production;

// Helper to check environment
export const isDev = () => environment.name === 'development';
export const isProd = () => environment.name === 'production';

// Debug logger that respects environment
export const debugLog = (...args: any[]) => {
  if (environment.enableDebugLogging) {
    console.log('[home0]', ...args);
  }
};