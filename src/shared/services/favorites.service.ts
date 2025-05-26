// Service for managing favorite properties

export interface FavoriteProperty {
  zpid: string;
  url: string;
  address: string;
  price: string;
  details?: {
    beds?: number;
    baths?: number;
    sqft?: number;
  };
  favoritedAt: number;
  imageUrl?: string;
}

const FAVORITES_KEY = 'home0_favorites';

export class FavoritesService {
  private favorites: Map<string, FavoriteProperty> = new Map();
  private isLoaded: boolean = false;
  private loadPromise: Promise<void>;

  constructor() {
    this.loadPromise = this.loadFavorites();
  }

  private async loadFavorites() {
    try {
      const result = await chrome.storage.local.get(FAVORITES_KEY);
      const favorites = result[FAVORITES_KEY] || {};
      this.favorites = new Map(Object.entries(favorites));
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load favorites:', error);
      this.isLoaded = true; // Mark as loaded even on error
    }
  }

  public async waitForLoad(): Promise<void> {
    await this.loadPromise;
  }

  private async saveFavorites() {
    try {
      const favoritesObj = Object.fromEntries(this.favorites);
      await chrome.storage.local.set({ [FAVORITES_KEY]: favoritesObj });
      
      // Notify other parts of the extension
      chrome.runtime.sendMessage({
        type: 'FAVORITES_UPDATED',
        favorites: Array.from(this.favorites.values())
      });
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  public async addFavorite(property: Omit<FavoriteProperty, 'favoritedAt'>) {
    const favorite: FavoriteProperty = {
      ...property,
      favoritedAt: Date.now()
    };
    
    this.favorites.set(property.zpid, favorite);
    await this.saveFavorites();
    return favorite;
  }

  public async removeFavorite(zpid: string) {
    this.favorites.delete(zpid);
    await this.saveFavorites();
  }

  public isFavorited(zpid: string): boolean {
    return this.favorites.has(zpid);
  }

  public getFavorite(zpid: string): FavoriteProperty | undefined {
    return this.favorites.get(zpid);
  }

  public getAllFavorites(): FavoriteProperty[] {
    return Array.from(this.favorites.values())
      .sort((a, b) => b.favoritedAt - a.favoritedAt);
  }

  public getFavoritesCount(): number {
    return this.favorites.size;
  }

  // Listen for changes from other tabs/contexts
  public onFavoritesChanged(callback: (favorites: FavoriteProperty[]) => void) {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[FAVORITES_KEY]) {
        const newFavorites = changes[FAVORITES_KEY].newValue || {};
        this.favorites = new Map(Object.entries(newFavorites));
        callback(this.getAllFavorites());
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }
}