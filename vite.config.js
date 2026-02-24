import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    host: '0.0.0.0',  // accessible from phone on same network
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});
