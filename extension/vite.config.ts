import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Custom plugin to copy manifest.json and public assets to dist
function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const publicDir = resolve(__dirname, 'public');
      const distDir = resolve(__dirname, 'dist');
      
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // Copy manifest.json
      fs.copyFileSync(resolve(__dirname, 'manifest.json'), resolve(distDir, 'manifest.json'));
      
      // Copy icons if present
      const iconsSrc = resolve(publicDir, 'icons');
      const iconsDist = resolve(distDir, 'icons');
      if (fs.existsSync(iconsSrc)) {
        if (!fs.existsSync(iconsDist)) {
          fs.mkdirSync(iconsDist, { recursive: true });
        }
        fs.readdirSync(iconsSrc).forEach((file) => {
          fs.copyFileSync(resolve(iconsSrc, file), resolve(iconsDist, file));
        });
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content/pinterest': resolve(__dirname, 'src/content/pinterest.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background/service-worker') {
            return 'background/service-worker.js';
          }
          if (chunkInfo.name === 'content/pinterest') {
            return 'content/pinterest.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/styles.css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  }
});
