import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/controlfacturas/',
  server: {
    host: true, // Expone el servidor a la red local (0.0.0.0)
    port: 5173,
    allowedHosts: true, // Permite túneles externos (localtunnel, ngrok, cloudflare)
    proxy: {
      '/api_backend': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api_backend/, ''),
      },
    },
  },
});
