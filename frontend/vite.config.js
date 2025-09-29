import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // use relative paths so JS/CSS load correctly on Vercel
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
