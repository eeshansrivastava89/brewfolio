import { defineConfig } from 'astro/config'
import keystatic from '@keystatic/astro'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  integrations: [keystatic()],
  vite: {
    plugins: [tailwind()]
  }
})
