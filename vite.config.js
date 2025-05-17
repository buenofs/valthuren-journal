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
            src: 'https://lyuoqsiipcstauszdazg.supabase.co/storage/v1/object/sign/ui/valthuren-logo-192.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2M1YTkzNWVjLTc2NDAtNDdmMy04OTQyLWU0ZDQ3MDY4NjQ0ZiJ9.eyJ1cmwiOiJ1aS92YWx0aHVyZW4tbG9nby0xOTIucG5nIiwiaWF0IjoxNzQ3NDg2NjI2LCJleHAiOjE3NzkwMjI2MjZ9.s9xhi0wZsO_nHwO8XwJRTvKDR0QmZ-eIrg6asl9_RmU',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://lyuoqsiipcstauszdazg.supabase.co/storage/v1/object/sign/ui/valthuren-logo-512.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2M1YTkzNWVjLTc2NDAtNDdmMy04OTQyLWU0ZDQ3MDY4NjQ0ZiJ9.eyJ1cmwiOiJ1aS92YWx0aHVyZW4tbG9nby01MTIucG5nIiwiaWF0IjoxNzQ3NDg2NjE1LCJleHAiOjE3NzkwMjI2MTV9.X-SdAwv8NUvnLzwL06VWq89AMurKBqQgxzHWVq6YRMI',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})