import React from 'react';
import { Card, CardContent } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { Button } from './components/ui/button';
import { Skeleton } from './components/ui/skeleton';
import { SignInForm } from './components/SignInForm';
import { UserProfile } from './components/UserProfile';
import { useAuth } from './hooks/useAuth';
import { Home, Settings } from 'lucide-react';

function App() {
  const { isAuthenticated, user, isLoading: authLoading, login, logout } = useAuth();
  const [favoritesLoading, setFavoritesLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading favorites
    if (isAuthenticated) {
      setTimeout(() => setFavoritesLoading(false), 1000);
    }
  }, [isAuthenticated]);

  return (
    <div className="h-screen flex flex-col bg-background">
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
      <ScrollArea className="flex-1">
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
                <SignInForm onSignIn={login} />
              ) : (
                user && <UserProfile user={user} onSignOut={logout} />
              )}

              {/* Favorites Section - Only show when authenticated */}
              {isAuthenticated && (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Your Favorites
                  </h2>
                  {favoritesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center">
                          No favorites yet. Start browsing Zillow to save properties!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default App;