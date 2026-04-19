<div align="center">

# create-brewfolio

**Scaffold a new Astro + Keystatic site from the Brewfolio system in one
command.**

[![npm](https://img.shields.io/npm/v/create-brewfolio)](https://www.npmjs.com/package/create-brewfolio)
[![license](https://img.shields.io/github/license/eeshansrivastava89/brewfolio)](../../LICENSE)
[![astro](https://img.shields.io/badge/astro-5.x-ff5d01)](https://astro.build)
[![cms](https://img.shields.io/badge/CMS-Keystatic-6e56cf)](https://keystatic.com)
[![site](https://img.shields.io/badge/example-eeshans.com-cb9f6a)](https://eeshans.com)

[Runtime package](https://www.npmjs.com/package/brewfolio) •
[Source repo](https://github.com/eeshansrivastava89/brewfolio) •
[Live portfolio](https://eeshans.com)

```bash
npx create-brewfolio
```

</div>

## What it does

`create-brewfolio` scaffolds a new Astro site, installs the shared `brewfolio`
runtime, wires up Keystatic, and copies the right starter files for the site
type you choose.

Supported site types:

- `portfolio`
- `app`

## Quick start

Run the published CLI:

```bash
npx create-brewfolio
```

Then:

```bash
cd my-site
npm run dev
```

Open:

- `http://localhost:4321` for the site
- `http://localhost:4321/keystatic` for the CMS

## Site types

| Type | Layout | Best for |
|------|--------|----------|
| `portfolio` | `DashboardLayout` | Personal sites with concepts, projects, writing, analysis, and GitHub activity |
| `app` | `AppLayout` | Dashboards, tools, and landing pages with section-driven content and built-in analysis pages |

## What ships in the app starter

The `app` starter includes:

- CMS-driven homepage blocks
- shared header and footer
- `Analysis` navigation in the header
- `/analysis` archive route
- `/analysis/[id]` notebook detail route
- notebook summary cards and table of contents

Configure app notebooks in **Keystatic → Analysis notebooks**.

## Starter content

Each scaffold includes example content in `src/data` so the first render is not
empty.

- use Keystatic for normal editing and replacement
- delete the generated `src/data/*` starter files if you want a blank start

## Non-interactive usage

You can pass every prompt as a flag:

```bash
npx create-brewfolio my-site --type portfolio --yes
```

| Flag | Description |
|------|-------------|
| `--type <portfolio\|app>` | Site type to scaffold |
| `--astro-template <name>` | Underlying Astro starter template |
| `--yes` | Skip confirmation |
| `--dry-run` | Print what would be done without doing it |
| `--local-brewfolio <path>` | Install `brewfolio` from a local tarball instead of npm |

## What gets installed

The CLI installs:

- `brewfolio`
- `@keystatic/core`
- `@keystatic/astro`
- `@astrojs/react`
- `react`
- `react-dom`
- `tailwindcss`
- `@tailwindcss/vite`
- `astro-icon` and the icon sets used by the starter

## Notes

The earlier `game` scaffold has been removed. If you want a game-like
experience, start from `app` and build the app-specific interaction layer in
your generated project.
