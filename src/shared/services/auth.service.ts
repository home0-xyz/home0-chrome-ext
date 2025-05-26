import { User } from '../types';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

interface StoredAuthData {
  authToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  lastLogin: string | null;
}

class MockAuthService {
  private readonly mockUsers = [
    {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123' // In real app, never store plaintext passwords
    }
  ];

  // Generate a mock JWT token
  private generateMockToken(user: { id: string; email: string; name?: string }): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock-signature-' + user.id);
    
    return `${header}.${payload}.${signature}`;
  }

  // Mock login with delay to simulate API call
  async login(email: string, password: string): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = this.mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      const token = this.generateMockToken(userWithoutPassword);
      
      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    }

    return {
      success: false,
      error: 'Invalid email or password'
    };
  }

  // Mock logout
  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Actual logout logic will be in the state manager
  }

  // Verify token (mock implementation)
  async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      const [, payloadBase64] = token.split('.');
      const payload = JSON.parse(atob(payloadBase64));
      
      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false };
      }

      // Find user
      const user = this.mockUsers.find(u => u.id === payload.sub);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return { valid: true, user: userWithoutPassword };
      }

      return { valid: false };
    } catch {
      return { valid: false };
    }
  }
}

// Auth State Manager using chrome.storage
class AuthStateManager {
  private static readonly STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER: 'user',
    IS_AUTHENTICATED: 'isAuthenticated',
    LAST_LOGIN: 'lastLogin'
  };

  static async saveAuthData(token: string, user: User): Promise<void> {
    const data: StoredAuthData = {
      authToken: token,
      user: user,
      isAuthenticated: true,
      lastLogin: new Date().toISOString()
    };

    await chrome.storage.local.set(data);
  }

  static async getAuthData(): Promise<StoredAuthData> {
    const data = await chrome.storage.local.get([
      this.STORAGE_KEYS.AUTH_TOKEN,
      this.STORAGE_KEYS.USER,
      this.STORAGE_KEYS.IS_AUTHENTICATED,
      this.STORAGE_KEYS.LAST_LOGIN
    ]);

    return {
      authToken: data.authToken || null,
      user: data.user || null,
      isAuthenticated: data.isAuthenticated || false,
      lastLogin: data.lastLogin || null
    };
  }

  static async clearAuthData(): Promise<void> {
    await chrome.storage.local.remove([
      this.STORAGE_KEYS.AUTH_TOKEN,
      this.STORAGE_KEYS.USER,
      this.STORAGE_KEYS.IS_AUTHENTICATED,
      this.STORAGE_KEYS.LAST_LOGIN
    ]);
  }

  static async isAuthenticated(): Promise<boolean> {
    const { isAuthenticated, authToken } = await this.getAuthData();
    
    if (!isAuthenticated || !authToken) {
      return false;
    }

    // Verify token is still valid
    const authService = new MockAuthService();
    const { valid } = await authService.verifyToken(authToken);
    
    if (!valid) {
      await this.clearAuthData();
      return false;
    }

    return true;
  }

  static async getCurrentUser(): Promise<User | null> {
    const { user } = await this.getAuthData();
    return user;
  }

  // Listen for auth state changes
  static onAuthStateChanged(callback: (isAuthenticated: boolean, user: User | null) => void): () => void {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && (changes.isAuthenticated || changes.user)) {
        const isAuthenticated = changes.isAuthenticated?.newValue || false;
        const user = changes.user?.newValue || null;
        callback(isAuthenticated, user);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Return unsubscribe function
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }
}

export { MockAuthService, AuthStateManager };
export type { AuthResponse, StoredAuthData };