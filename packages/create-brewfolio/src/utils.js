import { spawn } from 'child_process'
import { join } from 'path'
import { copyFile, mkdir, readdir } from 'fs/promises'
import { readFile, writeFile } from 'fs/promises'

export async function copyTemplateOverlay(projectDir) {
  const templateSrc = join(process.cwd(), '..', '..', 'packages', 'create-brewfolio', 'template')

  async function copyDir(src, dest) {
    try {
      await mkdir(dest, { recursive: true })
    } catch {}
    const entries = await readdir(src, { withFileTypes: true })
    for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const destPath = join(dest, entry.name)
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath)
      } else {
        await copyFile(srcPath, destPath)
      }
    }
  }

  await copyDir(templateSrc, projectDir)
}

export async function updatePackageJsonDeps(projectDir) {
  const pkgPath = join(projectDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

  pkg.dependencies = {
    ...pkg.dependencies,
    brewfolio: 'latest',
    '@keystatic/core': '^0.5',
    '@keystatic/astro': '^0.5',
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

export function runProcess(cmd, args, { cwd = process.cwd(), stdio = 'inherit' } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`"${cmd} ${args.join(' ')}" exited with code ${code}`))
    })
    child.on('error', reject)
  })
}
