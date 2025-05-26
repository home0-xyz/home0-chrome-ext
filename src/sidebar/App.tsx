import React from 'react';
import { Button } from './components/ui/button';
import { Skeleton } from './components/ui/skeleton';
import { SignInForm } from './components/SignInForm';
import { UserProfile } from './components/UserProfile';
import { ClerkSignIn } from './components/ClerkSignIn';
import { ClerkUserProfile } from './components/ClerkUserProfile';
import { MakeFavoriteButton } from './components/MakeFavoriteButton';
import { FavoritesList } from './components/FavoritesList';
import { useAuth } from './hooks/useAuth';
import { useClerkAuth } from './hooks/useClerkAuth';
import { USE_CLERK_AUTH } from './config/auth.config';
import { Home, Settings } from 'lucide-react';

function App() {
  // Use either Clerk or mock auth based on config
  const mockAuth = useAuth();
  const clerkAuth = useClerkAuth();
  
  const auth = USE_CLERK_AUTH ? clerkAuth : mockAuth;
  const { isAuthenticated, user, isLoading: authLoading } = auth;

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          <h1 className="text-lg font-semibold">home0</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
          {authLoading ? (
            // Auth loading state
            <div className="space-y-2">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <>
              {/* Auth Section */}
              {!isAuthenticated ? (
                USE_CLERK_AUTH ? <ClerkSignIn /> : <SignInForm onSignIn={mockAuth.login} />
              ) : (
                USE_CLERK_AUTH ? <ClerkUserProfile /> : (mockAuth.user && <UserProfile user={mockAuth.user} onSignOut={mockAuth.logout} />)
              )}

              {/* Make Favorite Button - Only show when authenticated */}
              {isAuthenticated && <MakeFavoriteButton />}

              {/* Favorites Section - Only show when authenticated */}
              {isAuthenticated && (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Your Favorites
                  </h2>
                  <FavoritesList />
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}

export default App;