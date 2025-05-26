import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/sidebar/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { FavoritesService } from '@/shared/services/favorites.service';
import { useAuth } from '@/sidebar/hooks/useAuth';

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
  const [favoritesService] = useState(() => new FavoritesService());
  const { isAuthenticated } = useAuth();

  // Check for current property on mount and listen for updates
  useEffect(() => {
    const initializeProperty = async () => {
      // Ensure favorites are loaded
      await favoritesService.waitForLoad();

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
    };

    initializeProperty();

    // Listen for property updates
    const messageListener = (request: any) => {
      if (request.type === 'PROPERTY_INFO_UPDATE') {
        if (request.property) {
          setCurrentProperty(request.property);
          // Check favorite status immediately since service should be loaded
          favoritesService.waitForLoad().then(() => {
            setIsFavorited(favoritesService.isFavorited(request.property.zpid));
          });
        } else {
          setCurrentProperty(null);
          setIsFavorited(false);
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Listen for favorites changes
    const unsubscribe = favoritesService.onFavoritesChanged((favorites) => {
      // We need to check the current property in a separate effect
    });

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      unsubscribe();
    };
  }, [favoritesService]);

  // Separate effect to handle favorites changes for current property
  useEffect(() => {
    if (!currentProperty) return;

    const unsubscribe = favoritesService.onFavoritesChanged((favorites) => {
      setIsFavorited(favorites.some(fav => fav.zpid === currentProperty.zpid));
    });

    return unsubscribe;
  }, [currentProperty, favoritesService]);

  const handleClick = async () => {
    if (!currentProperty || isLoading) return;
    
    // Double-check authentication
    if (!isAuthenticated) {
      console.warn('User must be authenticated to favorite properties');
      return;
    }

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

  const isDisabled = !currentProperty || isLoading || !isAuthenticated;

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
        title={!isAuthenticated ? "Sign in to favorite properties" : undefined}
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