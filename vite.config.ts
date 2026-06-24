import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: process.env.API_PROXY_TARGET
      ? {
          '/api': process.env.API_PROXY_TARGET,
          '/uploads': process.env.API_PROXY_TARGET,
        }
      : undefined,
  },
})
