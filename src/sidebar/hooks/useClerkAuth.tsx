import { useUser, useAuth as useClerkHook, useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { clerkAuthService } from '@/shared/services/clerk-auth.service';

export function useClerkAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useClerkHook();
  const { signOut } = useClerk();

  // Sync Clerk auth state with extension storage
  useEffect(() => {
    const syncAuthState = async () => {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        try {
          // Get fresh token
          const token = await getToken();
          await clerkAuthService.signIn(user, token || '');
        } catch (error) {
          console.error('Failed to sync auth state:', error);
        }
      } else {
        await clerkAuthService.signOut();
      }
    };

    syncAuthState();
  }, [isLoaded, isSignedIn, user, getToken]);

  const handleSignOut = async () => {
    try {
      await signOut();
      await clerkAuthService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    isLoaded,
    isAuthenticated: isSignedIn,
    user,
    signOut: handleSignOut,
    isLoading: !isLoaded
  };
}