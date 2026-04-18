import { expect, type Page } from '@playwright/test'

export async function openKeystaticSection(page: Page, baseUrl: string, section: string) {
  await gotoWithRetry(page, `${baseUrl}/keystatic`)
  await page.getByRole('link', { name: section, exact: true }).first().click()
}

export async function gotoSingleton(page: Page, baseUrl: string, key: string) {
  await gotoWithRetry(page, `${baseUrl}/keystatic/singleton/${key}`)
}

export async function gotoCollection(page: Page, baseUrl: string, key: string) {
  await gotoWithRetry(page, `${baseUrl}/keystatic/collection/${key}`)
}

export async function gotoCollectionCreate(page: Page, baseUrl: string, key: string) {
  await gotoWithRetry(page, `${baseUrl}/keystatic/collection/${key}/create`)
}

export async function gotoCollectionItem(
  page: Page,
  baseUrl: string,
  key: string,
  slug: string,
) {
  await gotoWithRetry(page, `${baseUrl}/keystatic/collection/${key}/item/${slug}`)
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

async function gotoWithRetry(page: Page, url: string, attempts = 3) {
  let lastError: unknown

  for (let index = 0; index < attempts; index += 1) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' })
      return
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      const retryable =
        message.includes('ERR_ABORTED') ||
        message.includes('ECONNRESET') ||
        message.includes('ERR_CONNECTION_REFUSED')

      if (!retryable || index === attempts - 1) {
        throw error
      }

      await page.waitForTimeout(750)
    }
  }

  throw lastError
}
