import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        ws: true,
        changeOrigin: true,
<<<<<<< HEAD
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      }
=======
        secure:false,
        rewrite: (path) => path.replace(/^\/api/,"")
    },
>>>>>>> 912d5fd6018a84bfb9cf00c6e63cf2f4f24d7a9c
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
