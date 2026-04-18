import { expect, test } from '@playwright/test'

import { createSite, type RunningSite } from './support/scaffold'

let site: RunningSite

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  site = await createSite('portfolio')
})

test.afterAll(async () => {
  if (site) await site.cleanup()
})

test('portfolio routes, drawer links, and long-form pages work', async ({ page }) => {
  await page.goto(site.baseUrl, { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Writing/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Analysis' })).toBeVisible()

  await page.getByRole('button', { name: /Open Notebook Observatory details/i }).click()
  await expect(page.getByRole('heading', { name: 'Notebook Observatory' })).toBeVisible()
  await expect(page.getByText('PROJECT OVERVIEW')).toBeVisible()
  await expect(page.getByText('TIMELINE')).toBeVisible()
  await expect(page.getByText('Could not load GitHub data.')).toHaveCount(0)

  await page
    .getByRole('link', { name: 'Getting started with AI: Good enough prompting', exact: true })
    .click()
  await page.waitForURL(/\/writing\/good-enough-prompting$/)
  await expect(page.getByRole('heading', { name: 'Getting started with AI: Good enough prompting' })).toBeVisible()
  await expect(page.getByText(/Good Enough Task Prompting/i)).toBeVisible()

  await page.goto(`${site.baseUrl}/analysis/running-code-tour`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Running code notebook tour' })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Experiment summary' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Running Code', exact: true }).first()).toBeVisible()

  await page.goto(`${site.baseUrl}/about`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recognition & Leadership', exact: true })).toBeVisible()
})
