import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'
import icon from 'astro-icon'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  integrations: [react(), keystatic(), icon()],
  vite: {
    plugins: [tailwind()]
  }
})
