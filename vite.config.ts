import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            ...basicSsl({
                name: 'beesee-local',
                domains: ['192.168.0.107', 'localhost', '127.0.0.1'],
            }),
            apply: 'serve',
        },
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },

    server: {
        host: '0.0.0.0',
        proxy: {
            '/ticket_images': {
                target: 'http://localhost:4003',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ticket_images/, '/ticket_images'),
            },
            '/api': {
                target: 'http://localhost:4003',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'),
            },
        },
    },

    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        reportCompressedSize: false,
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
});
