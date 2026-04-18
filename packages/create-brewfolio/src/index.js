#!/usr/bin/env node
/**
 * create-brewfolio — scaffold a new Astro project with brewfolio pre-configured.
 *
 * Usage:
 *   npx create-brewfolio my-site
 *   npx create-brewfolio my-site --template minimal
 */

import { Command } from 'commander'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'
import ora from 'ora'
import { copyTemplateOverlay, runProcess } from './utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const program = new Command()

program
  .name('create-brewfolio')
  .description('Scaffold a new Astro project with brewfolio pre-configured')
  .argument('<project-name>', 'Name of the project to create')
  .option('-t, --template <template>', 'Astro project template', 'minimal')
  .option('-d, --dry-run', 'Print what would be done without doing it')
  .option('-l, --local-brewfolio <path>', 'Path to local brewfolio package (for testing)')
  .action(async (projectName, opts) => {
    const projectDir = join(process.cwd(), projectName)

    console.log(`\n  brewfolio — scaffolding ${projectName}\n`)

    if (opts.dryRun) {
      console.log(`  [dry-run] Would create project at: ${projectDir}`)
      console.log(`  [dry-run] Would scaffold template: ${opts.template}`)
      console.log(`  [dry-run] Would install: brewfolio, @keystatic/core, @keystatic/astro, tailwind, react`)
      return
    }

    const spinner = ora()

    try {
      // 1. Check target directory doesn't already exist
      spinner.start('Checking target directory…')
      try {
        await fs.access(projectDir)
        spinner.fail(`Directory "${projectName}" already exists. Choose a different name or remove it first.`)
        process.exit(1)
      } catch {}
      spinner.succeed('Checking target directory…')

      // 2. Scaffold Astro project
      spinner.start(`Scaffolding Astro project (${opts.template} template)…`)
      await runProcess('npx', [
        '--yes',
        'create-astro@latest',
        projectName,
        '--template', opts.template,
        '--no-git',
        '--yes',
      ])

      // 3. Copy template overlay files into the new project
      spinner.start('Applying brewfolio template…')
      await copyTemplateOverlay(projectDir)
      spinner.succeed('Applying brewfolio template…')

      // 4. Install brewfolio + peer deps
      //    Use --legacy-peer-deps: @keystatic/astro hasn't updated its peer dep for Astro 6 yet
      spinner.start('Installing dependencies…')
      const brewfolioPath = opts.localBrewfolio
        ? opts.localBrewfolio
        : 'brewfolio'

      const installArgs = [
        'install',
        brewfolioPath,
        '@keystatic/core@latest',
        '@keystatic/astro@latest',
        'tailwindcss@^4.2.2',
        '@tailwindcss/vite@^4.2.2',
        'react',
        'react-dom',
        '--legacy-peer-deps',
      ]
      await runProcess('npm', installArgs, { cwd: projectDir })

      spinner.succeed(`\n  Done! Your project is ready at ./${projectName}\n`)
      console.log('  Next steps:\n')
      console.log(`    cd ${projectName}`)
      console.log('    npm run dev')
      console.log('')
    } catch (err) {
      spinner.fail(`Scaffolding failed: ${err.message}`)
      process.exit(1)
    }
  })

program.parse()
