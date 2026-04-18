import { expect, test } from '@playwright/test'

import { createSite, type RunningSite } from './support/scaffold'
import { gotoSingleton, saveKeystatic } from './support/keystatic'

let site: RunningSite

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  site = await createSite('app')
})

test.afterAll(async () => {
  if (site) await site.cleanup()
})

test('app keystatic routes load', async ({ page }) => {
  await gotoSingleton(page, site.baseUrl, 'config')
  await expect(page.getByLabel('Site title')).toBeVisible()

  await gotoSingleton(page, site.baseUrl, 'sections')
  await expect(page.getByRole('heading', { name: 'Homepage' })).toBeVisible()
  await expect(page.getByText('Blocks', { exact: true }).first()).toBeVisible()

  await gotoSingleton(page, site.baseUrl, 'secrets')
  await expect(page.getByLabel('GitHub token')).toBeVisible()
})

test('app config edits reflect on the page', async ({ page }) => {
  await gotoSingleton(page, site.baseUrl, 'config')
  await page.getByLabel('Site title').fill('Ops Atlas')
  await page.getByLabel('GitHub handle').fill('octocat')
  await saveKeystatic(page)

  await page.goto(site.baseUrl, { waitUntil: 'networkidle' })
  await expect(page.locator('.notch-name')).toHaveText('Ops Atlas')
})

test('app homepage block edits reflect on the page', async ({ page }) => {
  await gotoSingleton(page, site.baseUrl, 'sections')
  await page.getByText('metrics-grid', { exact: true }).first().click()
  await page.getByLabel('Block title').first().fill('Playwright Metrics')
  await page.getByLabel('Metric label').first().fill('Checks')
  await page.getByLabel('Metric value').first().fill('128')
  await saveKeystatic(page)

  await page.goto(site.baseUrl, { waitUntil: 'networkidle' })
  await expect(page.getByText('Playwright Metrics')).toBeVisible()
  await expect(page.getByText('Checks')).toBeVisible()
  await expect(page.getByText('128')).toBeVisible()
})
