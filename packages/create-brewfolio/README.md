# create-brewfolio

Interactive scaffolder for a new Astro + Keystatic site powered by [brewfolio](https://npmjs.com/package/brewfolio).

## Quick start

```bash
npx create-brewfolio
```

Answer a couple of prompts — project name, which type of site — and you'll have a running Astro app with the full brewfolio design system and a Keystatic CMS admin wired up.

## Site types

| Type | Layout | For |
|------|--------|-----|
| `portfolio` | `DashboardLayout` — 5-pane grid | Personal site: concepts, projects, writing, analysis, GitHub activity |
| `app` | `AppLayout` — CMS-configured sections | Dashboards, tools, landing pages driven by Keystatic's `sections` singleton |
| `game` | `GameLayout` — main + leaderboard sidebar | Real-time games or live events |

## Non-interactive (for scripts / CI)

All prompts can be passed as flags:

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

- `brewfolio` — the design system package
- `@keystatic/core` + `@keystatic/astro` — the CMS
- `@astrojs/react` + `react` + `react-dom` — required by Keystatic
- `tailwindcss` + `@tailwindcss/vite` — styling

## Then what

```bash
cd my-site
npm run dev
```

Then open:
- <http://localhost:4321> — your site
- <http://localhost:4321/keystatic> — the CMS admin
