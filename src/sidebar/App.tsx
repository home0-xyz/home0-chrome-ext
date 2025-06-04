import React, { useState } from 'react';
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
import { Home, Settings, TestTube } from 'lucide-react';
import { apiService } from '../shared/services/api.service';

function App() {
  // Use either Clerk or mock auth based on config
  const mockAuth = useAuth();
  const clerkAuth = useClerkAuth();
  
  const auth = USE_CLERK_AUTH ? clerkAuth : mockAuth;
  const { isAuthenticated, user, isLoading: authLoading } = auth;
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [forceTestMode, setForceTestMode] = useState(false);

  // Test functions
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[API Test] ${message}`);
  };

  const testGetFavorites = async () => {
    addLog('Testing GET /api/favorites...');
    try {
      const response = await apiService.getFavorites();
      if (response.success) {
        // The data might be nested in response.data.data or just response.data
        const favorites = response.data;
        if (Array.isArray(favorites)) {
          addLog(`Success! Got ${favorites.length} favorites`);
          if (favorites.length > 0) {
            addLog(`First favorite: ${favorites[0].address}`);
          }
        } else {
          addLog(`Success! Response: ${JSON.stringify(response.data)}`);
        }
      } else {
        addLog(`Failed: ${response.error}`);
      }
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const testAddFavorite = async () => {
    const testProperty = {
      zpid: `test-${Date.now()}`,
      address: '123 Test St, Test City, TS 12345',
      price: 500000,
      beds: 3,
      baths: 2,
      sqft: 2000,
      imageUrl: 'https://example.com/test.jpg',
      listingUrl: 'https://zillow.com/test'
    };
    
    addLog(`Testing POST /api/favorites with test property...`);
    addLog(`Backend expects user 'test-user-123' to exist in DB`);
    try {
      const response = await apiService.addFavorite(testProperty);
      if (response.success && response.data) {
        addLog(`Success! Added favorite with ID: ${response.data.id}`);
        
        // Test GET after adding
        addLog(`Verifying with GET /api/favorites...`);
        const getResponse = await apiService.getFavorites();
        if (getResponse.success && getResponse.data) {
          addLog(`Now have ${getResponse.data.length} favorites`);
        }
      } else {
        addLog(`Failed: ${response.error}`);
        if (response.error?.includes('FOREIGN KEY')) {
          addLog(`Fix: Add test-user-123 to backend users table`);
        }
        // Log the full response for debugging
        console.error('POST failed, full response:', response);
      }
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const testRemoveFavorite = async () => {
    addLog('Getting favorites to find one to remove...');
    try {
      const response = await apiService.getFavorites();
      if (!response.success) {
        addLog(`Failed to get favorites: ${response.error}`);
        return;
      }
      
      const favorites = response.data;
      if (!Array.isArray(favorites) || favorites.length === 0) {
        addLog('No favorites to remove. Add one first!');
        return;
      }
      
      const toRemove = favorites[0];
      if (!toRemove.id) {
        addLog(`Error: Favorite missing ID. Full object: ${JSON.stringify(toRemove)}`);
        return;
      }
      
      addLog(`Testing DELETE /api/favorites/${toRemove.id}...`);
      
      const deleteResponse = await apiService.removeFavorite(toRemove.id);
      if (deleteResponse.success) {
        addLog(`Success! Removed favorite ID: ${toRemove.id}`);
        
        // Verify it's gone
        addLog('Verifying removal with GET /api/favorites...');
        const updatedResponse = await apiService.getFavorites();
        if (updatedResponse.success && Array.isArray(updatedResponse.data)) {
          addLog(`Now have ${updatedResponse.data.length} favorites (was ${favorites.length})`);
        }
      } else {
        addLog(`Failed to remove: ${deleteResponse.error}`);
      }
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const clearLogs = () => {
    setTestResults([]);
  };

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
              
              {/* API Test Section */}
              <div className="mt-6 p-4 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  <h3 className="text-sm font-medium">API Test Panel</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={testGetFavorites} variant="outline">
                    Test GET
                  </Button>
                  <Button size="sm" onClick={testAddFavorite} variant="outline">
                    Test ADD
                  </Button>
                  <Button size="sm" onClick={testRemoveFavorite} variant="outline">
                    Test REMOVE
                  </Button>
                  <Button size="sm" onClick={clearLogs} variant="ghost">
                    Clear Logs
                  </Button>
                </div>
                
                {testResults.length > 0 && (
                  <div className="mt-3 p-3 bg-background rounded text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
                    {testResults.map((log, i) => (
                      <div key={i} className="text-muted-foreground">{log}</div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
      </div>
    </div>
  );
}

export default App;