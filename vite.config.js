import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    // Configuración para manejar rutas del lado del cliente
    historyApiFallback: {
      rewrites: [
        { from: /^\/product\/.*$/, to: '/index.html' },
        { from: /.*/, to: '/index.html' }
      ]
    }
  }
});
