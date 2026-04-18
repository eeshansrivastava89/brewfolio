import { expect, type Page } from '@playwright/test'

export async function openKeystaticSection(page: Page, baseUrl: string, section: string) {
  await page.goto(`${baseUrl}/keystatic`, { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: section, exact: true }).first().click()
}

export async function gotoSingleton(page: Page, baseUrl: string, key: string) {
  await page.goto(`${baseUrl}/keystatic/singleton/${key}`, { waitUntil: 'networkidle' })
}

export async function gotoCollection(page: Page, baseUrl: string, key: string) {
  await page.goto(`${baseUrl}/keystatic/collection/${key}`, { waitUntil: 'networkidle' })
}

export async function gotoCollectionCreate(page: Page, baseUrl: string, key: string) {
  await page.goto(`${baseUrl}/keystatic/collection/${key}/create`, { waitUntil: 'networkidle' })
}

export async function gotoCollectionItem(
  page: Page,
  baseUrl: string,
  key: string,
  slug: string,
) {
  await page.goto(`${baseUrl}/keystatic/collection/${key}/item/${slug}`, {
    waitUntil: 'networkidle',
  })
}

export async function saveKeystatic(page: Page) {
  const saveButton = page.getByRole('button', { name: /save/i }).last()
  await expect(saveButton).toBeVisible()
  await saveButton.click()
  await expect(page.getByText('Unsaved')).toHaveCount(0)
}

export async function createKeystaticEntry(page: Page) {
  const createButton = page.getByRole('button', { name: /create/i }).last()
  await expect(createButton).toBeVisible()
  await createButton.click()
}

export async function deleteKeystaticEntry(page: Page) {
  await page.getByRole('button', { name: 'Delete entry…' }).click()
  await page.getByRole('button', { name: /Yes, delete/i }).click()
}
