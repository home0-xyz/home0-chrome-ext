import React from 'react';
import { ClerkAPIError } from '@clerk/types';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ClerkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Clerk Error Boundary caught:', error, errorInfo);
    
    // Check if it's a Clerk API error
    if (error.message?.includes('401') || error.message?.includes('Clerk')) {
      console.error('Clerk Authentication Error:', {
        message: error.message,
        stack: error.stack,
        extensionId: chrome.runtime.id,
        extensionURL: chrome.runtime.getURL('/'),
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm">
          <div className="text-red-600 font-semibold mb-2">Authentication Error</div>
          <div className="text-gray-600">
            {this.state.error?.message || 'Failed to initialize authentication'}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <div>Extension ID: {chrome.runtime.id}</div>
            <div>Expected ID: ofildlgdeggjekidmehocamopeglfmle</div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}