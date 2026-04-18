import { expect, test } from '@playwright/test'

import { createSite, type RunningSite } from './support/scaffold'
import {
  createKeystaticEntry,
  deleteKeystaticEntry,
  gotoCollection,
  gotoCollectionCreate,
  gotoCollectionItem,
  saveKeystatic,
} from './support/keystatic'

let site: RunningSite

const WRITING_SLUG = 'playwright-note'
const PROJECT_SLUG = 'playwright-project'
const NOTEBOOK_SLUG = 'playwright-notebook'
const TRASH_PROJECT_SLUG = 'playwright-trash-project'

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  site = await createSite('portfolio')
})

test.afterAll(async () => {
  if (site) await site.cleanup()
})

test('portfolio collection index routes load', async ({ page }) => {
  await gotoCollection(page, site.baseUrl, 'projects')
  await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()

  await gotoCollection(page, site.baseUrl, 'writing')
  await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()

  await gotoCollection(page, site.baseUrl, 'notebooks')
  await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
})

test('can create and edit a writing post through Keystatic', async ({ page }) => {
  await gotoCollectionCreate(page, site.baseUrl, 'writing')
  await page.getByLabel('Slug*').fill(WRITING_SLUG)
  await page.getByLabel('Post title').fill('Playwright field guide')
  await page.getByLabel('Published date').fill('2026-04-18')
  await page
    .getByLabel('Post URL')
    .fill('https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough')
  await page
    .getByLabel('Card description')
    .fill('A temporary article used to verify writing CRUD and route reflection.')
  await createKeystaticEntry(page)

  await expect(page).toHaveURL(new RegExp(`/collection/writing/item/${WRITING_SLUG}$`))
  await page.getByLabel('Post title').fill('Playwright field guide updated')
  await saveKeystatic(page)

  await page.goto(site.baseUrl, { waitUntil: 'networkidle' })
  await expect(page.getByText('Playwright field guide updated')).toBeVisible()

  await page.goto(`${site.baseUrl}/writing/${WRITING_SLUG}`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Playwright field guide updated' })).toBeVisible()
})

test('can create and edit a project through Keystatic', async ({ page }) => {
  await gotoCollectionCreate(page, site.baseUrl, 'projects')
  await page.getByLabel('Slug*').fill(PROJECT_SLUG)
  await page.getByLabel('Project name').fill('Playwright Project')
  await page
    .getByRole('textbox', { name: 'Project URL' })
    .fill('https://example.com/playwright-project')
  await page.getByLabel('Full description').fill(
    'A temporary project used to verify project CRUD, drawer rendering, and linked work.',
  )
  await page
    .getByLabel('Home card description')
    .fill('Temporary project for end-to-end test coverage.')
  await page.getByLabel('GitHub repo URL').fill('https://github.com/jupyter/notebook')
  await page.getByRole('button', { name: 'Add' }).nth(0).click()
  await page.getByRole('textbox', { name: 'Tag' }).fill('Testing')
  await page.getByRole('button', { name: 'Add' }).last().click()
  await page.getByLabel('Drawer overview').fill('A project drawer used to test linked work and GitHub data.')
  await page.getByLabel('How it is built').fill('Astro, Keystatic, and Playwright.')
  await page.getByLabel('What is next').fill('Link a notebook and a writing post, then verify the drawer.')
  await createKeystaticEntry(page)

  await expect(page).toHaveURL(new RegExp(`/collection/projects/item/${PROJECT_SLUG}$`))
  await page.getByLabel('Project name').fill('Playwright Project Updated')
  await saveKeystatic(page)

  await page.goto(site.baseUrl, { waitUntil: 'networkidle' })
  await expect(page.getByText('Playwright Project Updated')).toBeVisible()
})

test('can create a notebook linked to the new project and render the analysis page', async ({ page }) => {
  await gotoCollectionCreate(page, site.baseUrl, 'notebooks')
  await page.getByLabel('Slug*').fill(NOTEBOOK_SLUG)
  await page.getByLabel('Notebook title').fill('Playwright Notebook')
  await page.getByRole('button', { name: 'Show suggestions Project' }).click()
  await page.getByRole('option', { name: PROJECT_SLUG }).click()
  await page
    .getByLabel('Notebook URL')
    .fill(
      'https://github.com/jupyter/notebook/blob/main/docs/source/examples/Notebook/Running%20Code.ipynb',
    )
  await page
    .getByLabel('Card description')
    .fill('A linked notebook used to verify notebook rendering and project relationships.')
  await page.getByLabel('Published date').fill('2026-04-18')
  await createKeystaticEntry(page)

  await expect(page).toHaveURL(new RegExp(`/collection/notebooks/item/${NOTEBOOK_SLUG}$`))
  await page.goto(`${site.baseUrl}/analysis/${NOTEBOOK_SLUG}`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Playwright Notebook' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Running Code', exact: true }).first()).toBeVisible()
})

test('can wire project relationships and concept relationships through Keystatic', async ({ page }) => {
  await gotoCollectionItem(page, site.baseUrl, 'projects', PROJECT_SLUG)
  await page.getByRole('button', { name: 'Show suggestions Featured' }).click()
  await page.getByRole('option', { name: NOTEBOOK_SLUG, exact: true }).click()
  await page.getByRole('button', { name: 'Add' }).nth(1).click()
  await page.getByRole('button', { name: 'Show suggestions Post' }).click()
  await page.getByRole('option', { name: WRITING_SLUG, exact: true }).click()
  await page.getByRole('button', { name: 'Add' }).last().click()
  await saveKeystatic(page)

  await page.goto(`${site.baseUrl}/keystatic/singleton/concepts`, { waitUntil: 'networkidle' })
  await page.getByText('Prompting systems', { exact: true }).click()
  await page.getByRole('button', { name: 'Add' }).nth(1).click()
  await page.getByRole('button', { name: 'Show suggestions Project' }).click()
  await page.getByRole('option', { name: PROJECT_SLUG, exact: true }).click()
  await page.getByRole('button', { name: 'Add' }).last().click()
  await page.getByRole('button', { name: 'Add' }).nth(2).click()
  await page.getByRole('button', { name: 'Show suggestions Post' }).click()
  await page.getByRole('option', { name: WRITING_SLUG, exact: true }).click()
  await page.getByRole('button', { name: 'Add' }).last().click()
  await page.getByRole('button', { name: 'Add' }).nth(3).click()
  await page.getByRole('button', { name: 'Show suggestions Notebook' }).click()
  await page.getByRole('option', { name: NOTEBOOK_SLUG, exact: true }).click()
  await page.getByRole('button', { name: 'Add' }).last().click()
  await saveKeystatic(page)

  await page.goto(site.baseUrl, { waitUntil: 'networkidle' })
  await expect(page.locator('[data-pane=\"projects\"]').getByText('Playwright Project Updated')).toBeVisible()
  await expect(page.locator('[data-pane=\"writing\"]').getByText('Playwright field guide updated')).toBeVisible()
  await expect(page.locator('[data-pane=\"analysis\"]').getByText('Playwright Notebook')).toBeVisible()
  await expect(page.locator('[data-pane=\"writing\"]').getByText('Prompting systems')).toBeVisible()

  await page.getByRole('button', { name: /Open Playwright Project Updated details/i }).click()
  await expect(page.getByRole('link', { name: 'Playwright field guide updated', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /Open analysis/i })).toBeVisible()

  await page.locator('[data-pane=\"concepts\"]').getByText('Prompting systems', { exact: true }).click()
  await expect(page.locator('[data-pane=\"projects\"]').getByText('Playwright Project Updated')).toBeVisible()
})

test('can create and delete a temporary project entry', async ({ page }) => {
  await gotoCollectionCreate(page, site.baseUrl, 'projects')
  await page.getByLabel('Slug*').fill(TRASH_PROJECT_SLUG)
  await page.getByLabel('Project name').fill('Trash Project')
  await page.getByLabel('Full description').fill('Created only to verify deletion through Keystatic.')
  await createKeystaticEntry(page)
  await expect(page).toHaveURL(new RegExp(`/collection/projects/item/${TRASH_PROJECT_SLUG}$`))

  await deleteKeystaticEntry(page)
  await expect(page).toHaveURL(new RegExp('/collection/projects$'))
  await expect(page.getByText(TRASH_PROJECT_SLUG, { exact: true })).toHaveCount(0)
})
