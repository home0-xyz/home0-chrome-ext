import { useEffect, useState, useCallback } from 'react';
import { clerkAuthService } from '@/shared/services/clerk-auth.service';

export function useClerkAuth() {
  // Since we're not using ClerkProvider in sidebar, we only check storage
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [storageAuth, setStorageAuth] = useState<{ isAuthenticated: boolean; user: any } | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  // Check Chrome storage for auth state on mount
  useEffect(() => {
    chrome.storage.local.get(['clerkAuth'], (result) => {
      if (result.clerkAuth) {
        setStorageAuth(result.clerkAuth);
      }
      setIsCheckingStorage(false);
    });

    // Listen for storage changes
    const handleStorageChange = (changes: any) => {
      if (changes.clerkAuth) {
        setStorageAuth(changes.clerkAuth.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Mark as loaded once we check storage
  useEffect(() => {
    if (!isCheckingStorage) {
      setIsLoaded(true);
    }
  }, [isCheckingStorage]);

  const handleSignOut = async () => {
    try {
      // Just clear storage since we're not using Clerk in sidebar
      await clerkAuthService.signOut();
      await chrome.storage.local.remove(['clerkAuth']);
      setStorageAuth(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const login = useCallback(async () => {
    // Clerk handles login through the auth page
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await handleSignOut();
    return { success: true };
  }, []);

  // Use storage auth if available (since Clerk might not work in iframe)
  const isAuthenticated = storageAuth?.isAuthenticated || isSignedIn || false;
  const currentUser = storageAuth?.user || (user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    firstName: user.firstName,
    lastName: user.lastName
  } : null);

  return {
    isLoaded: isLoaded && !isCheckingStorage,
    isAuthenticated,
    user: currentUser,
    signOut: handleSignOut,
    isLoading: !isLoaded || isCheckingStorage,
    login,
    logout
  };
}