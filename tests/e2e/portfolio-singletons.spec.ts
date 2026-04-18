import { expect, test } from '@playwright/test'

import { createSite, type RunningSite } from './support/scaffold'
import { gotoSingleton, saveKeystatic } from './support/keystatic'

let site: RunningSite

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  site = await createSite('portfolio')
})

test.afterAll(async () => {
  if (site) await site.cleanup()
})

const singletonRoutes = [
  { key: 'config', assert: (page) => expect(page.getByLabel('Site title')).toBeVisible() },
  { key: 'github', assert: (page) => expect(page.getByLabel('GitHub handle')).toBeVisible() },
  {
    key: 'writingSettings',
    assert: (page) => expect(page.getByLabel('Publication name')).toBeVisible(),
  },
  {
    key: 'concepts',
    assert: (page) => expect(page.getByRole('heading', { name: 'Concepts' })).toBeVisible(),
  },
  { key: 'about', assert: (page) => expect(page.getByLabel('Top bio')).toBeVisible() },
  {
    key: 'timeline',
    assert: (page) => expect(page.getByRole('group', { name: 'Entries' })).toBeVisible(),
  },
  {
    key: 'impact',
    assert: (page) => expect(page.getByRole('group', { name: 'Sections' })).toBeVisible(),
  },
  { key: 'secrets', assert: (page) => expect(page.getByLabel('GitHub token')).toBeVisible() },
] as const

for (const route of singletonRoutes) {
  test(`portfolio singleton "${route.key}" loads in Keystatic`, async ({ page }) => {
    await gotoSingleton(page, site.baseUrl, route.key)
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
    await route.assert(page)
  })
}

test('site, github, and writing settings edits reflect on the dashboard', async ({ page }) => {
  await gotoSingleton(page, site.baseUrl, 'config')
  await page.getByLabel('Site title').fill('Signal Desk')
  await page.getByLabel('Concepts intro').fill(
    'A testing-focused portfolio. Use concepts to trace work across projects, writing, and analysis.',
  )
  await page.getByLabel('City').fill('Portland')
  await page.getByLabel('Country (optional)').fill('United States')
  await saveKeystatic(page)

  await gotoSingleton(page, site.baseUrl, 'github')
  await page.getByLabel('GitHub handle').fill('octocat')
  await saveKeystatic(page)

  await gotoSingleton(page, site.baseUrl, 'writingSettings')
  await page.getByLabel('Publication name').fill('Signal Notes')
  await page.getByLabel('Publication URL').fill('https://www.oneusefulthing.org')
  await saveKeystatic(page)

  await page.goto(site.baseUrl, { waitUntil: 'networkidle' })
  await expect(page.locator('.notch-name')).toHaveText('Signal Desk')
  await expect(page.getByText('@octocat')).toBeVisible()
  await expect(page.locator('[data-pane=\"concepts\"]').getByText(/A testing-focused portfolio/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: /Writing/i })).toContainText('Signal Notes')
  await expect(page.locator('a.subscribe-btn')).toHaveAttribute(
    'href',
    'https://www.oneusefulthing.org/subscribe',
  )
})

test('about, timeline, and impact edits reflect on the about page', async ({ page }) => {
  await gotoSingleton(page, site.baseUrl, 'about')
  await page
    .getByLabel('Top bio')
    .fill('Signal Desk is a portfolio about linked evidence, notebook-backed work, and product decisions.')
  await page
    .getByLabel('This site section')
    .fill('This site is built to test end-to-end editing, publishing, and relationship-driven navigation.')
  await saveKeystatic(page)

  await gotoSingleton(page, site.baseUrl, 'timeline')
  await page.getByLabel('Role or degree').first().fill('Lead Product Builder')
  await page.getByLabel('Organization').first().fill('Signal Lab')
  await page.getByLabel('Description').first().fill('Built portfolio systems and testing workflows end to end.')
  await saveKeystatic(page)

  await gotoSingleton(page, site.baseUrl, 'impact')
  await page.getByLabel('Section title').first().fill('Signals & Links')
  await page.getByLabel('Label').first().fill('Playwright Coverage Award')
  await page.getByLabel('Subtext').first().fill('Automation Lab · 2026')
  await page.getByLabel('Link URL').first().fill('https://example.com/award')
  await saveKeystatic(page)

  await page.goto(`${site.baseUrl}/about`, { waitUntil: 'networkidle' })
  await expect(
    page.getByText(/Signal Desk is a portfolio about linked evidence/i),
  ).toBeVisible()
  await expect(
    page.getByText(/This site is built to test end-to-end editing/i),
  ).toBeVisible()
  await expect(page.getByText('Lead Product Builder')).toBeVisible()
  await expect(page.getByText('Signal Lab')).toBeVisible()
  await expect(page.getByText('Signals & Links')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Playwright Coverage Award' })).toHaveAttribute(
    'href',
    'https://example.com/award',
  )
})
