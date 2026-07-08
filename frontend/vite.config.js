import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      "laudable-compassion-production-d9b7.up.railway.app"
    ]
  }
})