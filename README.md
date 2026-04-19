<div align="center">

# brewfolio

**Astro + Keystatic starter system for portfolios and apps, extracted from a
real production portfolio.**

[![npm brewfolio](https://img.shields.io/npm/v/brewfolio)](https://www.npmjs.com/package/brewfolio)
[![npm create-brewfolio](https://img.shields.io/npm/v/create-brewfolio)](https://www.npmjs.com/package/create-brewfolio)
[![license](https://img.shields.io/github/license/eeshansrivastava89/brewfolio)](LICENSE)
[![astro](https://img.shields.io/badge/astro-5.x-ff5d01)](https://astro.build)
[![cms](https://img.shields.io/badge/CMS-Keystatic-6e56cf)](https://keystatic.com)
[![site](https://img.shields.io/badge/example-eeshans.com-cb9f6a)](https://eeshans.com)

[Portfolio package](./brewfolio) •
[Scaffolder package](./packages/create-brewfolio) •
[Live portfolio](https://eeshans.com)

```bash
npx create-brewfolio
```

</div>

## What this is

Brewfolio is the system behind my Astro portfolio work. I spent a lot of time
building my own design language, modal workflow, notebook rendering, and
Keystatic editing flow for [eeshans.com](https://eeshans.com). This repo turns
that into something I can reuse across my own apps and publish for other people
to start from.

It currently supports two site types:

- `portfolio` for the full dashboard-style personal site
- `app` for tools, dashboards, and landing pages with built-in analysis routes

## Try it

The fastest way to use Brewfolio is the real user path:

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

## What you get

| Type | Layout | What it gives you |
|------|--------|-------------------|
| `portfolio` | `DashboardLayout` | Concepts, projects, writing, notebooks, GitHub pane, modal navigation, project drawer |
| `app` | `AppLayout` | CMS-driven homepage sections plus notebook-backed `/analysis` routes |

Both types ship with:

- Astro + Keystatic wired up
- shared header and footer
- sample content in `src/data`
- a starter editing flow that matches the page surface

## How content works

Normal editing happens in Keystatic. The starter content is only there so the
first render is populated.

- replace content in Keystatic for the normal workflow
- delete the generated `src/data/*` starter files if you want a blank start

## Packages

This monorepo ships one runtime package and one CLI package.

| Package | Purpose |
|---------|---------|
| [`brewfolio/`](./brewfolio) | Shared runtime package: layouts, components, tokens, notebook helpers, schema primitives |
| [`packages/create-brewfolio/`](./packages/create-brewfolio) | Interactive scaffolder that creates a new site from the runtime package |

## Testing

The repo includes a simple root-level test harness:

- `npm test` for unit tests with coverage
- `npm run test:e2e` for Playwright
- `npm run test:e2e:report` for the Playwright HTML report
- `npm run test:full` for both

## Design principles

- **Layout is code. Content is CMS.**
- **No hardcoded sample copy in shared components.**
- **Scaffolds stay narrow and page-matched.**
- **Dead surfaces get removed instead of preserved.**

## License

[MIT](./LICENSE)
