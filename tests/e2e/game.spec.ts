import { expect, test } from '@playwright/test'

import { createSite, type RunningSite } from './support/scaffold'
import { gotoSingleton, saveKeystatic } from './support/keystatic'

let site: RunningSite

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  site = await createSite('game')
})

test.afterAll(async () => {
  if (site) await site.cleanup()
})

test('game keystatic routes load', async ({ page }) => {
  await gotoSingleton(page, site.baseUrl, 'config')
  await expect(page.getByLabel('Site title')).toBeVisible()

  await gotoSingleton(page, site.baseUrl, 'gameHome')
  await expect(page.getByLabel('Top heading')).toBeVisible()
})

test('game homepage edits reflect on the page', async ({ page }) => {
  await gotoSingleton(page, site.baseUrl, 'config')
  await page.getByLabel('Site title').fill('Playground Arena')
  await saveKeystatic(page)

  await gotoSingleton(page, site.baseUrl, 'gameHome')
  await page.getByLabel('Top heading').fill('Lightning Round')
  await page.getByLabel('Subtitle').fill('A quick test of the editable game shell.')
  await page.getByLabel('Question heading').fill('Best test runner?')
  await page.getByLabel('Question text').fill('Pick the runner that should own browser UX coverage.')
  await saveKeystatic(page)

  await page.goto(site.baseUrl, { waitUntil: 'networkidle' })
  await expect(page.locator('.notch-name')).toHaveText('Playground Arena')
  await expect(page.getByRole('heading', { name: 'Lightning Round' })).toBeVisible()
  await expect(page.getByText('A quick test of the editable game shell.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Best test runner?' })).toBeVisible()
  await expect(page.getByText('Pick the runner that should own browser UX coverage.')).toBeVisible()
})
