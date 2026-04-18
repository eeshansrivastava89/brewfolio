# create-brewfolio

`create-brewfolio` scaffolds a new Astro + Keystatic site powered by
[brewfolio](https://npmjs.com/package/brewfolio).

## Quick start

Run the published CLI, then open the generated site and CMS.

```bash
npx create-brewfolio
```

Answer the prompts, then run:

```bash
cd my-site
npm run dev
```

Open:

- <http://localhost:4321> for the site
- <http://localhost:4321/keystatic> for the CMS

## Starter content

Each scaffold includes example content in `src/data` so the first render is not
empty. None of that sample content is embedded in shared components.

- `portfolio`: examples live in `src/data/projects/*`, `src/data/writing/*`,
  `src/data/notebooks/*`, and the singleton files in `src/data/`.
- `app`: examples live in `src/data/site-config.yaml`,
  `src/data/sections.yaml`, and `src/data/secrets.yaml`.
- `game`: examples live in `src/data/site-config.yaml` and
  `src/data/game-home.yaml`.

To start blank, delete the sample collection files and clear the singleton
files after scaffolding.

## Site types

Each type maps to one layout and one Keystatic surface.

| Type | Layout | For |
|------|--------|-----|
| `portfolio` | `DashboardLayout` — 5-pane grid | Personal site: concepts, projects, writing, analysis, GitHub activity |
| `app` | `AppLayout` — CMS-configured sections | Dashboards, tools, and landing pages driven by `sections` |
| `game` | `GameLayout` — main + leaderboard sidebar | Real-time games or live events |

## Non-interactive (for scripts / CI)

You can pass every prompt as a flag.

```bash
npx create-brewfolio my-site --type portfolio --yes
```

| Flag | Description | Default |
|------|-------------|---------|
| `--type <portfolio\|app\|game>` | Which site type to scaffold | prompted |
| `--astro-template <name>` | Underlying Astro starter template | `minimal` |
| `--yes` | Skip confirmation | `false` |
| `--dry-run` | Print what would be done without doing it | `false` |
| `--local-brewfolio <path>` | Install brewfolio from a local tarball instead of npm (dev only) | npm registry |

## What gets installed

The CLI installs the shared package and the Astro dependencies it needs.

- `brewfolio` — the design system package
- `@keystatic/core` + `@keystatic/astro` — the CMS
- `@astrojs/react` + `react` + `react-dom` — required by Keystatic
- `tailwindcss` + `@tailwindcss/vite` — styling
