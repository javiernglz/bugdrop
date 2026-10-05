import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const target = process.env.BACKEND_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': target,
      '/backup.bak': target,
      '/socket.io': {
        target: target,
        ws: true,
      },
    },
  },
})
