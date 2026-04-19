#!/usr/bin/env node
/**
 * create-brewfolio — interactive scaffolder for a brewfolio site.
 *
 * Usage:
 *   npx create-brewfolio                  (interactive — pick everything)
 *   npx create-brewfolio my-site          (project name given, prompt for type)
 *   npx create-brewfolio my-site --type portfolio --yes  (fully non-interactive)
 */

import { Command } from 'commander'
import { join } from 'path'
import fs from 'fs/promises'
import {
  intro,
  outro,
  text,
  select,
  confirm,
  isCancel,
  cancel,
  spinner,
  note,
  log,
} from '@clack/prompts'
import pc from 'picocolors'
import { copyTemplateOverlay, runProcess } from './utils.js'

const TYPES = [
  {
    value: 'portfolio',
    label: 'Portfolio',
    hint: 'DashboardLayout · 5-pane grid (concepts, projects, writing, analysis, github)',
    blurb: 'Best for personal sites. Ships a dashboard home page pre-wired to the Keystatic collections (projects, writing, notebooks, concepts).',
  },
 {
    value: 'app',
    label: 'App',
    hint: 'AppLayout · sections driven by the CMS',
    blurb: 'Best for dashboards, tools, and landing pages where the home page is a CMS-editable sequence of sections, with built-in analysis notebook routes and modal detail views.',
  },
]

function fail(reason) {
  cancel(reason)
  process.exit(1)
}

function validateProjectName(name) {
  if (!name || !name.trim()) return 'Project name is required'
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(name)) return 'Use letters, numbers, dashes, or underscores (start with a letter or number)'
  return undefined
}

const program = new Command()

program
  .name('create-brewfolio')
  .description('Interactive scaffolder for a new Astro + Keystatic site powered by brewfolio.')
  .argument('[project-name]', 'Name of the project to create (optional; you will be prompted)')
  .option('-t, --type <type>', 'Site type: portfolio | app')
  .option('-y, --yes', 'Skip confirmation prompts and use defaults')
  .option('--astro-template <template>', 'Underlying Astro starter template', 'minimal')
  .option('-d, --dry-run', 'Print what would be done without doing it')
  .option('-l, --local-brewfolio <path>', 'Install brewfolio from a local tarball path (dev-only; skips npm registry)')
  .action(async (argProjectName, opts) => {
    console.clear()
    intro(pc.inverse(pc.bold(' brewfolio ')) + ' ' + pc.dim('· scaffold a new site'))

    // ─── Resolve project name ────────────────────────────────────────────────
    let projectName = argProjectName
    if (!projectName) {
      const answer = await text({
        message: 'What should your project be called?',
        placeholder: 'my-brewfolio-site',
        initialValue: '',
        validate: validateProjectName,
      })
      if (isCancel(answer)) fail('Cancelled.')
      projectName = String(answer).trim()
    } else {
      const v = validateProjectName(projectName)
      if (v) fail(v)
    }

    const projectDir = join(process.cwd(), projectName)

    // Hard fail early if the dir exists
    try {
      await fs.access(projectDir)
      fail(`Directory "./${projectName}" already exists — pick another name.`)
    } catch {}

    // ─── Resolve site type ───────────────────────────────────────────────────
    let type = opts.type
    const validTypes = TYPES.map((t) => t.value)
    if (type && !validTypes.includes(type)) {
      fail(`--type must be one of: ${validTypes.join(', ')}`)
    }
    if (!type) {
      const answer = await select({
        message: 'Which site type?',
        options: TYPES.map((t) => ({ value: t.value, label: t.label, hint: t.hint })),
        initialValue: 'portfolio',
      })
      if (isCancel(answer)) fail('Cancelled.')
      type = String(answer)
    }

    const typeDef = TYPES.find((t) => t.value === type)
    note(typeDef.blurb, `Why ${typeDef.label}?`)

    // ─── Confirm ──────────────────────────────────────────────────────────────
    const summary = [
      `${pc.bold('Path:')}       ./${projectName}`,
      `${pc.bold('Type:')}       ${typeDef.label} (${typeDef.hint})`,
      `${pc.bold('Installs:')}  brewfolio, @keystatic/core, @keystatic/astro, @astrojs/react, astro-icon, lucide/simple-icons icon sets, react, tailwindcss`,
    ].join('\n')
    note(summary, 'Ready to scaffold')

    if (!opts.yes && !opts.dryRun) {
      const ok = await confirm({ message: 'Proceed?', initialValue: true })
      if (isCancel(ok) || !ok) fail('Cancelled.')
    }

    if (opts.dryRun) {
      log.info('[dry-run] no files written, no packages installed.')
      outro(pc.green('Dry run complete.'))
      return
    }

    // ─── Scaffold ─────────────────────────────────────────────────────────────
    try {
      const s = spinner()
      s.start(`Scaffolding Astro project (${opts.astroTemplate} template)…`)
      // create-astro itself is chatty; stop our spinner so its output is visible
      s.stop(`Running create-astro…`)
      await runProcess('npx', [
        '--yes',
        'create-astro@latest',
        projectName,
        '--template', opts.astroTemplate,
        '--no-git',
        '--install',
        '--yes',
      ])

      const s2 = spinner()
      s2.start('Applying brewfolio template overlay…')
      await copyTemplateOverlay(projectDir, type)
      s2.stop('Applied brewfolio template (common + ' + type + ')')

      const s3 = spinner()
      s3.start('Installing brewfolio + peer dependencies…')
      s3.stop('Installing brewfolio + peer dependencies…')
      const brewfolioPath = opts.localBrewfolio ? opts.localBrewfolio : 'brewfolio'
      const installArgs = [
        'install',
        brewfolioPath,
        '@keystatic/core@latest',
        '@keystatic/astro@latest',
        '@astrojs/react@latest',
        'astro-icon@latest',
        '@iconify-json/lucide@latest',
        '@iconify-json/simple-icons@latest',
        'tailwindcss@^4.2.2',
        '@tailwindcss/vite@^4.2.2',
        'react',
        'react-dom',
        '--legacy-peer-deps',
      ]
      await runProcess('npm', installArgs, { cwd: projectDir })

      note(
        [
          `${pc.bold('cd ' + projectName)}`,
          `${pc.bold('npm run dev')}`,
          '',
          'Then open:',
          `  ${pc.cyan('http://localhost:4321')}             — the site`,
          `  ${pc.cyan('http://localhost:4321/keystatic')}   — the CMS admin`,
        ].join('\n'),
        'Next steps',
      )

      outro(pc.green(`Done · your ${typeDef.label.toLowerCase()} is at ./${projectName}`))
    } catch (err) {
      fail(`Scaffolding failed: ${err.message}`)
    }
  })

program.parse()
