import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
import { useClerkAuth } from '../hooks/useClerkAuth';

export function ClerkUserProfile() {
  const { user, logout } = useClerkAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    await logout();
    
    // Open auth page with sign-out action
    const authUrl = chrome.runtime.getURL('auth/index.html?action=signout');
    chrome.tabs.create({ url: authUrl });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Your Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your home0 account settings
          </p>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}