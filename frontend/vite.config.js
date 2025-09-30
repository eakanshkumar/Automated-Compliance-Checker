import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Add these for better Vercel compatibility
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});