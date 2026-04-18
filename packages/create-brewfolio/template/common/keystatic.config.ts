/**
 * Keystatic config for the scaffolded project.
 * Re-exports the full brewfolio schema so the admin UI is populated out of the box.
 * Consuming apps can replace, extend, or narrow this — add/remove entries in
 * `collections` or `singletons` to customize.
 */
import { config } from '@keystatic/core'
import { collections, singletons } from 'brewfolio/keystatic.config'

export default config({
  storage: { kind: 'local' },
  ui: {
    navigation: [
      'projects',
      'writing',
      'notebooks',
      'concepts',
      'about',
      'timeline',
      'impact',
      'siteConfig',
      'sections',
      'secrets'
    ]
  },
  collections,
  singletons
})
