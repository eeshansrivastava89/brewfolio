/**
 * Keystatic config for the scaffolded project.
 * Re-exports the full schema from brewfolio so the project is immediately usable.
 * Consuming apps can replace or extend any part of this config.
 */
import { config } from '@keystatic/core'
import { sections } from 'brewfolio/keystatic.config'

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    // Placeholder — replace with actual content as you build
    articles: {
      label: 'Articles',
      slugField: 'slug',
      path: 'src/content/articles/*',
      fields: {
        title: fields.title({ label: 'Title' }),
        slug: fields.slug({ name: { label: 'Slug' } }),
      },
    },
  },
  singletons: {
    sections,
  },
})
