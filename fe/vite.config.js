
import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
    // Environment variableları yüklüyoruz
    const env = loadEnv(mode, process.cwd(), '');
    const apiUrl = env.API_URL || 'http://localhost:8080';

    return {
        plugins: [react()],
        build: {
            rollupOptions: {
                // Sorunlu paket olan animated backgrounds için external veya ignore ayarlarını yapıyoruz
                external: [],
                onwarn: (warning, warn) => {
                    // animated-backgrounds uyarısını yok sayıyoruz
                    if (warning.code === 'UNRESOLVED_IMPORT' &&
                        warning.message.includes('animated-backgrounds')) {
                        return
                    }
                    warn(warning)
                }
            }
        },
        server: {
            port: 5173,
            proxy: {
                '/api/posts': {
                    target: `${apiUrl}/posts`,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api\/posts/, '')
                },
                '/api/users': {
                    target: `${apiUrl}/users`,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api\/users/, '')
                },
                '/api/comments': {
                    target: `${apiUrl}/comments`,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api\/comments/, '')
                },
                '/api/likes': {
                    target: `${apiUrl}/likes`,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api\/likes/, '')
                },
                '/api/auth': {
                    target: `${apiUrl}/auth`,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api\/auth/, '')
                }
            },
            historyApiFallback: true
        }
    }
});