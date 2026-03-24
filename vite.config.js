import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 1. Tell Vite to listen on all local addresses
    host: true, 
    // 2. Add your ngrok address to the "Allowed" list
    allowedHosts: [
      'salably-nonconstruable-arnoldo.ngrok-free.dev'
    ],
    proxy: {
      // 3. This sends your /api calls to the Bot (Port 3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})