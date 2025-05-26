import React from 'react';
import { Button } from './ui/button';
import { LogIn } from 'lucide-react';

export function ClerkSignIn() {
  const handleSignIn = () => {
    // Open auth page in a new tab
    const authUrl = chrome.runtime.getURL('auth/index.html');
    chrome.tabs.create({ url: authUrl });
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Sign in to home0</h3>
        <p className="text-sm text-muted-foreground">
          Save and organize your favorite Zillow properties
        </p>
      </div>
      
      <Button 
        onClick={handleSignIn}
        className="w-full"
        size="lg"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign In / Sign Up
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        This will open a new tab for secure authentication
      </p>
    </div>
  );
}