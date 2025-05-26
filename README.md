# home0 Chrome Extension

Chrome extension for saving and organizing Zillow properties to your home0 account.

## Features

- 🏠 Save properties from Zillow with one click
- 📁 Organize favorites into collections
- 🏷️ Add notes and tags to properties
- 🔄 Sync across devices with your home0 account
- 🌐 Works offline with automatic sync

## Development

```bash
# Install dependencies
npm install

# Run development build with watch mode
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Loading the Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Project Structure

```
src/
├── background/     # Service worker
├── content/        # Content scripts for Zillow pages
├── sidebar/        # React sidebar application
└── shared/         # Shared types and utilities
```

## Tech Stack

- Chrome Extension Manifest V3
- React 18 + TypeScript
- Vite for bundling
- shadcn/ui + Tailwind CSS
- Clerk.js for authentication
- Cloudflare Workers backend

## License

MIT