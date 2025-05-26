import React from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Card, CardContent } from './ui/card';

export function ClerkUserProfile() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Your Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your home0 account settings
          </p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: 'h-10 w-10'
                }
              }}
            />
            <div>
              <p className="text-sm font-medium">{user.fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}