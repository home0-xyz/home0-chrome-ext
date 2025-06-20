// Authentication configuration
// Set to true to use Clerk, false to use mock auth
const USE_CLERK_AUTH_DEFAULT = true; // Enable Clerk auth

// You can override this with an environment variable
export const USE_CLERK_AUTH = import.meta.env.VITE_USE_CLERK_AUTH === 'true' 
  ? true 
  : USE_CLERK_AUTH_DEFAULT;