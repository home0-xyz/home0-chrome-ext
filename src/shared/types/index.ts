// Shared types for the home0 Chrome extension

export interface Property {
  zpid: string;
  address: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  imageUrl?: string;
  listingUrl: string;
}

export interface Favorite extends Property {
  id: string;
  userId: string;
  notes?: string;
  tags?: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export type MessageType = 
  | 'OPEN_SIDEBAR'
  | 'CLOSE_SIDEBAR'
  | 'FAVORITE_PROPERTY'
  | 'UNFAVORITE_PROPERTY'
  | 'GET_FAVORITES'
  | 'AUTH_STATUS'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CHECK_AUTH'
  | 'GET_CURRENT_USER';

export interface Message<T = any> {
  type: MessageType;
  payload?: T;
}