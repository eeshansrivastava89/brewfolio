import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../..')
const CREATE_BREWFOLIO_ENTRY = join(REPO_ROOT, 'packages/create-brewfolio/src/index.js')
const BREWFOLIO_PACKAGE_DIR = join(REPO_ROOT, 'brewfolio')

let packedTarballPromise: Promise<string> | null = null
const sharedSites = new Map<
  ScaffoldType,
  Promise<{ acquire: () => RunningSite }>
>()

type ScaffoldType = 'portfolio' | 'app' | 'game'

export interface RunningSite {
  type: ScaffoldType
  projectDir: string
  baseUrl: string
  stop: () => Promise<void>
  cleanup: () => Promise<void>
}

export async function createSite(type: ScaffoldType): Promise<RunningSite> {
  if (!sharedSites.has(type)) {
    sharedSites.set(type, createSharedSite(type))
  }

  const shared = await sharedSites.get(type)!
  return shared.acquire()
}

async function createSharedSite(type: ScaffoldType): Promise<{
  acquire: () => RunningSite
}> {
  const workspaceRoot = await mkdtemp(join(tmpdir(), `brewfolio-${type}-`))
  const projectName = type
  const projectDir = join(workspaceRoot, projectName)
  const localTarball = await packBrewfolio()
  let refCount = 0

  await runCommand(
    'node',
    [
      CREATE_BREWFOLIO_ENTRY,
      projectName,
      '--type',
      type,
      '--yes',
      '--local-brewfolio',
      localTarball,
    ],
    workspaceRoot,
  )

  const port = await getFreePort()
  const child = spawn(
    'npm',
    ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)],
    {
      cwd: projectDir,
      env: { ...process.env, CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  const logs: string[] = []
  child.stdout?.on('data', (chunk) => logs.push(String(chunk)))
  child.stderr?.on('data', (chunk) => logs.push(String(chunk)))

  const baseUrl = `http://127.0.0.1:${port}`
  await waitForHttp(baseUrl, child, logs)

  const site: RunningSite = {
    type,
    projectDir,
    baseUrl,
    stop: async () => {
      await stopChild(child)
    },
    cleanup: async () => {
      refCount -= 1
      if (refCount > 0) return
      sharedSites.delete(type)
      await stopChild(child)
      await rm(workspaceRoot, { recursive: true, force: true })
    },
  }

  return {
    acquire: () => {
      refCount += 1
      return site
    },
  }
}

async function packBrewfolio(): Promise<string> {
  if (!packedTarballPromise) {
    packedTarballPromise = (async () => {
      const output = await captureCommand('npm', ['pack', '--json'], {
        cwd: BREWFOLIO_PACKAGE_DIR,
      })
      const parsed = JSON.parse(output) as Array<{ filename: string }>
      return join(BREWFOLIO_PACKAGE_DIR, parsed[0].filename)
    })()
  }

  return packedTarballPromise
}

async function runCommand(command: string, args: string[], cwd = REPO_ROOT) {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: '1' },
      stdio: 'inherit',
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }
      rejectPromise(new Error(`"${command} ${args.join(' ')}" exited with code ${code}`))
    })

    child.on('error', rejectPromise)
  })
}

async function captureCommand(
  command: string,
  args: string[],
  options: { cwd: string },
): Promise<string> {
  return await new Promise<string>((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (chunk) => {
      stdout += String(chunk)
    })
    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk)
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise(stdout.trim())
        return
      }
      rejectPromise(
        new Error(`"${command} ${args.join(' ')}" exited with code ${code}\n${stderr}`),
      )
    })

    child.on('error', rejectPromise)
  })
}

async function getFreePort(): Promise<number> {
  return await new Promise<number>((resolvePromise, rejectPromise) => {
    import('node:net')
      .then(({ createServer }) => {
        const server = createServer()
        server.listen(0, '127.0.0.1', () => {
          const address = server.address()
          if (!address || typeof address === 'string') {
            rejectPromise(new Error('Could not allocate a free port'))
            return
          }
          const { port } = address
          server.close(() => resolvePromise(port))
        })
        server.on('error', rejectPromise)
      })
      .catch(rejectPromise)
  })
}

async function waitForHttp(url: string, child: ChildProcess, logs: string[]) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < 180_000) {
    if (child.exitCode !== null) {
      throw new Error(`Dev server exited early for ${url}\n${logs.join('')}`)
    }

    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // wait for server
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000))
  }

  throw new Error(`Timed out waiting for ${url}\n${logs.join('')}`)
}

async function stopChild(child: ChildProcess) {
  if (child.exitCode !== null) return

  child.kill('SIGTERM')
  await Promise.race([
    new Promise<void>((resolvePromise) => child.once('exit', () => resolvePromise())),
    new Promise<void>((resolvePromise) => setTimeout(resolvePromise, 5_000)),
  ])

  if (child.exitCode === null) {
    child.kill('SIGKILL')
    await new Promise<void>((resolvePromise) => child.once('exit', () => resolvePromise()))
  }
}
