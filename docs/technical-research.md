# Technical Research: Chrome Extension Sidebar UI

## Overview
Research findings for implementing Stories #13-16: Chrome extension sidebar UI with React, favorites management, and persistent state across page navigation.

## 1. Chrome Extension Sidebar Implementation Options

### Option A: Native Chrome Side Panel API (Recommended for Chrome 114+)
**Pros:**
- Native Chrome integration
- No injection needed
- Better performance
- Cleaner architecture

**Implementation:**
```json
{
  "name": "Home0",
  "permissions": ["sidePanel"],
  "side_panel": {
    "default_path": "sidepanel.html"
  }
}
```

### Option B: Iframe Injection via Content Script
**Pros:**
- Works on older Chrome versions
- Full control over positioning
- Isolated execution context

**Implementation:**
```javascript
// content-script.js
const iframe = document.createElement('iframe');
iframe.style.cssText = `
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  height: 100%;
  z-index: 9999;
  border: none;
`;
iframe.src = chrome.runtime.getURL("sidebar.html");
document.body.appendChild(iframe);
```

## 2. Shadow DOM vs Iframe for Style Isolation

### Shadow DOM (Recommended)
**Advantages:**
- Native web standard
- Direct DOM access
- No communication overhead
- Better performance

**Implementation with React:**
```javascript
import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const shadowHost = document.createElement('div');
document.body.appendChild(shadowHost);
const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

const emotionRoot = document.createElement('div');
shadowRoot.appendChild(emotionRoot);

const cache = createCache({
  key: 'home0',
  container: shadowRoot,
});

createRoot(emotionRoot).render(
  <CacheProvider value={cache}>
    <App />
  </CacheProvider>
);
```

### Iframe
**Advantages:**
- Complete isolation
- Can load separate React app
- Easier development with hot reload

**Disadvantages:**
- Communication complexity
- Performance overhead
- Size constraints

## 3. State Persistence Across Page Navigation

### Storage Strategy
```javascript
// State persistence using Chrome Storage API
const saveState = async (state) => {
  await chrome.storage.local.set({ sidebarState: state });
};

const loadState = async () => {
  const result = await chrome.storage.local.get('sidebarState');
  return result.sidebarState || defaultState;
};

// Listen for storage changes across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.sidebarState) {
    updateSidebarState(changes.sidebarState.newValue);
  }
});
```

### Background Script Communication
```javascript
// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'STATE_UPDATE') {
    // Broadcast to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SYNC_STATE',
          state: request.state
        });
      });
    });
  }
});
```

## 4. Mock Data Structures for Favorites

### Bookmark/Favorite Structure
```typescript
interface Favorite {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  tags: string[];
  created: number;
  lastVisited?: number;
  customColor?: string;
}

interface FavoriteGroup {
  id: string;
  name: string;
  color: string;
  favorites: Favorite[];
  collapsed: boolean;
  order: number;
}

interface SidebarState {
  groups: FavoriteGroup[];
  searchQuery: string;
  activeGroupId?: string;
  sidebarWidth: number;
  theme: 'light' | 'dark' | 'auto';
}
```

### Mock Data Example
```javascript
const mockData = {
  groups: [
    {
      id: 'work',
      name: 'Work',
      color: '#4A90E2',
      collapsed: false,
      order: 0,
      favorites: [
        {
          id: '1',
          title: 'GitHub - Project Repo',
          url: 'https://github.com/company/project',
          favicon: 'https://github.com/favicon.ico',
          tags: ['development', 'git'],
          created: Date.now() - 86400000,
          lastVisited: Date.now() - 3600000
        },
        {
          id: '2',
          title: 'Jira Board',
          url: 'https://company.atlassian.net/board',
          tags: ['project-management'],
          created: Date.now() - 172800000
        }
      ]
    },
    {
      id: 'personal',
      name: 'Personal',
      color: '#50E3C2',
      collapsed: true,
      order: 1,
      favorites: [
        {
          id: '3',
          title: 'News Site',
          url: 'https://news.ycombinator.com',
          tags: ['tech', 'news'],
          created: Date.now() - 259200000
        }
      ]
    }
  ],
  searchQuery: '',
  sidebarWidth: 320,
  theme: 'auto'
};
```

## 5. React Component Architecture

### Sidebar Component Structure
```
<SidebarProvider>
  <Sidebar>
    <SidebarHeader>
      <SearchBar />
      <AddFavoriteButton />
    </SidebarHeader>
    <SidebarContent>
      <FavoriteGroups>
        <FavoriteGroup>
          <GroupHeader />
          <FavoritesList>
            <FavoriteItem />
          </FavoritesList>
        </FavoriteGroup>
      </FavoriteGroups>
    </SidebarContent>
    <SidebarFooter>
      <SettingsButton />
    </SidebarFooter>
  </Sidebar>
</SidebarProvider>
```

## 6. Development Setup with React

### Using CRXJS with Vite
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
});
```

### Manifest Configuration
```json
{
  "manifest_version": 3,
  "name": "Home0",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "tabs",
    "bookmarks"
  ],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-script.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "web_accessible_resources": [
    {
      "resources": ["sidebar.html", "*.js", "*.css"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

## 7. Key Technical Decisions

1. **Use Shadow DOM** for style isolation instead of iframe (better performance, easier state management)
2. **Implement Chrome Side Panel API** for Chrome 114+ with fallback to content script injection
3. **Use Chrome Storage API** for state persistence with background script for cross-tab synchronization
4. **Structure favorites as nested groups** with tags for flexible organization
5. **Implement React with Emotion** for styled components within Shadow DOM
6. **Use CRXJS + Vite** for modern development experience with HMR

## 8. Implementation Priorities

1. Start with basic iframe injection to validate UI/UX
2. Implement state management with Chrome Storage API
3. Add Shadow DOM support for better isolation
4. Migrate to Chrome Side Panel API for supported versions
5. Optimize performance and add advanced features

## Resources

- [Chrome Side Panel API Documentation](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
- [Shadow DOM "the right way" in 2024](https://dev.to/nitipit/shadow-dom-the-right-way-in-2024-574i)
- [CRXJS - Vite Plugin for Chrome Extensions](https://crxjs.dev/vite-plugin)
- [React Shadow - React in Shadow DOM](https://github.com/Wildhoney/ReactShadow)