#!/usr/bin/env node
/**
 * create-brewfolio — scaffold a new Astro project with brewfolio pre-configured.
 *
 * Usage:
 *   npx create-brewfolio my-site
 *   npx create-brewfolio my-site --type portfolio
 *   npx create-brewfolio my-site --type app
 *   npx create-brewfolio my-site --type game
 */

import { Command } from 'commander'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'
import ora from 'ora'
import { copyTemplateOverlay, runProcess } from './utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const VALID_TYPES = new Set(['portfolio', 'app', 'game'])

const program = new Command()

program
  .name('create-brewfolio')
  .description('Scaffold a new Astro project with brewfolio pre-configured')
  .argument('<project-name>', 'Name of the project to create')
  .option('-t, --type <type>', 'Brewfolio site type: portfolio | app | game', 'portfolio')
  .option('-d, --dry-run', 'Print what would be done without doing it')
  .option('-l, --local-brewfolio <path>', 'Path to local brewfolio package (for testing before npm publish)')
  .option('--astro-template <template>', 'Underlying Astro starter template', 'minimal')
  .action(async (projectName, opts) => {
    const type = opts.type
    if (!VALID_TYPES.has(type)) {
      console.error(`\n  Error: --type must be one of: ${[...VALID_TYPES].join(', ')}\n`)
      process.exit(1)
    }

    const projectDir = join(process.cwd(), projectName)

    console.log(`\n  brewfolio — scaffolding ${projectName} (type: ${type})\n`)

    if (opts.dryRun) {
      console.log(`  [dry-run] Would create project at: ${projectDir}`)
      console.log(`  [dry-run] Would scaffold Astro starter: ${opts.astroTemplate}`)
      console.log(`  [dry-run] Would copy template overlay: common + ${type}`)
      console.log(`  [dry-run] Would install: brewfolio, @keystatic/core, @keystatic/astro, @astrojs/react, react, react-dom, tailwindcss`)
      return
    }

    try {
      // 1. Check target directory doesn't already exist
      let spinner = ora('Checking target directory…').start()
      try {
        await fs.access(projectDir)
        spinner.fail(`Directory "${projectName}" already exists. Choose a different name or remove it first.`)
        process.exit(1)
      } catch {}
      spinner.succeed('Target directory is free')

      // 2. Scaffold Astro project
      spinner = ora(`Scaffolding Astro project (${opts.astroTemplate} template)…`).start()
      spinner.stop()
      await runProcess('npx', [
        '--yes',
        'create-astro@latest',
        projectName,
        '--template', opts.astroTemplate,
        '--no-git',
        '--install',
        '--yes',
      ])

      // 3. Copy template overlay: common + type-specific
      spinner = ora('Applying brewfolio template overlay…').start()
      await copyTemplateOverlay(projectDir, type)
      spinner.succeed(`Applied brewfolio template (common + ${type})`)

      // 4. Install brewfolio + peer deps
      //    Use --legacy-peer-deps: @keystatic/astro hasn't updated its peer dep for Astro 6 yet
      spinner = ora('Installing brewfolio + peer dependencies…').start()
      spinner.stop()
      const brewfolioPath = opts.localBrewfolio
        ? opts.localBrewfolio
        : 'brewfolio'

      const installArgs = [
        'install',
        brewfolioPath,
        '@keystatic/core@latest',
        '@keystatic/astro@latest',
        '@astrojs/react@latest',
        'tailwindcss@^4.2.2',
        '@tailwindcss/vite@^4.2.2',
        'react',
        'react-dom',
        '--legacy-peer-deps',
      ]
      await runProcess('npm', installArgs, { cwd: projectDir })

      console.log('')
      console.log(`  Done! Your ${type} is ready at ./${projectName}\n`)
      console.log('  Next steps:')
      console.log(`    cd ${projectName}`)
      console.log('    npm run dev')
      console.log('')
      console.log('  Then visit:')
      console.log('    http://localhost:4321         — the site')
      console.log('    http://localhost:4321/keystatic — the CMS admin\n')
    } catch (err) {
      console.error(`\n  Scaffolding failed: ${err.message}\n`)
      process.exit(1)
    }
  })

program.parse()
