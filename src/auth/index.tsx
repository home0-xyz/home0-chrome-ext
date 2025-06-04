import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, SignIn, SignUp, useUser, useClerk, useSession } from '@clerk/chrome-extension';
import '../sidebar/index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

function AuthPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();
  const clerk = useClerk();
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const modeParam = urlParams.get('mode');
  const isRefresh = urlParams.get('refresh') === 'true';
  
  const [mode, setMode] = React.useState<'sign-in' | 'sign-up'>(
    modeParam === 'sign-up' ? 'sign-up' : 'sign-in'
  );
  const [checkingExistingAuth, setCheckingExistingAuth] = React.useState(true);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [needsDevAuth, setNeedsDevAuth] = React.useState(false);
  
  // Check if this is a dev instance and needs authentication
  React.useEffect(() => {
    // TEMPORARILY DISABLED - Clerk dev auth is problematic with Chrome extensions
    // We'll wait for the production instance instead
    setNeedsDevAuth(false);
  }, []);

  // Debug auth state
  React.useEffect(() => {
    console.log('Auth state:', { isLoaded, isSignedIn, user, action, isRefresh });
  }, [isLoaded, isSignedIn, user, action, isRefresh]);

  // Handle refresh token requests
  React.useEffect(() => {
    if (isRefresh && isLoaded && isSignedIn && session) {
      console.log('Refreshing token due to URL parameter');
      setIsRefreshing(true);
      refreshToken();
    }
  }, [isRefresh, isLoaded, isSignedIn, session]);

  // Listen for refresh messages from background
  React.useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.type === 'REFRESH_TOKEN' && isSignedIn && session) {
        console.log('Refreshing token due to message');
        setIsRefreshing(true);
        refreshToken();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [isSignedIn, session]);

  // Refresh token function
  const refreshToken = async () => {
    if (!session) return;

    try {
      const newToken = await session.getToken({ skipCache: true });
      console.log('Got refreshed token:', !!newToken);

      if (newToken) {
        // Save the refreshed token with timestamp
        const clerkAuth = {
          isAuthenticated: true,
          user: {
            id: user!.id,
            email: user!.primaryEmailAddress?.emailAddress || '',
            firstName: user!.firstName || '',
            lastName: user!.lastName || '',
          },
          token: newToken,
          tokenTimestamp: Date.now()
        };

        await chrome.storage.local.set({ clerkAuth });
        console.log('Refreshed token saved to storage');

        // Close the window after successful refresh
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      setIsRefreshing(false);
    }
  };

  // Handle sign-out action
  React.useEffect(() => {
    if (action === 'signout' && isLoaded && clerk) {
      setIsSigningOut(true);
      clerk.signOut().then(() => {
        // Clear Chrome storage
        chrome.storage.local.remove(['clerkAuth'], () => {
          // Return to Zillow and close
          chrome.tabs.query({ url: '*://*.zillow.com/*' }, (tabs) => {
            if (tabs.length > 0) {
              chrome.tabs.update(tabs[0].id!, { active: true }, () => {
                setTimeout(() => {
                  window.close();
                }, 500);
              });
            } else {
              setTimeout(() => {
                window.close();
              }, 500);
            }
          });
        });
      });
    }
  }, [action, isLoaded, clerk]);

  // Check if already authenticated in storage
  React.useEffect(() => {
    // Skip this check if we're signing out or refreshing
    if (action === 'signout' || isRefresh) {
      setCheckingExistingAuth(false);
      return;
    }
    
    chrome.storage.local.get(['clerkAuth'], (result) => {
      if (result.clerkAuth?.isAuthenticated) {
        // Already authenticated, switch back to Zillow and close
        chrome.tabs.query({ url: '*://*.zillow.com/*' }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id!, { active: true }, () => {
              setTimeout(() => {
                window.close();
              }, 500);
            });
          } else {
            setTimeout(() => {
              window.close();
            }, 500);
          }
        });
      } else {
        setCheckingExistingAuth(false);
      }
    });
  }, [action, isRefresh]);

  React.useEffect(() => {
    // If user is already signed in, close this tab and notify the extension
    if (isLoaded && isSignedIn && user && session && action !== 'signout') {
      console.log('User signed in, saving auth state:', user);
      
      // Get the session token
      session.getToken().then((token) => {
        console.log('Got session token:', !!token);
        if (token) {
          console.log('Token length:', token.length);
          console.log('Token preview:', token.substring(0, 20) + '...');
          
          // Decode to check expiration
          try {
            const [, payload] = token.split('.');
            const decoded = JSON.parse(atob(payload));
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
            console.log('Token expires in:', expiresIn, 'seconds');
          } catch (e) {
            console.error('Failed to decode token:', e);
          }
        }
        
        // Save auth state with token and timestamp
        chrome.storage.local.set({ 
          clerkAuth: { 
            isAuthenticated: true, 
            user: {
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
            },
            token: token || null,
            tokenTimestamp: Date.now()
          } 
        }, () => {
        console.log('Auth state saved to storage');
        
        // Don't try to send messages - just rely on storage changes
        // The sidebar will detect the storage change automatically
        
        // Show success state for a moment before redirecting
        setTimeout(() => {
          // Find and switch to a Zillow tab before closing
          try {
            chrome.tabs.query({ url: '*://*.zillow.com/*' }, (tabs) => {
              if (chrome.runtime.lastError) {
                console.error('Error querying tabs:', chrome.runtime.lastError);
                // Just close the window if there's an error
                setTimeout(() => {
                  window.close();
                }, 1000);
                return;
              }
              
              if (tabs.length > 0) {
                console.log('Found Zillow tab, switching to it');
                // Switch to the first Zillow tab found
                chrome.tabs.update(tabs[0].id!, { active: true }, () => {
                  // Then close this auth tab after a brief delay
                  setTimeout(() => {
                    window.close();
                  }, 500);
                });
              } else {
                console.log('No Zillow tab found, opening new one');
                // No Zillow tab found, open a new one
                chrome.tabs.create({ url: 'https://www.zillow.com' }, () => {
                  setTimeout(() => {
                    window.close();
                  }, 500);
                });
              }
            });
          } catch (e) {
            console.error('Error with tabs API:', e);
            // If tabs API fails, just close after delay
            setTimeout(() => {
              window.close();
            }, 1000);
          }
        }, 2000); // Wait 2 seconds to show success message
        });
      });
    }
  }, [isLoaded, isSignedIn, user, session, action]);

  if (!isLoaded || checkingExistingAuth || isSigningOut || isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            {isSigningOut ? 'Signing out...' : 
             isRefreshing ? 'Refreshing authentication...' :
             checkingExistingAuth ? 'Checking authentication...' : 
             'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Successfully signed in!</h2>
          <p className="text-muted-foreground mb-4">Returning you to Zillow...</p>
          <button
            onClick={() => {
              chrome.tabs.query({ url: '*://*.zillow.com/*' }, (tabs) => {
                if (tabs.length > 0) {
                  chrome.tabs.update(tabs[0].id!, { active: true }, () => {
                    window.close();
                  });
                } else {
                  // Open a new Zillow tab if none exists
                  chrome.tabs.create({ url: 'https://www.zillow.com' }, () => {
                    window.close();
                  });
                }
              });
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Zillow
          </button>
        </div>
      </div>
    );
  }

  // If dev instance needs authentication, redirect to dev auth page
  if (needsDevAuth && mode === 'sign-up') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Browser Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Clerk development instances require browser authentication for security.
          </p>
          <button
            onClick={() => {
              window.location.href = chrome.runtime.getURL('auth/dev-auth.html');
            }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Authenticate Browser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to home0</h1>
          <p className="text-muted-foreground">Sign in to save your favorite properties</p>
        </div>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-xs text-amber-800">
            <strong>Chrome Extension Limitation:</strong> Google/OAuth sign-in may fail due to Chrome security restrictions. 
            Please use email/password authentication instead.
          </p>
        </div>

        {mode === 'sign-in' ? (
          <>
            <SignIn 
              redirectUrl={chrome.runtime.getURL('auth/index.html')}
              signUpUrl={chrome.runtime.getURL('auth/index.html?mode=sign-up')}
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-lg',
                  socialButtons: 'hidden !important',
                  socialButtonsBlockButton: 'hidden !important',
                  dividerRow: 'hidden !important',
                  alternativeMethods: 'hidden !important',
                }
              }}
            />
            <p className="text-center mt-4 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('sign-up')}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            <SignUp 
              redirectUrl={chrome.runtime.getURL('auth/index.html')}
              signInUrl={chrome.runtime.getURL('auth/index.html')}
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-lg',
                  socialButtons: 'hidden !important',
                  socialButtonsBlockButton: 'hidden !important',
                  dividerRow: 'hidden !important',
                  alternativeMethods: 'hidden !important',
                }
              }}
            />
            <p className="text-center mt-4 text-sm text-muted-foreground">
              Already have an account?{' '}
              <button 
                onClick={() => setMode('sign-in')}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthPage />
    </ClerkProvider>
  </React.StrictMode>
);