# Technical Details for Stories #25-28 (Polish & Production)

## Story #25: Sentry Integration

### Key Challenges with Manifest V3
- Background scripts run as service workers without DOM access
- Sentry expects window/document objects that aren't available
- Manifest V3 doesn't support remotely hosted code

### Implementation Approach

#### 1. Manual Client Setup
```javascript
// background.js - Service Worker context
import { BrowserClient, defaultStackParser, makeFetchTransport } from '@sentry/browser';

// Filter out integrations that use global state
const client = new BrowserClient({
  dsn: 'YOUR_SENTRY_DSN',
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: (integrations) => 
    integrations.filter(integration => 
      !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(integration.name)
    )
});
```

#### 2. Including Sentry Library Locally
- Download from Sentry CDN (latest: 7.x)
- Use `bundle.es5.js` (unminified) for Chrome Web Store review
- Include in extension bundle, don't use remote loading

#### 3. Context-Specific Implementation
- Initialize Sentry separately in:
  - Background service worker
  - Content scripts
  - Sidebar React app
- Each context needs its own initialization

### Current Status (2024)
- Sentry v8 requires scope-based initialization
- No global `Sentry.init()` for browser extensions
- Manual setup required for each context

## Story #26: Performance Optimization

### Service Worker Optimization
- Event-driven architecture (activate only when needed)
- Service workers are ephemeral, not persistent
- Move DOM operations to offscreen documents

### Resource Loading
- Lazy load resources until needed
- Minimal startup function
- Use dynamic imports for conditional features

### Vite Bundle Optimization

#### Build Configuration
```javascript
// vite.config.ts
export default {
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-*']
        }
      }
    },
    chunkSizeWarningLimit: 500 // kB
  }
}
```

#### Best Practices
1. **Avoid barrel files** - Import directly: `import { thing } from './utils/thing.js'`
2. **Use native tooling** - Consider `@vitejs/plugin-react-swc` over babel
3. **Dynamic imports** for large dependencies
4. **Bundle analysis** - Use `rollup-plugin-visualizer`
5. **Optimize SVGs** - Import as strings/URLs, not React components

### Network Request Handling
- Use `declarativeNetRequest` API instead of `webRequest`
- Declarative approach for better performance
- Fewer permissions required

## Story #27: Chrome Web Store Submission

### Manifest V3 Requirements (2024)

#### Code Requirements
- Self-contained logic (no external scripts)
- No `eval()` or dynamic code execution
- External resources must not contain logic
- Include all code in submission

#### Timeline & Deadlines
- **June 2024**: Manifest V2 phase-out begins
- **June 2025**: Enterprise deadline
- Featured badges removed from V2 extensions
- V2 extensions auto-disabled in Chrome 127+

#### Review Process
- **Review time**: Usually < 24 hours, 90% within 3 days
- **Max wait**: Contact support after 3 weeks
- **Publication window**: 30 days after approval

#### Submission Checklist
1. Complete Manifest V3 migration
2. Remove all remote code references
3. Request minimal permissions
4. Include unminified code for review
5. Beta test before full release

## Story #28: Cross-Browser Testing

### Browser Compatibility Strategy

#### WebExtensions API Support
- **Chrome**: `chrome.*` namespace only
- **Firefox**: Both `browser.*` (promises) and `chrome.*` (callbacks)
- **Edge**: `chrome.*` namespace (Chromium-based)
- **Safari**: Limited WebExtensions support

#### Recommended Approach
1. **Target Firefox** with `browser.*` API
2. **Use WebExtension Polyfill** for cross-browser compatibility
   ```bash
   npm install webextension-polyfill
   # or for TypeScript
   npm install webextension-polyfill-ts
   ```

3. **Code Example**
   ```javascript
   // With polyfill - works everywhere
   import browser from 'webextension-polyfill';
   
   // Uses promises in all browsers
   const tabs = await browser.tabs.query({ active: true });
   ```

#### Testing Tools
- **Browserling**: Live cross-browser testing
- **Manual testing**: Chrome, Firefox, Edge, Safari (if supported)
- **Automated testing**: Selenium with multiple browser drivers

#### Best Practices
1. **Version Management**: Each store requires unique version numbers
2. **API Differences**: Test storage, messaging, and permissions
3. **UI Differences**: Check popup sizing, sidebar behavior
4. **Performance**: Verify on different engines (V8, SpiderMonkey)

### Implementation Priority
1. Chrome (primary target)
2. Edge (same codebase)
3. Firefox (with polyfill)
4. Safari (if feasible)

## Summary of Key Technical Considerations

### Sentry
- Manual setup required for service workers
- Local library inclusion
- Context-specific initialization

### Performance
- Event-driven service workers
- Vite bundle optimization
- Declarative APIs

### Chrome Web Store
- Manifest V3 mandatory
- Self-contained code
- Quick review process

### Cross-Browser
- WebExtension polyfill
- Firefox-first development
- Test on all target browsers