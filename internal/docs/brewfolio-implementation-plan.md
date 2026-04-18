# Brewfolio implementation plan

Last updated: April 17, 2026

## Conventions

**Tailwind-first** — All components use Tailwind utility classes exclusively. `<style>` blocks are only for pseudo-element shapes (notch `::before`/`::after`), keyframe animations, and CSS tricks Tailwind cannot express. Consuming apps must have Tailwind configured.

## Phase 1 — Package foundation

### Tokens + schema

- [x] `tokens.css` — design tokens (CSS variables, ported from datascienceapps)
- [x] `keystatic.config.ts` — full schema exported as a module from the package
- [x] `lib/` — content loading utilities, GitHub fetch, notebook renderer

### Base components

- [x] `BaseHead` — meta, OG, fonts
- [x] `Header` — site header with logo, nav, and settings trigger slot
- [x] `Footer` — site footer
- [x] `ThemeProvider` — dark/light mode context
- [x] `Button` — reusable button with variants
- [x] `ContentModal` — modal shell with titlebar, close, scroll-spy TOC, sizes
- [x] `Breadcrumbs` — breadcrumb navigation

### Layouts (empty shells)

- [x] `DashboardLayout.astro` — placeholder shell
- [x] `AppLayout.astro` — placeholder shell
- [x] `GameLayout.astro` — placeholder shell

---

## Phase 2 — Portfolio components

Components from `datascienceapps` that map to a Keystatic collection or singleton.

### Dashboard grid

- [x] `Dashboard.astro` — 5-pane grid orchestrator with concept filtering
- [x] `ConceptsPane` — concept filter list + editable intro copy
- [x] `ProjectsPane` — project tiles grid with status/tags/links
- [x] `WritingPane` — post list with tags + subscribe button
- [x] `GitHubPane` — contribution grid + activity timeline
- [x] `AnalysisPane` — notebook list

### Portfolio singletons

- [x] `ImpactShelf` — impact sections with left-border accent
- [x] `WorkTimeline` — work/education timeline with expandable entries
- [x] `NotebookSummaryCard` — card for notebook catalog
- [x] `ArticleTOC` — table of contents with scroll spy

### Navigation + search

- [x] `SearchOverlay` — full-screen search overlay
- [x] `SearchData` — search index data provider
- [x] `ModalSource` — template marker for modal content extraction
- [x] `HomeHeader` — home page header with nav + active route
- [x] `MiniClockWeather` — clock + weather mini widget

---

## Phase 3 — Shared components

Identified during app mapping. Cross-app components that are not tied to a specific collection.

- [x] `StatsGrid` — metric cards grid (count, label, delta/trend). Includes ComparisonGrid variant for A/B comparison.
- [x] `StatusCard` — single status indicator (green/red/yellow/gray)
- [x] `ExecutionPanel` — real-time SSE/polling progress panel with event stream + cancel
- [x] `ActivityLog` — scrollable timestamped event log (shares infra with ExecutionPanel)
- [x] `DataTable` — sortable, filterable, paginated table
- [x] `FilterBar` — horizontal toggleable filter chips bar
- [x] `SettingsModal` — key-value settings dialog (text, URL, select, toggle). Gear icon trigger in Header.
- [x] `SetupWizard` — multi-step onboarding with step indicator and slot-based steps
- [x] `Leaderboard` — ranked list with rank badge + score + optional delta
- [x] `Timer` — countdown/count-up with urgency states (normal/warning/critical)
- [x] `ScoreDisplay` — animated points display (count-up on change)

---

## Phase 4 — AppLayout section ordering

The `sections` singleton was planned for AppLayout but not yet implemented in `datascienceapps`.

- [x] Define `sections` Keystatic schema (ordered list of section blocks: metrics-grid, results-list, notebook, github-timeline)
- [x] Build `AppSections.astro` component — renders section blocks from CMS data
- [x] Wire `sections` into AppLayout — page reads CMS config instead of hardcoded section order
- [ ] Verify section reordering works via Keystatic UI

---

## Phase 5 — CLI scaffolding

- [x] `create-brewfolio` CLI (`npx create-brewfolio <project-name>`)
  - Scaffolds Astro project with `npm create astro@latest --template <template>`
  - Installs `brewfolio`, `@keystatic/core`, `@keystatic/astro`
  - Copies starter template (`keystatic.config.ts`, `astro.config.mjs`, `global.css`, `index.astro`)
  - Prints next steps
  - `--template`, `--no-git`, `--dry-run` options

## Packages layout

```
brewfolio/                          ← design system npm package
packages/create-brewfolio/         ← scaffold CLI
  src/
    index.js                        ← CLI entry (commander + ora)
    utils.js                        ← copyTemplateOverlay, runProcess, updatePackageJsonDeps
  template/                         ← starter files overlaid after Astro scaffold
    keystatic.config.ts
    astro.config.mjs
    src/
      styles/global.css
      pages/index.astro
```

---

## Phase 6 — Test by building arbitrary apps

- [x] CLI end-to-end test: scaffold project, install deps, start dev server — **passed HTTP 200**
- [x] Bug fixed: `fields.dynamic` → `fields.conditional` (Keystatic 0.5.x compatibility)
- [x] Bug fixed: include `.astro` files in npm package + add sub-path exports for `layouts/*`, `components/*`, `lib/*`
- [x] Bug fixed: `@keystatic/astro@^0.5` → `@latest` (version 5.x, not 0.5.x)
- [x] Bug fixed: added `react` + `react-dom` as required peer deps
- [x] Screenshots captured: homepage and Keystatic admin UI both load
- [x] Test report documented at `internal/docs/brewfolio-phase6-test-report.md`
- [x] Tailwind CSS v4 added to CLI (`tailwindcss@^4.2.2`, `@tailwindcss/vite@^4.2.2`) with `@theme` token mapping in template global.css
- [x] Removed duplicate `Props` interface in `AppSections.astro`
- [x] Updated template files (`astro.config.mjs`, `global.css`, `index.astro`, `tailwind.config.js`)
- [x] Thorough test report with 10+ screenshots at `internal/docs/brewfolio-phase6-thorough-test-report.md`

---

## Phase 7 — Migration (end)

Existing apps converted to brewfolio after the package is proven:

| App | Layout | Notes |
|-----|--------|-------|
| llm-bench → Astro | AppLayout | React converted to Astro; SSE execution panel reuses ExecutionPanel |
| sidequests → Astro | DashboardLayout | Next.js converted to Astro; signal filters + onboarding stay custom |
| howiprompt | DashboardLayout + AppLayout | Already Astro; wrapped/linguistics stay custom |
| ab-simulator | DashboardLayout + AppLayout | Already Astro; game/map/charts stay custom |
| quizzard → Astro | GameLayout + AppLayout | Vite+TS converted to Astro; participant list + QR + questions stay custom |

Migration order: llm-bench → sidequests → howiprompt → ab-simulator → quizzard
