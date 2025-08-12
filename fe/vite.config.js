
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
    // Environment variableları yüklüyoruz
    const env = loadEnv(mode, process.cwd(), '');

    // Development vs Production ayırımını yapıyoruz
    const isDevelopment = command === 'serve';
    const apiUrl = env.VITE_API_URL || 'http://localhost:8080';


    return {
        plugins: [react()],
        build: {
            rollupOptions: {
                // Animated backgrounds için external veya ignore ayarları
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
            // Sadece development'ta proxy kullanıyoruz
            ...(isDevelopment && {
                proxy: {
                    '/api': {
                        target: apiUrl,
                        changeOrigin: true,
                        secure: false,
                        configure: (proxy, options) => {
                            proxy.on('error', (err, req, res) => {
                                console.log('Proxy error:', err);
                            });
                            proxy.on('proxyReq', (proxyReq, req, res) => {
                                console.log('Proxying request to:', proxyReq.path);
                            });
                        }
                    }
                }
            }),
            historyApiFallback: true
        },
        // Production build için environment variables'ı define ediyoruz
        define: {
            'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
        }
    }
});