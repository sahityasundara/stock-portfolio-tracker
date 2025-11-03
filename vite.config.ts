import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: Replace __dirname with import.meta.url to be compatible with ES modules.
      '@': path.resolve(new URL('.', import.meta.url).pathname),
    }
  }
});