import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
