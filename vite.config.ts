  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      hmr: {
        clientPort: 5173,
      },
      watch: {
        usePolling: true,
      },
    },
  });
