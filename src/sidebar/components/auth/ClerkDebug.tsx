import React from 'react';
import { useClerk, useAuth } from '@clerk/chrome-extension';

export function ClerkDebug() {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, sessionId } = useAuth();

  React.useEffect(() => {
    console.log('Clerk Debug Info:', {
      clerk,
      isLoaded,
      isSignedIn,
      sessionId,
      clerkLoaded: clerk.loaded,
      clerkSession: clerk.session,
      clerkClient: clerk.client,
    });
  }, [clerk, isLoaded, isSignedIn, sessionId]);

  if (!isLoaded) {
    return <div className="p-4 text-sm text-gray-500">Loading Clerk...</div>;
  }

  return (
    <div className="p-4 text-xs">
      <div>Clerk Status: {isLoaded ? 'Loaded' : 'Loading'}</div>
      <div>Signed In: {isSignedIn ? 'Yes' : 'No'}</div>
      <div>Session ID: {sessionId || 'None'}</div>
    </div>
  );
}