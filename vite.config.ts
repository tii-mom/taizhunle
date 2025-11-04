/* eslint-env node */
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

dotenv.config();

const backendPort = Number(process.env.VITE_BACKEND_PORT ?? process.env.PORT ?? '3003');

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
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': createProxyConfig(backendPort),
      '/health': createProxyConfig(backendPort),
    },
  },
  build: {
    rollupOptions: {
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
