# UI Specification Document
## home0 Chrome Extension

### Design System
- **Component Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Design Philosophy**: Clean, minimal, functional

### Color Palette
Using shadcn/ui default theme with slight modifications:
```css
--primary: hsl(222.2 47.4% 11.2%)       /* Near black for primary actions */
--primary-foreground: hsl(210 40% 98%)  /* White text on primary */
--secondary: hsl(210 40% 96.1%)         /* Light gray backgrounds */
--accent: hsl(210 40% 96.1%)           /* Subtle accents */
--destructive: hsl(0 84.2% 60.2%)      /* Red for errors/remove */
--muted: hsl(210 40% 96.1%)            /* Muted backgrounds */
--card: hsl(0 0% 100%)                 /* White cards */
--popover: hsl(0 0% 100%)              /* White popovers */
--border: hsl(214.3 31.8% 91.4%)       /* Light borders */
```

### Typography
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
--font-size-xs: 0.75rem   /* 12px */
--font-size-sm: 0.875rem  /* 14px */
--font-size-base: 1rem    /* 16px */
```

### Component Specifications

#### 1. Sidebar Container
```jsx
// Using shadcn/ui Sheet component as base
width: 380px
background: white
border-left: 1px solid var(--border)
box-shadow: -4px 0 6px -1px rgb(0 0 0 / 0.05)
```

#### 2. Sidebar Header
```jsx
<div className="flex items-center justify-between p-4 border-b">
  <h2 className="text-lg font-semibold">home0</h2>
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="icon">
      <User className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon">
      <X className="h-4 w-4" />
    </Button>
  </div>
</div>
```

#### 3. Auth Components

**Signed Out State:**
```jsx
<Card className="m-4">
  <CardContent className="pt-6">
    <div className="text-center space-y-4">
      <Home className="h-12 w-12 mx-auto text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Sign in to save your favorite homes
      </p>
      <SignIn routing="hash" />  {/* Clerk component */}
    </div>
  </CardContent>
</Card>
```

#### 4. Favorites List Container
```jsx
<ScrollArea className="flex-1">
  <div className="p-4 space-y-3">
    {favorites.map(fav => <FavoriteCard key={fav.id} {...fav} />)}
  </div>
</ScrollArea>
```

#### 5. Favorite Card Component
```jsx
<Card className="overflow-hidden hover:shadow-md transition-shadow">
  <CardContent className="p-3">
    <div className="flex gap-3">
      {/* Thumbnail */}
      <img 
        src={property.image} 
        className="w-16 h-16 rounded object-cover"
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {property.address}
        </p>
        <p className="text-sm text-muted-foreground">
          ${property.price.toLocaleString()} ({property.beds}bd/{property.baths}ba)
        </p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(property.favoritedAt)}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <BarChart3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 6. Empty State
```jsx
<div className="flex flex-col items-center justify-center h-full p-8">
  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
  <p className="text-center text-muted-foreground">
    No favorites yet. Click the heart icon on any Zillow listing to save it here.
  </p>
</div>
```

#### 7. Favorite Button (Injected on Zillow)
```jsx
// Minimal floating button
<Button 
  size="icon"
  variant={isFavorited ? "default" : "outline"}
  className="h-8 w-8 rounded-full shadow-lg"
>
  <Heart className={cn(
    "h-4 w-4",
    isFavorited && "fill-current"
  )} />
</Button>

// Glow effect on favorited property
.property-card.favorited {
  box-shadow: 0 0 0 2px hsl(222.2 47.4% 11.2%);
}
```

#### 8. Loading States
```jsx
// Skeleton loader for favorite cards
<Card>
  <CardContent className="p-3">
    <div className="flex gap-3">
      <Skeleton className="w-16 h-16 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Interaction States

#### Hover Effects
- Cards: Subtle shadow increase
- Buttons: Background color change per shadcn defaults
- Remove button: Appears on card hover

#### Click Feedback
- Favorite button: Instant fill animation
- Property glow: 300ms transition
- Card clicks: Ripple effect (optional)

### Responsive Behavior
- Sidebar fixed width (380px)
- Cards adapt to sidebar width
- Text truncation for long addresses
- Minimum sidebar height: 500px

### Animation Specifications
```css
/* Favorite button pulse */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.favorite-button.just-clicked {
  animation: pulse 0.3s ease-in-out;
}

/* Property glow */
.property-glow {
  transition: box-shadow 0.3s ease-in-out;
}
```

### Accessibility
- All interactive elements keyboard accessible
- ARIA labels for icon buttons
- Focus indicators following shadcn defaults
- Screen reader announcements for state changes

### Implementation Notes
1. Install shadcn/ui components:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add card button scroll-area skeleton
   ```

2. Use Lucide React for icons:
   ```bash
   npm install lucide-react
   ```

3. Clerk components integrate directly:
   ```jsx
   import { SignIn, UserButton } from "@clerk/chrome-extension"
   ```

This specification provides a clean, minimal design that aligns with modern web standards while maintaining the home0 brand identity.