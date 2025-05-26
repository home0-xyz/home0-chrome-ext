import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/sidebar/components/ui/card';
import { Button } from '@/sidebar/components/ui/button';
import { ExternalLink, Trash2 } from 'lucide-react';
import { FavoritesService, FavoriteProperty } from '@/shared/services/favorites.service';
import { cn } from '@/shared/utils/cn';

export function FavoritesList() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoritesService] = useState(() => new FavoritesService());

  useEffect(() => {
    // Load initial favorites after service is ready
    const loadFavorites = async () => {
      await favoritesService.waitForLoad();
      const allFavorites = favoritesService.getAllFavorites();
      setFavorites(allFavorites);
      setIsLoading(false);
    };

    loadFavorites();

    // Listen for favorites changes
    const unsubscribe = favoritesService.onFavoritesChanged((updatedFavorites) => {
      setFavorites(updatedFavorites);
    });

    return () => {
      unsubscribe();
    };
  }, [favoritesService]);

  const handleRemove = async (zpid: string) => {
    await favoritesService.removeFavorite(zpid);
  };

  const handleOpen = (url: string) => {
    chrome.tabs.create({ url });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No favorites yet. Navigate to a property detail page and click "Make Favorite" to save properties!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {favorites.map((favorite) => (
        <Card key={favorite.zpid} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex gap-3">
              {favorite.imageUrl && (
                <img
                  src={favorite.imageUrl}
                  alt={favorite.address}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{favorite.address}</h3>
                <p className="text-lg font-semibold text-primary">{favorite.price}</p>
                {favorite.details && (
                  <p className="text-xs text-muted-foreground">
                    {favorite.details.beds} bd • {favorite.details.baths} ba • {favorite.details.sqft} sqft
                  </p>
                )}
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleOpen(favorite.url)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleRemove(favorite.zpid)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}