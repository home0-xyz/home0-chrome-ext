import { apiService } from './api.service';
import type { Property } from '../types';
import { debugLog } from '../config/environment';

export class FavoritesApiService {
  // Cache for quick lookups
  private favoritesCache: Map<string, Property> = new Map();
  private cacheLoaded: boolean = false;

  constructor() {
    this.loadCache();
  }

  private async loadCache() {
    try {
      const response = await apiService.getFavorites();
      if (response.success && response.data) {
        this.favoritesCache.clear();
        // Handle both array and object with favorites property
        const favorites = Array.isArray(response.data) ? response.data : ((response.data as any).favorites || []);
        debugLog('Loading favorites, data structure:', { 
          isArray: Array.isArray(response.data), 
          hasProperty: !!(response.data as any).favorites,
          count: favorites.length 
        });
        
        favorites.forEach((fav: any) => {
          const property: Property = {
            zpid: fav.zpid,
            address: fav.address,
            price: fav.price,
            beds: fav.beds,
            baths: fav.baths,
            sqft: fav.sqft,
            imageUrl: fav.imageUrl,
            listingUrl: fav.propertyUrl,
          };
          this.favoritesCache.set(fav.zpid, property);
        });
        this.cacheLoaded = true;
        debugLog('Favorites cache loaded:', this.favoritesCache.size);
      }
    } catch (error) {
      debugLog('Failed to load favorites cache:', error);
      this.cacheLoaded = true; // Mark as loaded even on error
    }
  }

  public async addFavorite(property: Property): Promise<void> {
    debugLog('Adding favorite:', property.zpid);
    
    const response = await apiService.addFavorite(property);
    if (response.success) {
      // Update cache
      this.favoritesCache.set(property.zpid, property);
      
      // Notify listeners
      this.notifyFavoritesChanged();
    } else {
      throw new Error(response.error || 'Failed to add favorite');
    }
  }

  public async removeFavorite(zpid: string): Promise<void> {
    debugLog('=== REMOVE FAVORITE START ===');
    debugLog('Removing favorite with zpid:', zpid);
    
    // First get all favorites to find the ID
    debugLog('Step 1: Getting fresh favorites list from API to find database ID...');
    const response = await apiService.getFavorites();
    
    if (response.success && response.data) {
      // Handle both array and object with favorites property
      const favorites = Array.isArray(response.data) ? response.data : ((response.data as any).favorites || []);
      debugLog('Found favorites:', favorites.length);
      const favorite = favorites.find((f: any) => f.zpid === zpid);
      
      if (favorite) {
        debugLog('Step 2: Found favorite in API response:', { id: favorite.id, zpid: favorite.zpid });
        debugLog('Step 3: Making DELETE request to API...');
        const deleteResponse = await apiService.removeFavorite(favorite.id);
        
        if (deleteResponse.success) {
          debugLog('Step 4: DELETE successful!');
          // Update cache
          this.favoritesCache.delete(zpid);
          
          // Notify listeners
          this.notifyFavoritesChanged();
          debugLog('=== REMOVE FAVORITE COMPLETE ===');
        } else {
          debugLog('Step 4: DELETE FAILED:', deleteResponse.error);
          throw new Error(deleteResponse.error || 'Failed to remove favorite');
        }
      } else {
        debugLog('ERROR: Favorite not found in API response for zpid:', zpid);
        debugLog('Available favorites:', favorites.map((f: any) => ({ id: f.id, zpid: f.zpid })));
        throw new Error('Favorite not found');
      }
    } else {
      debugLog('Failed to get favorites:', response.error);
      throw new Error('Failed to get favorites list');
    }
  }

  public async getAllFavorites(): Promise<Property[]> {
    const response = await apiService.getFavorites();
    if (response.success && response.data) {
      // Handle both array and object with favorites property
      const favorites = Array.isArray(response.data) ? response.data : ((response.data as any).favorites || []);
      // Update cache while we're at it
      this.favoritesCache.clear();
      const properties = favorites.map((fav: any) => {
        const property: Property = {
          zpid: fav.zpid,
          address: fav.address,
          price: fav.price,
          beds: fav.beds,
          baths: fav.baths,
          sqft: fav.sqft,
          imageUrl: fav.imageUrl,
          listingUrl: fav.propertyUrl,
        };
        this.favoritesCache.set(fav.zpid, property);
        return property;
      });
      return properties;
    }
    return [];
  }

  public isFavorited(zpid: string): boolean {
    // Use cache for quick checks
    return this.favoritesCache.has(zpid);
  }

  public getFavoritesCount(): number {
    return this.favoritesCache.size;
  }

  private notifyFavoritesChanged() {
    // Send message to all parts of the extension
    try {
      chrome.runtime.sendMessage({
        type: 'FAVORITES_UPDATED',
        favorites: Array.from(this.favoritesCache.values())
      }).catch(() => {
        // Ignore errors if no listeners
        debugLog('No listeners for favorites update');
      });
    } catch (error) {
      // Extension context might be invalidated
      debugLog('Failed to notify favorites changed:', error);
    }
  }

  public onFavoritesChanged(callback: (favorites: Property[]) => void) {
    const listener = (request: any) => {
      if (request.type === 'FAVORITES_UPDATED') {
        callback(request.favorites || []);
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }
}

export const favoritesApiService = new FavoritesApiService();