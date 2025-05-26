# Story #9: Install and Configure shadcn/ui - Technical Details

## Overview
This document provides comprehensive technical details for implementing Story #9 from the Sprint Backlog: setting up shadcn/ui with Tailwind CSS in a Chrome extension environment.

## Setup Commands

### 1. Initialize Project Structure (if not already done)
```bash
# Create Vite React TypeScript project
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install react@19 react-dom@19
npm install -D @types/react@19 @types/react-dom@19
```

### 2. Install and Configure Tailwind CSS v3
```bash
# Install Tailwind CSS v3 (recommended for Chrome extensions)
npm install -D tailwindcss@3 postcss autoprefixer

# Initialize Tailwind config
npx tailwindcss init -p
```

### 3. Configure TypeScript Path Aliases
Add to both `tsconfig.json` and `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 4. Update Vite Configuration
```typescript
// vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
        sidebar: path.resolve(__dirname, 'src/sidebar/index.html'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
        content: path.resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
```

### 5. Configure Tailwind CSS
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 6. Create Global CSS File
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 7. Initialize shadcn/ui
```bash
# Install animation plugin
npm install -D tailwindcss-animate

# Initialize shadcn/ui (use version 2.3.0 for Tailwind v3 compatibility)
npx shadcn@2.3.0 init
```

When prompted, select:
- Style: `default`
- Base color: `neutral`
- Use CSS variables: `yes`
- Where is your global CSS file?: `src/index.css`
- Would you like to use TypeScript?: `yes`
- Where is your tsconfig.json file?: `tsconfig.json`
- Configure import alias: `@/*` -> `./src/*`
- Configure components alias: `@/components`
- Configure utils alias: `@/lib/utils`

### 8. Install Required shadcn/ui Components
```bash
# Install the required components mentioned in Story #9
npx shadcn@2.3.0 add card
npx shadcn@2.3.0 add button
npx shadcn@2.3.0 add scroll-area
npx shadcn@2.3.0 add skeleton
```

### 9. Install Lucide React Icons
```bash
npm install lucide-react
```

### 10. Create lib/utils.ts
```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Chrome Extension Specific Considerations

### 1. Content Script CSS Isolation
For the sidebar that injects into Zillow pages, use Shadow DOM:

```typescript
// src/content/sidebar-root.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Sidebar } from '../sidebar/Sidebar'
import sidebarStyles from '../sidebar/sidebar.css?inline'

export function createSidebarRoot() {
  // Create container
  const container = document.createElement('div')
  container.id = 'home0-sidebar-container'
  
  // Attach shadow root
  const shadowRoot = container.attachShadow({ mode: 'open' })
  
  // Create style element
  const styleElement = document.createElement('style')
  styleElement.textContent = sidebarStyles
  shadowRoot.appendChild(styleElement)
  
  // Create root element
  const rootElement = document.createElement('div')
  rootElement.id = 'home0-sidebar-root'
  shadowRoot.appendChild(rootElement)
  
  // Append to body
  document.body.appendChild(container)
  
  // Render React app
  const root = ReactDOM.createRoot(rootElement)
  root.render(<Sidebar />)
}
```

### 2. CSS Variables in Shadow DOM
Replace `:root` with `:host` for CSS variables:

```css
/* src/sidebar/sidebar.css */
@import '../index.css';

/* Replace :root with :host for shadow DOM */
:host {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... rest of variables */
}
```

### 3. Handle REM Units
Install postcss plugin to convert rem to px:

```bash
npm install -D postcss-rem-to-pixel
```

Update PostCSS config:
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-pixel': {
      rootValue: 16,
      propList: ['*'],
    },
  },
}
```

### 4. Portal Container for Dialogs/Modals
For components that use portals (dialogs, dropdowns), provide a custom container:

```typescript
// src/sidebar/components/PortalProvider.tsx
import React, { createContext, useContext, useRef } from 'react'

const PortalContext = createContext<HTMLElement | null>(null)

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const portalRef = useRef<HTMLDivElement>(null)
  
  return (
    <>
      <PortalContext.Provider value={portalRef.current}>
        {children}
      </PortalContext.Provider>
      <div ref={portalRef} id="portal-container" />
    </>
  )
}

export function usePortalContainer() {
  return useContext(PortalContext)
}
```

## Verification Checklist

After setup, verify:
- [ ] Tailwind CSS classes work in components
- [ ] shadcn/ui components render correctly
- [ ] CSS variables are properly defined
- [ ] Card component displays with proper styling
- [ ] Button component has correct hover states
- [ ] ScrollArea component scrolls properly
- [ ] Skeleton component shows loading animation
- [ ] Lucide icons render at correct size
- [ ] Theme matches UI specification colors
- [ ] Build process completes without errors
- [ ] Extension loads in Chrome developer mode

## Common Issues and Solutions

### Issue 1: CSS not loading in content script
**Solution**: Import CSS as inline string and inject into Shadow DOM

### Issue 2: REM units inconsistent
**Solution**: Use postcss-rem-to-pixel plugin to convert to px

### Issue 3: Dropdowns/modals appear outside sidebar
**Solution**: Use custom portal container within Shadow DOM

### Issue 4: Dark mode not working
**Solution**: Add dark class to root element in Shadow DOM

### Issue 5: Tailwind IntelliSense not working
**Solution**: Install Tailwind CSS IntelliSense VS Code extension and restart

## Next Steps

After completing this setup:
1. Create the sidebar component structure
2. Implement the authentication UI components
3. Build the favorites list with mock data
4. Test the extension in Chrome developer mode

This completes the technical setup for Story #9. The project now has a solid foundation with shadcn/ui, Tailwind CSS, and proper Chrome extension configuration.