import React from 'react';
import { User } from '@/shared/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogOut, User as UserIcon } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Your Account
        </CardTitle>
        <CardDescription>
          Manage your home0 account settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">{user.name || 'User'}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </CardContent>
    </Card>
  );
}