import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { copyFile, mkdir, readdir } from 'fs/promises'
import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = join(__dirname, '..', 'template')

export async function copyTemplateOverlay(projectDir) {
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

  await copyDir(TEMPLATE_DIR, projectDir)
}

export function runProcess(cmd, args, { cwd = process.cwd() } = {}) {
  return new Promise((resolve, reject) => {
    console.log(`  Running: ${cmd} ${args.join(' ')}`)
    const child = spawn(cmd, args, { cwd, stdio: 'inherit' })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`"${cmd} ${args.join(' ')}" exited with code ${code}`))
    })
    child.on('error', reject)
  })
}
