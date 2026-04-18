import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 15 * 60 * 1000,
  expect: {
    timeout: 20_000,
  },
  reporter: [
    ['list', { printSteps: true }],
    [
      'html',
      {
        open: 'never',
        outputFolder: 'playwright-report',
        title: 'Brewfolio Playwright Report',
      },
    ],
    ['json', { outputFile: 'test-results/playwright/results.json' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 1024 },
    ...devices['Desktop Chrome'],
  },
})
