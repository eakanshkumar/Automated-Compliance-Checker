import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // ensures correct paths on Vercel
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
