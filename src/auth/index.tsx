import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, SignIn, SignUp, useUser, useClerk } from '@clerk/chrome-extension';
import '../sidebar/index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

function AuthPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const modeParam = urlParams.get('mode');
  
  const [mode, setMode] = React.useState<'sign-in' | 'sign-up'>(
    modeParam === 'sign-up' ? 'sign-up' : 'sign-in'
  );
  const [checkingExistingAuth, setCheckingExistingAuth] = React.useState(true);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  
  // Debug auth state
  React.useEffect(() => {
    console.log('Auth state:', { isLoaded, isSignedIn, user, action });
  }, [isLoaded, isSignedIn, user, action]);

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
    // Skip this check if we're signing out
    if (action === 'signout') return;
    
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
  }, [action]);

  React.useEffect(() => {
    // If user is already signed in, close this tab and notify the extension
    if (isLoaded && isSignedIn && user && action !== 'signout') {
      console.log('User signed in, saving auth state:', user);
      
      // Save auth state first
      chrome.storage.local.set({ 
        clerkAuth: { 
          isAuthenticated: true, 
          user: {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          } 
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
    }
  }, [isLoaded, isSignedIn, user, action]);

  if (!isLoaded || checkingExistingAuth || isSigningOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            {isSigningOut ? 'Signing out...' : checkingExistingAuth ? 'Checking authentication...' : 'Loading...'}
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