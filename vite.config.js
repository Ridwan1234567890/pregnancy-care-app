import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 500,
    rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom'] } } }
  }
});
