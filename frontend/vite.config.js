import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /graphql requests to Django during development.
      // The browser sees everything from localhost:5173 — CORS never triggers.
      '/graphql': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
