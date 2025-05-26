import { createClerkClient } from '@clerk/chrome-extension/background';

// Initialize Clerk client for background service worker
const publishableKey = 'pk_test_Y29oZXJlbnQtYmVhci04MS5jbGVyay5hY2NvdW50cy5kZXYk';

export const clerkClientPromise = createClerkClient({
  publishableKey,
});

// Export for use in background script
export async function getClerkToken() {
  try {
    const clerk = await clerkClientPromise;
    const token = await clerk.session?.getToken();
    return token;
  } catch (error) {
    console.error('Failed to get Clerk token:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isClerkAuthenticated() {
  try {
    const clerk = await clerkClientPromise;
    return !!clerk.session;
  } catch (error) {
    console.error('Failed to check Clerk auth:', error);
    return false;
  }
}