import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://inspectra-s4hg.vercel.app/',
        changeOrigin: true,
      }
    }
  }
})
