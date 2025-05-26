# API Integration Technical Research
## Stories #21-24 (Epic 5)

## 1. Cloudflare Workers API Setup with TypeScript

### Basic Worker Structure
```typescript
// src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'

export interface Env {
  DB: D1Database
  JWT_SECRET: string
  ALLOWED_ORIGINS: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS configuration for Chrome extension
app.use('*', cors({
  origin: (origin) => {
    // Allow Chrome extension origins
    if (origin.startsWith('chrome-extension://')) return origin
    // Allow configured origins
    return origin
  },
  credentials: true,
}))

// JWT middleware
app.use('/api/*', jwt({
  secret: (c) => c.env.JWT_SECRET,
}))

// Routes
app.get('/api/favorites', async (c) => {
  const userId = c.get('jwtPayload').sub
  const favorites = await c.env.DB.prepare(
    'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all()
  
  return c.json({ favorites: favorites.results })
})

app.post('/api/favorites', async (c) => {
  const userId = c.get('jwtPayload').sub
  const body = await c.req.json()
  
  const result = await c.env.DB.prepare(
    'INSERT INTO favorites (id, user_id, zpid, address, price, beds, baths, image_url, property_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    crypto.randomUUID(),
    userId,
    body.zpid,
    body.address,
    body.price,
    body.beds,
    body.baths,
    body.imageUrl,
    body.propertyUrl,
    new Date().toISOString()
  ).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.delete('/api/favorites/:id', async (c) => {
  const userId = c.get('jwtPayload').sub
  const { id } = c.req.param()
  
  await c.env.DB.prepare(
    'DELETE FROM favorites WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run()
  
  return c.json({ success: true })
})

export default app
```

### Wrangler Configuration
```toml
# wrangler.toml
name = "home0-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "home0-favorites"
database_id = "your-database-id"

[vars]
ALLOWED_ORIGINS = "chrome-extension://your-extension-id"

# JWT_SECRET should be set via wrangler secret
# wrangler secret put JWT_SECRET
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## 2. D1 Database Schema for Favorites

### Schema Definition
```sql
-- schema.sql
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  zpid TEXT NOT NULL,
  address TEXT NOT NULL,
  price INTEGER NOT NULL,
  beds REAL,
  baths REAL,
  square_feet INTEGER,
  image_url TEXT,
  property_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  notes TEXT,
  UNIQUE(user_id, zpid)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user_zpid ON favorites(user_id, zpid);
```

### Migration Script
```bash
# Create database
wrangler d1 create home0-favorites

# Apply schema
wrangler d1 execute home0-favorites --file=./schema.sql

# For local development
wrangler d1 execute home0-favorites --local --file=./schema.sql
```

## 3. API Client Patterns for Chrome Extensions

### API Client Implementation
```typescript
// src/services/api/client.ts
import { getAuthToken } from '../auth/clerk'

export interface Favorite {
  id: string
  zpid: string
  address: string
  price: number
  beds?: number
  baths?: number
  squareFeet?: number
  imageUrl?: string
  propertyUrl: string
  createdAt: string
  updatedAt?: string
  notes?: string
}

export interface ApiError {
  message: string
  code: string
  status: number
}

class ApiClient {
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor(baseUrl: string = 'https://api.home0.xyz') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error: ApiError = {
        message: response.statusText,
        code: `HTTP_${response.status}`,
        status: response.status,
      }
      
      try {
        const errorData = await response.json()
        error.message = errorData.message || error.message
        error.code = errorData.code || error.code
      } catch {
        // Ignore JSON parse errors
      }
      
      throw error
    }

    return response.json()
  }

  async getFavorites(useCache = true): Promise<Favorite[]> {
    const cacheKey = 'favorites'
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    const { favorites } = await this.request<{ favorites: Favorite[] }>('/api/favorites')
    
    this.cache.set(cacheKey, {
      data: favorites,
      timestamp: Date.now(),
    })
    
    return favorites
  }

  async addFavorite(favorite: Omit<Favorite, 'id' | 'createdAt'>): Promise<string> {
    const { id } = await this.request<{ id: string }>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(favorite),
    })
    
    // Invalidate cache
    this.cache.delete('favorites')
    
    return id
  }

  async removeFavorite(id: string): Promise<void> {
    await this.request(`/api/favorites/${id}`, {
      method: 'DELETE',
    })
    
    // Invalidate cache
    this.cache.delete('favorites')
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const apiClient = new ApiClient()
```

### Message Passing for API Calls
```typescript
// src/background/messageHandlers.ts
import { apiClient } from '../services/api/client'
import { offlineQueue } from '../services/offline/queue'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'API_REQUEST') {
    handleApiRequest(request.payload)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }))
    
    return true // Keep channel open for async response
  }
})

async function handleApiRequest(payload: any) {
  const { method, ...params } = payload
  
  try {
    switch (method) {
      case 'getFavorites':
        return await apiClient.getFavorites()
      
      case 'addFavorite':
        return await apiClient.addFavorite(params.favorite)
      
      case 'removeFavorite':
        return await apiClient.removeFavorite(params.id)
      
      default:
        throw new Error(`Unknown API method: ${method}`)
    }
  } catch (error) {
    if (!navigator.onLine) {
      // Queue for offline processing
      await offlineQueue.add(method, params)
      throw new Error('Offline - request queued')
    }
    throw error
  }
}
```

## 4. Offline Queue Implementation Patterns

### Offline Queue Service
```typescript
// src/services/offline/queue.ts
interface QueuedRequest {
  id: string
  method: string
  params: any
  timestamp: number
  retries: number
}

export class OfflineQueue {
  private readonly STORAGE_KEY = 'offline_queue'
  private readonly MAX_RETRIES = 3
  private isProcessing = false

  async add(method: string, params: any): Promise<void> {
    const queue = await this.getQueue()
    const request: QueuedRequest = {
      id: crypto.randomUUID(),
      method,
      params,
      timestamp: Date.now(),
      retries: 0,
    }
    
    queue.push(request)
    await this.saveQueue(queue)
    
    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue()
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return
    
    this.isProcessing = true
    const queue = await this.getQueue()
    const processed: string[] = []
    
    for (const request of queue) {
      try {
        await this.processRequest(request)
        processed.push(request.id)
      } catch (error) {
        request.retries++
        if (request.retries >= this.MAX_RETRIES) {
          processed.push(request.id) // Remove after max retries
          console.error('Max retries reached for request:', request)
        }
      }
    }
    
    // Remove processed requests
    const remaining = queue.filter(r => !processed.includes(r.id))
    await this.saveQueue(remaining)
    
    this.isProcessing = false
  }

  private async processRequest(request: QueuedRequest): Promise<void> {
    const { method, params } = request
    
    switch (method) {
      case 'addFavorite':
        await apiClient.addFavorite(params.favorite)
        break
      
      case 'removeFavorite':
        await apiClient.removeFavorite(params.id)
        break
      
      default:
        throw new Error(`Unknown offline method: ${method}`)
    }
  }

  private async getQueue(): Promise<QueuedRequest[]> {
    const result = await chrome.storage.local.get(this.STORAGE_KEY)
    return result[this.STORAGE_KEY] || []
  }

  private async saveQueue(queue: QueuedRequest[]): Promise<void> {
    await chrome.storage.local.set({ [this.STORAGE_KEY]: queue })
  }
}

export const offlineQueue = new OfflineQueue()

// Listen for online/offline events
window.addEventListener('online', () => {
  offlineQueue.processQueue()
})
```

## 5. Optimistic Updates with Rollback

### Optimistic Update Store
```typescript
// src/services/optimistic/store.ts
import { apiClient, Favorite } from '../api/client'
import { EventEmitter } from 'events'

interface OptimisticOperation {
  id: string
  type: 'add' | 'remove' | 'update'
  data: any
  rollback: () => void
}

export class OptimisticStore extends EventEmitter {
  private favorites: Favorite[] = []
  private operations: Map<string, OptimisticOperation> = new Map()

  async loadFavorites(): Promise<Favorite[]> {
    try {
      this.favorites = await apiClient.getFavorites()
      this.emit('update', this.favorites)
      return this.favorites
    } catch (error) {
      // Return cached data if offline
      return this.favorites
    }
  }

  async addFavorite(favorite: Omit<Favorite, 'id' | 'createdAt'>): Promise<void> {
    const tempId = `temp_${Date.now()}`
    const optimisticFavorite: Favorite = {
      ...favorite,
      id: tempId,
      createdAt: new Date().toISOString(),
    }
    
    // Optimistic update
    this.favorites.unshift(optimisticFavorite)
    this.emit('update', this.favorites)
    
    // Create rollback function
    const rollback = () => {
      this.favorites = this.favorites.filter(f => f.id !== tempId)
      this.emit('update', this.favorites)
    }
    
    const operation: OptimisticOperation = {
      id: tempId,
      type: 'add',
      data: optimisticFavorite,
      rollback,
    }
    
    this.operations.set(tempId, operation)
    
    try {
      // Actual API call
      const realId = await apiClient.addFavorite(favorite)
      
      // Update with real ID
      const index = this.favorites.findIndex(f => f.id === tempId)
      if (index !== -1) {
        this.favorites[index].id = realId
      }
      
      this.operations.delete(tempId)
      this.emit('update', this.favorites)
    } catch (error) {
      // Rollback on error
      rollback()
      this.operations.delete(tempId)
      throw error
    }
  }

  async removeFavorite(id: string): Promise<void> {
    // Find and store the favorite for rollback
    const favoriteIndex = this.favorites.findIndex(f => f.id === id)
    if (favoriteIndex === -1) return
    
    const removedFavorite = this.favorites[favoriteIndex]
    
    // Optimistic update
    this.favorites.splice(favoriteIndex, 1)
    this.emit('update', this.favorites)
    
    // Create rollback function
    const rollback = () => {
      this.favorites.splice(favoriteIndex, 0, removedFavorite)
      this.emit('update', this.favorites)
    }
    
    const operation: OptimisticOperation = {
      id,
      type: 'remove',
      data: removedFavorite,
      rollback,
    }
    
    this.operations.set(id, operation)
    
    try {
      // Actual API call
      await apiClient.removeFavorite(id)
      this.operations.delete(id)
    } catch (error) {
      // Rollback on error
      rollback()
      this.operations.delete(id)
      throw error
    }
  }

  getFavorites(): Favorite[] {
    return [...this.favorites]
  }

  isFavorited(zpid: string): boolean {
    return this.favorites.some(f => f.zpid === zpid)
  }
}

export const optimisticStore = new OptimisticStore()
```

### React Hook for Optimistic Updates
```typescript
// src/hooks/useFavorites.ts
import { useState, useEffect, useCallback } from 'react'
import { optimisticStore } from '../services/optimistic/store'
import { Favorite } from '../services/api/client'
import { toast } from 'sonner'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load initial data
    setLoading(true)
    optimisticStore.loadFavorites()
      .then(() => setFavorites(optimisticStore.getFavorites()))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    // Listen for updates
    const handleUpdate = (updatedFavorites: Favorite[]) => {
      setFavorites([...updatedFavorites])
    }

    optimisticStore.on('update', handleUpdate)

    return () => {
      optimisticStore.off('update', handleUpdate)
    }
  }, [])

  const addFavorite = useCallback(async (favorite: Omit<Favorite, 'id' | 'createdAt'>) => {
    try {
      await optimisticStore.addFavorite(favorite)
      toast.success('Property saved to favorites')
    } catch (error) {
      toast.error('Failed to save property')
      throw error
    }
  }, [])

  const removeFavorite = useCallback(async (id: string) => {
    try {
      await optimisticStore.removeFavorite(id)
      toast.success('Property removed from favorites')
    } catch (error) {
      toast.error('Failed to remove property')
      throw error
    }
  }, [])

  const isFavorited = useCallback((zpid: string) => {
    return optimisticStore.isFavorited(zpid)
  }, [favorites]) // Re-run when favorites change

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorited,
  }
}
```

## Additional Resources

### Cloudflare Workers Documentation
- [Workers TypeScript](https://developers.cloudflare.com/workers/languages/typescript/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Hono Framework](https://hono.dev/)
- [Workers CORS](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)

### Chrome Extension Patterns
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
- [Message Passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)

### Offline-First Patterns
- [IndexedDB for large data](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Worker Background Sync](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)

### Best Practices
1. **Error Handling**: Always provide user feedback for failed operations
2. **Rate Limiting**: Implement client-side rate limiting to prevent API abuse
3. **Data Sync**: Use timestamps and version numbers for conflict resolution
4. **Security**: Never expose API keys in extension code
5. **Performance**: Batch API requests when possible
6. **Testing**: Mock API responses for development and testing