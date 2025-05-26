import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Custom plugin to copy manifest and trigger reload
const chromeExtensionPlugin = () => {
  return {
    name: 'chrome-extension',
    generateBundle() {
      // Copy manifest.json to dist
      const manifest = fs.readFileSync('manifest.json', 'utf-8');
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: manifest,
      });
      
      // Copy test-popup.html if it exists
      if (fs.existsSync('test-popup.html')) {
        const testPopup = fs.readFileSync('test-popup.html', 'utf-8');
        this.emitFile({
          type: 'asset',
          fileName: 'test-popup.html',
          source: testPopup,
        });
      }
    },
  };
};

export default defineConfig({
  plugins: [react(), chromeExtensionPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        sidebar: resolve(__dirname, 'src/sidebar/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
        auth: resolve(__dirname, 'src/auth/index.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'sidebar') return 'sidebar/index.js';
          if (chunkInfo.name === 'popup') return 'popup/index.js';
          if (chunkInfo.name === 'auth') return 'auth/index.js';
          return '[name]/index.js';
        },
        chunkFileNames: '[name]/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            // Ensure content.css goes to content folder
            if (assetInfo.name.includes('content')) {
              return 'content/styles.css';
            }
            if (assetInfo.name.includes('popup')) {
              return 'popup/[name][extname]';
            }
            return 'sidebar/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
  // Copy public files to dist
  publicDir: 'public',
});