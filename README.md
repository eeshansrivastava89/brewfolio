# brewfolio

`brewfolio` is a monorepo with two published packages: the shared Astro design
system, and the scaffolder that generates new sites from it.

## Quick start

Use the scaffolder when you want the full user path.

```bash
npx create-brewfolio
```

Pick a type (`portfolio`, `app`, or `game`), answer the prompts, and you get
an Astro site with Keystatic wired up to the matching layout.

## Packages

The repo ships one runtime package and one CLI package.

| Package | What it is | Published |
|---------|-----------|-----------|
| [`brewfolio/`](./brewfolio) | The runtime library: layouts, components, tokens, Keystatic schema | [`brewfolio` on npm](https://www.npmjs.com/package/brewfolio) |
| [`packages/create-brewfolio/`](./packages/create-brewfolio) | The interactive scaffolder (the thing `npx` runs) | [`create-brewfolio` on npm](https://www.npmjs.com/package/create-brewfolio) |

## Three layouts

Each scaffold owns a layout-specific editing surface.

| Layout | For |
|--------|-----|
| `DashboardLayout` | Personal portfolio sites — 5-pane grid (concepts, projects, writing, analysis, GitHub) |
| `AppLayout` | Tools, dashboards, landing pages — section sequence driven by the `sections` singleton |
| `GameLayout` | Real-time games or live events — main column + leaderboard sidebar |

## Content model

The shared package exports reusable schema primitives, but the scaffold narrows
them per template so the editor matches the page surface.

- `portfolio`: `config`, `github`, `writingSettings`, `concepts`, `about`,
  `timeline`, `impact`, `secrets`, plus the `projects`, `writing`, and
  `notebooks` collections.
- `app`: `config`, `sections`, and `secrets`.
- `game`: `config` and `gameHome`.

Sample content never lives in the shared components. The scaffold writes it to
template-local `src/data` files so you can delete or replace it without
rewriting the layout code.

## Removing sample content

Every generated site ships with example content so the layout is populated on
first boot. If you want a blank start, remove or clear the matching files in
your generated project.

- Portfolio: clear `src/data/projects/*`, `src/data/writing/*`,
  `src/data/notebooks/*`, and the singleton files
  `src/data/site-config.yaml`, `src/data/concepts.yaml`,
  `src/data/about.yaml`, `src/data/timeline.yaml`,
  `src/data/impact.yaml`, `src/data/github.yaml`,
  `src/data/writing-config.yaml`, and `src/data/secrets.yaml`.
- App: clear `src/data/site-config.yaml`, `src/data/sections.yaml`, and
  `src/data/secrets.yaml`.
- Game: clear `src/data/site-config.yaml` and `src/data/game-home.yaml`.

## Design philosophy

The project follows a small set of implementation rules.

- **Layout is code. Content is CMS.** Astro handles structure and routing, and
  Keystatic owns the page-level content.
- **Scaffolds stay template-specific.** Each generated site gets the smallest
  Keystatic surface that matches its layout.
- **Tailwind-first.** Utility classes handle most styling; scoped CSS stays for
  things Tailwind cannot express cleanly.
- **Open source, no SaaS.** Everything runs from local files.

## Repo layout

The repo is split between the shared package and the scaffolder.

```
brewfolio/                            ← the npm package "brewfolio"
├── src/
│   ├── layouts/                      ← 3 layouts
│   ├── components/                   ← ~35 components
│   ├── lib/                          ← types + helpers
│   ├── styles/tokens.css             ← design tokens (CSS vars)
│   ├── keystatic.config.ts           ← full schema
│   └── index.ts                      ← package entry
└── package.json

packages/create-brewfolio/            ← the npm package "create-brewfolio"
├── src/                              ← CLI (clack wizard)
├── template/
│   ├── common/                       ← files copied into every scaffold
│   ├── portfolio/                    ← DashboardLayout starter pages
│   ├── app/                          ← AppLayout starter pages
│   └── game/                         ← GameLayout starter pages
└── package.json
```

## Contributing

The canonical reference implementation is
[`datascienceapps`](https://github.com/eeshansrivastava89). Patterns extracted
from that site get moved into `brewfolio/` and released on npm.

## License

MIT — see [LICENSE](./LICENSE)
