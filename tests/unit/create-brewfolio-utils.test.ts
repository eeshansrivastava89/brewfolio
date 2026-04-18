import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { copyTemplateOverlay, runProcess } from '../../packages/create-brewfolio/src/utils.js'

describe('create-brewfolio utils', () => {
  const createdDirs: string[] = []

  afterEach(async () => {
    await Promise.all(
      createdDirs.splice(0).map(async (dir) => {
        await import('node:fs/promises').then(({ rm }) =>
          rm(dir, { recursive: true, force: true }),
        )
      }),
    )
  })

  it('copies common and type-specific template files into a project', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'brewfolio-overlay-'))
    createdDirs.push(projectDir)

    await copyTemplateOverlay(projectDir, 'app')

    await expect(readFile(join(projectDir, 'astro.config.mjs'), 'utf8')).resolves.toContain(
      "defineConfig",
    )
    await expect(readFile(join(projectDir, 'keystatic.config.ts'), 'utf8')).resolves.toContain(
      "label: 'Homepage'",
    )
    await expect(
      readFile(join(projectDir, 'src/data/sections.yaml'), 'utf8'),
    ).resolves.toContain('sections:')
  })

  it('runs child processes successfully', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'brewfolio-run-ok-'))
    createdDirs.push(cwd)
    await writeFile(join(cwd, 'ok.mjs'), 'process.exit(0)\n')

    await expect(runProcess(process.execPath, ['ok.mjs'], { cwd })).resolves.toBeUndefined()
  })

  it('rejects when child processes fail', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'brewfolio-run-fail-'))
    createdDirs.push(cwd)
    await writeFile(join(cwd, 'fail.mjs'), 'process.exit(2)\n')

    await expect(runProcess(process.execPath, ['fail.mjs'], { cwd })).rejects.toThrow(
      `"${process.execPath} fail.mjs" exited with code 2`,
    )
  })
})
