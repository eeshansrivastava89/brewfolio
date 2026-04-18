import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { copyFile, mkdir, readdir } from 'fs/promises'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_ROOT = join(__dirname, '..', 'template')

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true })
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

export async function copyTemplateOverlay(projectDir, type) {
  // Apply shared files first, then the type-specific layer on top.
  await copyDir(join(TEMPLATE_ROOT, 'common'), projectDir)
  await copyDir(join(TEMPLATE_ROOT, type), projectDir)
}

export function runProcess(cmd, args, { cwd = process.cwd() } = {}) {
  return new Promise((resolve, reject) => {
    console.log(`  → ${cmd} ${args.join(' ')}`)
    const child = spawn(cmd, args, { cwd, stdio: 'inherit' })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`"${cmd} ${args.join(' ')}" exited with code ${code}`))
    })
    child.on('error', reject)
  })
}
