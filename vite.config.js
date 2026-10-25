import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // أضف هذا السطر

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // أضف هذا السطر هنا
  ],
})