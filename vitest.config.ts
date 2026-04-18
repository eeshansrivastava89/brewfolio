import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      include: [
        'brewfolio/src/lib/toc.ts',
        'brewfolio/src/lib/notebook-loader.ts',
        'brewfolio/src/lib/notebook-renderer.ts',
        'brewfolio/src/lib/projects.ts',
        'packages/create-brewfolio/src/utils.js'
      ],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100
      }
    }
  }
})
