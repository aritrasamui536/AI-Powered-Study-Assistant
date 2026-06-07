import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ai-powered-study-assistant-ctvt.onrender.com',
        changeOrigin: true,
      }
    }
  }
})