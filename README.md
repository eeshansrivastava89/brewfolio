# brewfolio

Monorepo for **brewfolio** — a CMS-driven design system for Astro — and its scaffolder.

## Quick start

```bash
npx create-brewfolio
```

Pick a type (portfolio / app / game), answer two prompts, and you'll have a running Astro + Keystatic site using the full design system.

## Packages

| Package | What it is | Published |
|---------|-----------|-----------|
| [`brewfolio/`](./brewfolio) | The runtime library: layouts, components, tokens, Keystatic schema | [`brewfolio` on npm](https://www.npmjs.com/package/brewfolio) |
| [`packages/create-brewfolio/`](./packages/create-brewfolio) | The interactive scaffolder (the thing `npx` runs) | [`create-brewfolio` on npm](https://www.npmjs.com/package/create-brewfolio) |

## Three layouts

| Layout | For |
|--------|-----|
| `DashboardLayout` | Personal portfolio sites — 5-pane grid (concepts, projects, writing, analysis, GitHub) |
| `AppLayout` | Tools, dashboards, landing pages — section sequence driven by the `sections` singleton |
| `GameLayout` | Real-time games or live events — main column + leaderboard sidebar |

## Design philosophy

- **Layout is code. Content is CMS.** Astro handles structure and routing; Keystatic owns the content.
- **One schema everywhere.** The full brewfolio Keystatic schema (`projects`, `writing`, `notebooks`, `concepts`, `sections`, `siteConfig`, `timeline`, `about`, `impact`, `secrets`) is re-exported by the package — consuming apps import `collections` and `singletons` and pass them straight through.
- **Tailwind-first.** Utility classes for layout, spacing, color, typography; raw CSS only for things Tailwind can't express (pseudo-element notches, keyframes).
- **Open-source, no SaaS.** Everything runs from local files. No registration, no paid tier.

## Repo layout

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

internal/docs/                        ← design, architecture, test reports
```

## Docs

- [Vision + architecture](./internal/docs/brewfolio-vision-and-architecture.md)
- [Implementation plan](./internal/docs/brewfolio-implementation-plan.md)
- [Phase 6.5 end-to-end test report](./internal/docs/brewfolio-phase6_5-e2e-test-report.md) — 36 screenshots

## Contributing

The canonical reference implementation is [`datascienceapps`](https://github.com/eeshansrivastava89) (author's personal site). Patterns extracted from that site get extracted into `brewfolio/` and released on npm.

## License

MIT — see [LICENSE](./LICENSE)
