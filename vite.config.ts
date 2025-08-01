import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ride Net',
        short_name: 'RideNet',
        description: '',
        theme_color: '#121212',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
        ]
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist'
  }
})
