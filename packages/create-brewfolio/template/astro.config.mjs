import { defineConfig } from 'astro/config'
import keystatic from '@keystatic/astro'

export default defineConfig({
  integrations: [keystatic()],
})
