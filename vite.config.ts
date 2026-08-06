import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    // Vite and the API run on the same development machine.  Point the proxy
    // at localhost so a DHCP/LAN address change never breaks every /api call.
    // Production keeps using the explicitly configured public API hostname.
    const isProduction = mode === 'production';
    const apiTarget = isProduction
        ? (env.VITE_API_URL_BACKEND || 'http://localhost:4003')
        : 'http://localhost:4003';
    const allowedHost = env.VITE_ALLOWED_HOST;
    const configureProxyErrorHandler = (proxy: any) => {
        proxy.on('error', (error: NodeJS.ErrnoException, _request: any, response: any) => {
            console.error(`[vite] API proxy could not reach ${apiTarget}: ${error.code || error.message}`);

            if (!response.headersSent) {
                response.writeHead(502, { 'Content-Type': 'application/json' });
            }

            if (!response.writableEnded) {
                response.end(JSON.stringify({
                    success: false,
                    statusCode: 502,
                    message: 'The API server is unavailable. Verify that the backend is running.',
                }));
            }
        });
    };

    return {
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },

    server: {
        host: '0.0.0.0',
        ...(allowedHost ? { allowedHosts: [allowedHost] } : {}),
        proxy: {
            '/ticket_images': {
                target: apiTarget,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ticket_images/, '/ticket_images'),
                configure: configureProxyErrorHandler,
            },
            '/api': {
                target: apiTarget,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'),
                configure: configureProxyErrorHandler,
            },
        },
    },

    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui': ['@mui/material', '@mui/icons-material'],
                },
            },
        },
    },
    };
});
