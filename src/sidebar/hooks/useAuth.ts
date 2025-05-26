import { useState, useEffect, useCallback } from 'react';
import { User } from '@/shared/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for auth state changes from storage
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.isAuthenticated || changes.user) {
        setAuthState({
          isAuthenticated: changes.isAuthenticated?.newValue || false,
          user: changes.user?.newValue || null,
          isLoading: false,
        });
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
      
      if (response.isAuthenticated) {
        const userResponse = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_USER' });
        setAuthState({
          isAuthenticated: true,
          user: userResponse.user,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'LOGIN',
        payload: { email, password },
      });

      if (response.success) {
        setAuthState({
          isAuthenticated: true,
          user: response.user,
          isLoading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'LOGOUT' });
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}