import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default ({mode}: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  return defineConfig({
  define: {
    "process.env" : env,
  },
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      '/front': {
        target: 'http://frontend:8080',
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/front/, ""),
      },
    }
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
}
