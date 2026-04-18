/**
 * Reader pattern for accessing Keystatic content from Astro pages.
 *
 * Each consuming app uses its own keystatic.config to instantiate a reader
 * that matches the app's schema (brewfolio's full schema, or a narrowed subset).
 */
import { createReader } from '@keystatic/core/reader'
import config from '../../keystatic.config'

export const reader = createReader(process.cwd(), config)
