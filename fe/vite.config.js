import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/posts': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/comments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/likes': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

    }
  }
});