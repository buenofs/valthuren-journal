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
        theme_color: '#8a2be2',
        icons: [
          {
            src: '/ui/pwa-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/ui/pwa-icon-2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})