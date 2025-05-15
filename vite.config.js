import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Jornal dos Valthuren',
        short_name: 'Valthuren',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#1a1816',
        icons: [
          {
            src: '/ui/valthuren-logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/ui/valthuren-logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})