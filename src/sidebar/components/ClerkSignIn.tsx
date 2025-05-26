import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export function ClerkSignIn() {
  return (
    <div className="w-full">
      <SignIn 
        appearance={{
          layout: {
            socialButtonsPlacement: 'bottom',
            socialButtonsVariant: 'iconButton'
          },
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border-0 p-0',
            header: 'hidden',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtons: 'w-full',
            socialButtonsIconButton: 'w-full border rounded-md',
            formButtonPrimary: 'bg-primary hover:bg-primary/90 w-full',
            formFieldInput: 'rounded-md border-input',
            footer: 'hidden'
          }
        }}
      />
    </div>
  );
}