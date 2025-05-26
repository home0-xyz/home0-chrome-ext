# How to Load and View the Extension

## 1. Build the Extension

First, make sure you've built the extension:

```bash
npm run build
```

This creates the `dist/` folder with all compiled files.

## 2. Load in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Toggle **"Developer mode"** in the top right corner (must be ON)
4. Click **"Load unpacked"** button
5. Navigate to your project folder and select the `dist/` folder
6. Click "Select" to load the extension

## 3. Test the Extension

Once loaded, you'll see the home0 extension in your extensions list. To test it:

1. **Go to Zillow.com** - The extension only activates on Zillow pages
2. Look for the extension icon in your Chrome toolbar (puzzle piece icon if not pinned)
3. Click the extension icon to see if it's active

## Current State (Epic 1 Complete)

Right now, the extension:
- ✅ Loads successfully in Chrome
- ✅ Has a basic manifest and structure
- ✅ Injects content scripts on Zillow pages
- ⏳ Doesn't show visible UI yet (sidebar not injected)

To see what's working:
1. Open Chrome DevTools (F12) on any Zillow page
2. Check the Console - you should see: `home0 content script loaded`
3. This confirms the extension is running on Zillow

## Next Steps

The visible UI features come in the next epics:
- **Epic 2**: Authentication UI
- **Epic 3**: Sidebar that slides in/out
- **Epic 4**: Favorite buttons on property cards

## Development Mode

For active development with hot reload:

```bash
npm run dev
```

This watches for changes, but you'll still need to:
1. Click the refresh icon on the extension in `chrome://extensions/`
2. Refresh the Zillow page to see changes

## Troubleshooting

If you don't see the extension:
1. Make sure you ran `npm run build`
2. Check that you selected the `dist/` folder (not the project root)
3. Look for any errors in `chrome://extensions/`
4. Check Chrome DevTools console for errors