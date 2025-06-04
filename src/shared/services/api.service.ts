import { clerkAuthService } from './clerk-auth.service';
import type { Property } from '../types';
import { environment, debugLog } from '../config/environment';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FavoriteProperty extends Property {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  propertyUrl: string; // API returns this field name
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await clerkAuthService.getToken();
      const url = `${environment.apiBaseUrl}${endpoint}`;
      
      debugLog(`API Request: ${options.method || 'GET'} ${url}`);
      debugLog(`Auth token present: ${!!token}`);
      
      // Build headers - require authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      // Merge with any existing headers
      if (options.headers) {
        Object.assign(headers, options.headers);
      }
      
      if (!token) {
        debugLog('WARNING: No auth token available for API request');
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        debugLog('Failed to parse JSON response:', error);
        data = { error: 'Invalid JSON response' };
      }
      
      debugLog('API Response:', { 
        status: response.status, 
        url: url,
        method: options.method || 'GET',
        data: data 
      });

      if (!response.ok) {
        // If we get a 401, the token might be expired
        if (response.status === 401) {
          debugLog('Got 401 - token might be expired');
          // Clear the auth state so user knows to re-authenticate
          await clerkAuthService.signOut();
          
          // Notify the extension that auth is needed
          chrome.runtime.sendMessage({
            type: 'AUTH_REQUIRED',
            reason: 'Token expired or invalid'
          }).catch(() => {
            // Ignore if no listeners
          });
        }
        
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getFavorites(): Promise<ApiResponse<FavoriteProperty[]>> {
    const response = await this.makeRequest<any>('/api/favorites');
    if (response.success && response.data) {
      // Handle paginated response format
      if (response.data.favorites && Array.isArray(response.data.favorites)) {
        return {
          success: true,
          data: response.data.favorites
        };
      }
      // Handle direct array format
      if (Array.isArray(response.data)) {
        return response as ApiResponse<FavoriteProperty[]>;
      }
    }
    return response;
  }

  async addFavorite(property: Property): Promise<ApiResponse<{ id: string }>> {
    const payload = {
      zpid: property.zpid,
      url: property.listingUrl,
      metadata: {
        address: property.address,
        price: property.price,
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft,
        imageUrl: property.imageUrl,
      }
    };
    
    debugLog('POST /api/favorites payload:', payload);
    
    const response = await this.makeRequest<any>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    // Handle response - the backend might return the full favorite object
    if (response.success && response.data) {
      // If response.data has an id property directly
      if (response.data.id) {
        return { success: true, data: { id: response.data.id } };
      }
      // If response.data is the ID itself
      if (typeof response.data === 'string') {
        return { success: true, data: { id: response.data } };
      }
      // Otherwise return the whole response
      return response;
    }
    
    return response;
  }

  async removeFavorite(id: string): Promise<ApiResponse<void>> {
    debugLog(`Calling DELETE /api/favorites/${id}`);
    return this.makeRequest<void>(`/api/favorites/${id}`, {
      method: 'DELETE',
    });
  }

  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    return this.makeRequest<{ status: string }>('/health');
  }
}

export const apiService = new ApiService();