#!/usr/bin/env node
/**
 * create-brewfolio — scaffold a new Astro project with brewfolio pre-configured.
 *
 * Usage:
 *   npx create-brewfolio my-site
 *   npx create-brewfolio my-site --template minimal
 *   npx create-brewfolio my-site --no-git
 */

import { Command } from 'commander'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'
import ora from 'ora'
import { copyTemplateOverlay, updatePackageJsonDeps, runProcess } from './utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const program = new Command()

program
  .name('create-brewfolio')
  .description('Scaffold a new Astro project with brewfolio pre-configured')
  .argument('<project-name>', 'Name of the project to create')
  .option('-t, --template <template>', 'Astro project template', 'minimal')
  .option('-g, --no-git', 'Skip git initialization')
  .option('-d, --dry-run', 'Print what would be done without doing it')
  .action(async (projectName, opts) => {
    const projectDir = join(process.cwd(), projectName)

    console.log(`\n  brewfolio — scaffolding ${projectName}\n`)

    if (opts.dryRun) {
      console.log(`  [dry-run] Would create project at: ${projectDir}`)
      console.log(`  [dry-run] Would scaffold template: ${opts.template}`)
      console.log(`  [dry-run] Would install: brewfolio, @keystatic/core, @keystatic/astro`)
      console.log(`  [dry-run] Would init git: ${opts.git}`)
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

      // 2. Run `npm create astro@latest` with --template minimal --no-git --yes
      //    We let Astro handle the template itself, then overlay brewfolio on top.
      spinner.start(`Scaffolding Astro project (${opts.template} template)…`)
      await runProcess('npm', [
        'create', 'astro@latest',
        projectName,
        '--template', opts.template,
        '--no-git',
        '--yes',
      ], { stdio: 'pipe' })

      // 3. Copy template overlay files into the new project
      spinner.start('Applying brewfolio template…')
      await copyTemplateOverlay(projectDir)
      await updatePackageJsonDeps(projectDir)

      // 4. Install brewfolio + peer deps
      spinner.start('Installing dependencies…')
      await runProcess('npm', [
        'install',
        'brewfolio',
        '@keystatic/core@^0.5',
        '@keystatic/astro@^0.5',
      ], { cwd: projectDir, stdio: 'pipe' })

      // 5. Init git if requested
      if (opts.git) {
        spinner.start('Initializing git…')
        await runProcess('git', ['init'], { cwd: projectDir, stdio: 'pipe' })
      }

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
