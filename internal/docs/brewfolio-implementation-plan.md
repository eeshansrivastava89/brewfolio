# Brewfolio implementation plan

Last updated: April 16, 2026

## Phase 1 — Package foundation

### Tokens + schema

- [ ] `tokens.css` — design tokens (CSS variables, ported from datascienceapps)
- [ ] `keystatic.config.ts` — full schema exported as a module from the package
- [ ] `lib/` — content loading utilities, GitHub fetch, notebook renderer

### Base components

- [ ] `BaseHead` — meta, OG, fonts
- [ ] `Header` — site header with logo, nav, and settings trigger slot
- [ ] `Footer` — site footer
- [ ] `ThemeProvider` — dark/light mode context
- [ ] `Button` — reusable button with variants
- [ ] `ContentModal` — modal shell with titlebar, close, scroll-spy TOC, sizes
- [ ] `Breadcrumbs` — breadcrumb navigation

### Layouts (empty shells)

- [ ] `DashboardLayout.astro` — placeholder shell
- [ ] `AppLayout.astro` — placeholder shell
- [ ] `GameLayout.astro` — placeholder shell

---

## Phase 2 — Portfolio components

Components from `datascienceapps` that map to a Keystatic collection or singleton.

### Dashboard grid

- [ ] `Dashboard.astro` — 5-pane grid orchestrator with concept filtering
- [ ] `ConceptsPane` — concept filter list + editable intro copy
- [ ] `ProjectsPane` — project tiles grid with status/tags/links
- [ ] `WritingPane` — post list with tags + subscribe button
- [ ] `GitHubPane` — contribution grid + activity timeline
- [ ] `AnalysisPane` — notebook list

### Portfolio singletons

- [ ] `ImpactShelf` — impact sections with left-border accent
- [ ] `WorkTimeline` — work/education timeline with expandable entries
- [ ] `NotebookSummaryCard` — card for notebook catalog
- [ ] `ArticleTOC` — table of contents with scroll spy

### Navigation + search

- [ ] `SearchOverlay` — full-screen search overlay
- [ ] `SearchData` — search index data provider
- [ ] `ModalSource` — template marker for modal content extraction
- [ ] `HomeHeader` — home page header with nav + active route
- [ ] `MiniClockWeather` — clock + weather mini widget

---

## Phase 3 — Shared components

Identified during app mapping. Cross-app components that are not tied to a specific collection.

- [ ] `StatsGrid` — metric cards grid (count, label, delta/trend). Includes ComparisonGrid variant for A/B comparison.
- [ ] `StatusCard` — single status indicator (green/red/yellow/gray)
- [ ] `ExecutionPanel` — real-time SSE/polling progress panel with event stream + cancel
- [ ] `ActivityLog` — scrollable timestamped event log (shares infra with ExecutionPanel)
- [ ] `DataTable` — sortable, filterable, paginated table
- [ ] `FilterBar` — horizontal toggleable filter chips bar
- [ ] `SettingsModal` — key-value settings dialog (text, URL, select, toggle). Gear icon trigger in Header.
- [ ] `SetupWizard` — multi-step onboarding with step indicator and slot-based steps
- [ ] `Leaderboard` — ranked list with rank badge + score + optional delta
- [ ] `Timer` — countdown/count-up with urgency states (normal/warning/critical)
- [ ] `ScoreDisplay` — animated points display (count-up on change)

---

## Phase 4 — AppLayout section ordering

The `sections` singleton was planned for AppLayout but not yet implemented in `datascienceapps`.

- [ ] Define `sections` Keystatic schema (ordered list of section blocks)
- [ ] Wire `sections` into AppLayout — page reads CMS config instead of hardcoded section order
- [ ] Verify section reordering works via Keystatic UI

---

## Phase 5 — CLI scaffolding

- [ ] `create-brewfolio` CLI (`npx create-brewfolio my-site`)
  - Scaffolds Astro project with `npm create astro@latest --template minimal`
  - Installs `brewfolio`, `@keystatic/core`, `@keystatic/astro`
  - Copies starter `keystatic.config.ts` (imports schema from brewfolio)
  - Creates starter pages with appropriate layouts
  - Prints next steps

---

## Phase 6 — Test by building arbitrary apps

- [ ] Use brewfolio to build a new app from scratch
- [ ] Mix and match components across different layout combinations
- [ ] Verify cross-app theming works via npm update cycle

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
