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
          {
            "src": "/ridenet-96x96.png",
            "sizes": "96x96",
            "type": "image/png"
          },
          {
            "src": "/ridenet-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/ridenet-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist'
  }
})
