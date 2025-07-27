import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api/posts': {
                target: 'http://localhost:8080/posts',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api\/posts/, '')
            },
            '/api/users': {
                target: 'http://localhost:8080/users',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api\/users/, '')
            },
            '/api/comments': {
                target: 'http://localhost:8080/comments',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api\/comments/, '')
            },
            '/api/likes': {
                target: 'http://localhost:8080/likes',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api\/likes/, '')
            },
            '/api/auth': {
                target: 'http://localhost:8080/auth',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api\/auth/, '')
            }
        },

        historyApiFallback: true
    }
});