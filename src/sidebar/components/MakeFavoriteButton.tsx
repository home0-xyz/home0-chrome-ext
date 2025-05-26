import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/sidebar/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { FavoritesService } from '@/shared/services/favorites.service';

interface PropertyInfo {
  zpid: string;
  url: string;
  address: string;
  price: string;
  details?: {
    beds?: number;
    baths?: number;
    sqft?: number;
  };
  imageUrl?: string;
}

export function MakeFavoriteButton() {
  const [currentProperty, setCurrentProperty] = useState<PropertyInfo | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const favoritesService = new FavoritesService();

  // Check for current property on mount and listen for updates
  useEffect(() => {
    // Get initial property info
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_PROPERTY_INFO' }, (response) => {
      if (response?.property) {
        setCurrentProperty(response.property);
        setIsFavorited(favoritesService.isFavorited(response.property.zpid));
      }
    });

    // Request property info from content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_CURRENT_PROPERTY' }, (response) => {
          if (response?.property) {
            setCurrentProperty(response.property);
            setIsFavorited(favoritesService.isFavorited(response.property.zpid));
          }
        });
      }
    });

    // Listen for property updates
    const messageListener = (request: any) => {
      if (request.type === 'PROPERTY_INFO_UPDATE') {
        if (request.property) {
          setCurrentProperty(request.property);
          setIsFavorited(favoritesService.isFavorited(request.property.zpid));
        } else {
          setCurrentProperty(null);
          setIsFavorited(false);
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Listen for favorites changes
    const favoritesListener = (favorites: any[]) => {
      if (currentProperty) {
        setIsFavorited(favorites.some(fav => fav.zpid === currentProperty.zpid));
      }
    };

    favoritesService.onFavoritesChanged(favoritesListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleClick = async () => {
    if (!currentProperty || isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorited) {
        await favoritesService.removeFavorite(currentProperty.zpid);
        setIsFavorited(false);
      } else {
        await favoritesService.addFavorite({
          zpid: currentProperty.zpid,
          url: currentProperty.url,
          address: currentProperty.address,
          price: currentProperty.price,
          details: currentProperty.details,
          imageUrl: currentProperty.imageUrl
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !currentProperty || isLoading;

  return (
    <div className="p-4 border-b">
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "w-full",
          isFavorited && "bg-amber-500 hover:bg-amber-600 text-white"
        )}
        variant={isFavorited ? "default" : "outline"}
      >
        <Heart
          className={cn(
            "mr-2 h-4 w-4",
            isFavorited && "fill-current"
          )}
        />
        {isFavorited ? "Remove from Favorites" : "Make Favorite"}
      </Button>
      
      {currentProperty && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {currentProperty.address}
        </div>
      )}
      
      {!currentProperty && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Navigate to a property detail page to favorite it
        </div>
      )}
    </div>
  );
}