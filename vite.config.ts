/* eslint-env node */
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

dotenv.config();

const backendPort = Number(process.env.VITE_BACKEND_PORT ?? process.env.PORT ?? '3003');
const rootDir = fileURLToPath(new URL('.', import.meta.url));

function createProxyConfig(port: number) {
  return {
    target: `http://localhost:${port}`,
    changeOrigin: true,
  } as const;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: /^zod\/.*/, replacement: 'zod' },
      {
        find: 'vite-plugin-node-polyfills/shims/buffer',
        replacement: fileURLToPath(
          new URL('./node_modules/vite-plugin-node-polyfills/shims/buffer/dist/index.js', import.meta.url),
        ),
      },
    ],
  },
  server: {
    proxy: {
      '/api': createProxyConfig(backendPort),
      '/health': createProxyConfig(backendPort),
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: resolve(rootDir, 'index.html'),
        mini: resolve(rootDir, 'mini.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('/src/lib/icons')) {
            return 'icons';
          }
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (id.includes('i18next')) {
            return 'i18n';
          }
          if (id.includes('icon') || id.includes('lucide')) {
            return 'icons';
          }
          return 'vendor';
        },
      },
    },
  },
});
