# Brewfolio

Brewfolio packages the UX and design language from `datascienceapps` into a centrally controlled, CMS-driven system you can reuse across your own projects and eventually publish for other people. The system avoids routine code or config editing for content changes — everything flows through Keystatic.

Last updated: April 16, 2026

## Vision

Brewfolio captures the look, feel, interaction patterns, and overall site experience of `datascienceapps` and makes that reusable across your other projects. The point is not to invent a generic design system from scratch — it is to modularize what you already built and make it the shared foundation everywhere.

### What to centralize

You want one central system to control the shared website experience. When theme, styling, layout, or interaction patterns change, those changes should be made once and flow through every site that uses Brewfolio. The shared system centralizes visual language, layout patterns and page structure, notebook rendering, GitHub activity presentation, modal-style navigation patterns, and reusable page and section behavior across projects.

### CMS-first workflow

Normal content updates should not require editing source code, YAML files, config files, or hand-tuned parameters. Content is managed through a CMS, content editing feels like one consistent workflow, and the system does not depend on manual repo file editing for ordinary changes. The CMS should support both your own sites and future Brewfolio users through the same general approach.

### Simplicity and reusability

The simplest solution that can support the long-term goal is what you want. Simplicity is more important than preserving existing implementation work. The architecture may be rewritten, existing Brewfolio work can be discarded, and other repos can be reshaped to fit the final structure — as long as it creates one coherent approach instead of extra layers and branching pathways.

The product goal is to make Brewfolio reusable beyond your own sites. You want to publish it so other people can adopt the same system. This reuse goal should not come at the cost of a fragmented architecture — the same general model applies for personal use and for external users.

### Canonical reference

`datascienceapps` is the reference implementation. Future planning begins from that site and asks how to package and reuse its successful patterns, instead of starting from abstract contracts or generic scaffolding ideas.

---

## Architecture

### Key insight

**Layout is code. Content is CMS.**

- **CMS (Keystatic)**: Stores content, theme values, section configuration
- **Code (Astro)**: Handles page structure, layouts, routing, component rendering

No CMS visually configures page layout. Keystatic manages content and section ordering. Astro layouts handle structure. The schema is the same everywhere — which collections you render depends on the page layout, not the schema.

### Package structure

```
brewfolio/
├── tokens.css              ← design tokens (CSS variables)
├── layouts/
│   ├── DashboardLayout.astro   ← modal nav, full dashboard (portfolio)
│   ├── AppLayout.astro          ← single page, section renderer (app)
│   └── GameLayout.astro         ← real-time layout with leaderboard sidebar
├── components/              ← all UI components
│   ├── GitHubPane.astro
│   ├── ProjectDrawer.astro
│   ├── MetricsGrid.astro
│   ├── NotebookSection.astro
│   └── ...
└── lib/                    ← content loading, GitHub fetch, etc.
```

### Three layouts

| Layout | Purpose |
|--------|---------|
| DashboardLayout | Modal-nav, full dashboard grid. Renders ConceptsPane + ProjectsPane + WritingPane + GitHubPane + AnalysisPane in a 2-row grid. Portfolio layout. |
| AppLayout | Single-page layout with configurable section sequence. App layout for notebooks, wrapped experiences, and focused content pages. |
| GameLayout | Real-time interactive layout with a prominent leaderboard sidebar. Used for games and live events. |

### Keystatic schema

All collections are always available. Which ones you render depends on the page layout, not the schema.

**Collections:** `projects`, `writing`, `notebooks`, `concepts`
**Singletons:** `siteConfig` (identity + theme), `secrets` (GitHub token), `timeline`, `about`, `impact`, `sections` (app page section ordering — planned but not yet implemented)

---

## Theme propagation

Theme is stored in Keystatic via the siteConfig singleton and generates CSS variables. For your 100 repos, theme propagates through npm:

1. Theme lives in Keystatic (siteConfig)
2. Brewfolio package reads the theme and generates CSS variables
3. You publish a new version: `npm publish`
4. All repos update: `npm update brewfolio`
5. All sites rebuild with the new theme

### Tailwind-first convention

All consuming apps use **Tailwind CSS** exclusively for styling. Brewfolio components follow the same convention:

- **Tailwind utility classes** for all layout, spacing, color, and typography styles
- **`<style>` blocks only for** pseudo-element shapes (`::before`/`::after` with box-shadow tricks like the notch), keyframe animations, and CSS custom property tricks Tailwind genuinely cannot express
- **CSS variables from `tokens.css`** for color/spacing values — e.g. `text-foreground`, `bg-card`, `border-border` via the `tw-*` HSL variables mapped from `--foreground`, `--card`, `--border`
- **Dark mode via `dark:` prefix** — Tailwind's `dark:` variant + CSS variable mapping handles light/dark switching automatically

This keeps the design system enforceable and consistent across all apps. Plain CSS in component `<style>` blocks is an escape hatch, not a pattern.

---

## CLI

A simple CLI automates project setup:

```bash
pnpm create brewfolio my-site --type portfolio
```

The CLI creates an Astro project, installs `brewfolio`, `@keystatic/core`, and `@keystatic/astro`, copies a starter `keystatic.config.ts` that imports all collections, creates starter pages with appropriate layouts, and prints next steps. It is roughly 50 lines — file copying and dependency installation only.

---

## Why Keystatic

Keystatic was chosen over Tina CMS for these reasons:

| Requirement | Keystatic | Tina CMS |
|-------------|-----------|----------|
| Visual content editing | Yes | Yes |
| Same schema everywhere | Yes (exports schema) | No (content in Git) |
| Self-hosted | Yes (local files) | No (Git-required) |
| Section/component config | Yes (conditionals) | No (markdown-focused) |
| Schema = code (versionable) | Yes | No (CMS owns content) |
| Astro-native | Yes | Yes |
| Minimal setup | Yes | No (more complex) |

Keystatic wins because its schema is code (versionable, packageable), works with local files (no Git dependency), and has better structured data fields.

---

## Migration path

To migrate an existing repo to Brewfolio:

1. Install the `brewfolio` package
2. Replace local components and layouts with brewfolio imports
3. Wire up the Keystatic config (import collections from brewfolio or copy the schema)
4. Pages stay the same — use brewfolio layouts and components

There is no rush to migrate. The architecture decision is recorded. Work starts fresh in the new repo.

---

## Component inventory

This section documents all components and layouts extracted from `datascienceapps`, the canonical reference implementation, plus new components identified during app mapping.

### Layouts

| Layout | Purpose |
|--------|---------|
| DashboardLayout | Modal-nav, full dashboard grid. Renders ConceptsPane + ProjectsPane + WritingPane + GitHubPane + AnalysisPane in a 2-row grid. |
| AppLayout | Single-page layout with configurable section rendering. |
| GameLayout | Real-time interactive layout with a prominent leaderboard sidebar. Used for games and live events. |

### Portfolio components (from datascienceapps)

| Component | File | Purpose | Keystatic schema |
|-----------|------|---------|-----------------|
| Dashboard | Dashboard.astro | Grid orchestrator. Arranges 5 panes in a 2-row grid with concept filtering across all panes. | Renders all panes |
| ConceptsPane | ConceptsPane.astro | Concept filter list with editable intro copy. Clicking a concept highlights linked items across all panes. | `concepts` singleton |
| ProjectsPane | ProjectsPane.astro | Project tiles grid with status indicators, tags, and action links. | `projects` collection |
| WritingPane | WritingPane.astro | Substack post list with concept tags and a subscribe button. | `writing` collection |
| GitHubPane | GitHubPane.astro | Contribution grid (last 26 weeks) plus activity timeline with commits, repos, issues, and PRs. | `secrets` singleton |
| AnalysisPane | AnalysisPane.astro | Notebook list for the analysis section. | `notebooks` collection |
| ImpactShelf | ImpactShelf.astro | Sequential impact sections with a left-border accent treatment. | `impact` singleton |
| WorkTimeline | WorkTimeline.astro | Work and education timeline with expandable entries. | `timeline` singleton |
| ContentModal | ContentModal.astro | Full modal shell with titlebar, close button, scroll-spy TOC, and three size variants (default, medium, wide). | None (UI shell) |
| ModalSource | ModalSource.astro | Template marker for modal content extraction via `data-os15-modal-source` attributes. | None |
| NotebookSummaryCard | NotebookSummaryCard.astro | Card used in notebook catalog listing. | `notebooks` collection |
| ArticleTOC | ArticleTOC.astro | Table of contents with scroll spy and active link highlighting. | None |
| Breadcrumbs | Breadcrumbs.astro | Breadcrumb navigation for nested routes. | None |
| SearchOverlay | SearchOverlay.astro | Full-screen search overlay triggered by keyboard shortcut. | None |
| SearchData | SearchData.astro | Search index provider for the search overlay. | None |
| BaseHead | BaseHead.astro | HTML head with meta tags, Open Graph, and font loading. | None |
| HomeHeader | HomeHeader.astro | Home page header with navigation links and active route highlighting. | None |
| Header | layout/Header.astro | Site header with logo and nav. | None |
| Footer | layout/Footer.astro | Site footer. | None |
| Button | Button.astro | Reusable button component with multiple style variants. | None |
| ThemeProvider | ThemeProvider.astro | Theme context that manages dark and light mode. | `siteConfig` |
| MiniClockWeather | MiniClockWeather.astro | Clock and weather mini widget in the header. | `siteConfig` |

### Shared components (identified during app mapping)

| Component | File | Purpose |
|-----------|------|---------|
| StatsGrid | StatsGrid.astro | Grid of metric cards with value, label, and optional trend/delta. Variant: ComparisonGrid for A/B comparison. |
| StatusCard | StatusCard.astro | Single status indicator with label, value, and state color (green/red/yellow/gray). |
| ExecutionPanel | ExecutionPanel.astro | Real-time streaming panel for SSE or polling-based progress. Shows event stream, status indicators, and cancel control. |
| ActivityLog | ActivityLog.astro | Scrollable log of timestamped events with severity levels and collapsible entries. Shares infrastructure with ExecutionPanel. |
| DataTable | DataTable.astro | Sortable, filterable table with pagination. Used for run history, project lists, and leaderboards. |
| FilterBar | FilterBar.astro | Horizontal bar of toggleable filter chips with active state. Supports text search, signal filters, and status filters. |
| SettingsModal | SettingsModal.astro | Modal dialog for key-value settings with field types (text, URL, select, toggle). Triggers via gear icon in the header. |
| SetupWizard | SetupWizard.astro | Multi-step onboarding flow with step indicator, next/back navigation, and completion callback. Per-app steps injected as slots. |
| Leaderboard | Leaderboard.astro | Ranked list of participants with rank badge, score, and optional delta. |
| Timer | Timer.astro | Countdown or count-up timer with visual urgency states (normal, warning, critical). |
| ScoreDisplay | ScoreDisplay.astro | Points display with animation support (count-up on change). |

---

## App mapping

This section maps each existing app to a brewfolio layout and identifies which components it would inherit or need custom additions for. Backend architecture is not considered — the migration path is frontend-only.

### Layout assignments

| App | Framework | Layout | Inherited + shared | Custom additions |
|-----|-----------|--------|-------------------|------------------|
| **llm-bench** | React + Vite (`web/`) | AppLayout | StatsGrid, StatusCard, ExecutionPanel, DataTable, FilterBar, SettingsModal | Model status cards, benchmark execution panel, real-time SSE progress display |
| **quizzard** | Vite + TS (multi-page SPA) | GameLayout + AppLayout | Leaderboard, Timer, ScoreDisplay, SettingsModal | Landing page (join/host entry), host dashboard (QR, participant list, game controls), player view (name entry, answer buttons) |
| **sidequests** | Next.js App Router (SPA) | DashboardLayout | StatsBar, ProjectsPane, DataTable, FilterBar, SettingsModal, SetupWizard, ContentModal | Signal filters (CI, issues, uncommitted), activity log panel, onboarding diagnostics |
| **howiprompt** | Astro (`frontend/`) | DashboardLayout + AppLayout | StatsGrid, ExecutionPanel, SettingsModal, SetupWizard, ContentModal, Leaderboard | Wrapped scroll-through, linguistics grid, create view modal |
| **ab-simulator** | Astro | DashboardLayout + AppLayout | StatsGrid (variant comparison), Leaderboard, ExecutionPanel, ContentModal | Game grid, variant comparison cards, real-time Supabase dashboard, Leaflet map, funnel/distribution charts |

### Layout mapping rationale

**DashboardLayout** fits apps that show a multi-pane dashboard with filtering across content types: llm-bench (stats grid + recent runs), sidequests (project list + stats bar + slide-over), howiprompt (left panel + right player card), ab-simulator (live dashboard + game).

**AppLayout** fits single-page or section-sequential experiences: llm-bench /run and /results, howiprompt /wrapped and /linguistics, ab-simulator /analysis, quizzard /index and /play.

**GameLayout** fits real-time interactive apps with a prominent leaderboard: quizzard /host (host dashboard with participant controls + leaderboard).

---

## Consolidations

These are new components to build into the brewfolio package that cover gaps across multiple apps. The goal is to minimize app-specific code while respecting what is genuinely bespoke per app.

### Reusable components to build

| Component | Used by | Purpose |
|-----------|---------|---------|
| StatsGrid | llm-bench, howiprompt, ab-simulator | Grid of metric cards (count, label, optional delta/trend). Variant: ComparisonGrid for A/B variant comparison. |
| StatusCard | llm-bench, sidequests | Single status indicator with label, value, and state color (green/red/yellow/gray). Backend status at a glance. |
| ExecutionPanel | llm-bench, sidequests, howiprompt | Real-time streaming panel for SSE or polling-based progress. Shows event stream, status indicators, cancel control. |
| ActivityLog | llm-bench, sidequests | Scrollable log of events with timestamps, severity levels, and collapsible entries. Shares infrastructure with ExecutionPanel. |
| DataTable | llm-bench, sidequests | Sortable, filterable table with pagination. Used for run history and project lists. |
| FilterBar | llm-bench, sidequests | Horizontal bar of toggleable filter chips with active state. |
| SettingsModal | sidequests, howiprompt | Modal dialog for key-value settings with field types (text, select, toggle). Triggers on gear icon in header. |
| SetupWizard | sidequests, howiprompt | Multi-step onboarding flow with step indicator, next/back navigation, and completion callback. Per-app steps injected as slots. |
| Leaderboard | howiprompt, ab-simulator, quizzard | Ranked list of participants with score, rank badge, and optional delta. |
| Timer | quizzard, ab-simulator | Countdown or count-up timer with visual urgency states (normal, warning, critical). |
| ScoreDisplay | quizzard, ab-simulator | Points display with animation support (count-up on change). |

### SettingsModal behavior

Both sidequests and howiprompt have a settings modal accessible from the header. The reusable SettingsModal should support trigger via gear icon in the site header, field types (text input, URL input, select dropdown, toggle switch), save/cancel actions, optional field validation feedback, and per-app settings schema injected as a slot. This means the Header component needs a standardized settings trigger slot.

### App-specific components (keep custom)

These are core to the app's identity and should not be forced into the reusable layer:

| Component | App | Reason |
|-----------|-----|--------|
| Game grid (memory puzzle) | ab-simulator | Game mechanics are bespoke |
| Leaflet map | ab-simulator | Geographic visualization specific to experiment data |
| Funnel / distribution charts | ab-simulator | Statistical visualizations tied to A/B testing |
| Wrapped scroll-through | howiprompt | Bespoke scroll animation and storytelling layout |
| Linguistics analysis grid | howiprompt | Custom analysis cards specific to language metrics |
| Create custom view modal | howiprompt | App-specific view builder |
| Signal filters (CI, issues) | sidequests | GitHub-specific scanning signals |
| Onboarding diagnostics | sidequests | App-specific system checks |
| Participant list | quizzard | Real-time quiz participant tracking |
| QR code generator | quizzard | Quiz join code display |
| Question display + answer buttons | quizzard | Quiz gameplay UI |

---

## Open questions

- The `sections` singleton (for AppLayout section ordering) is documented in the architecture but was not yet implemented in `datascienceapps`. The schema design for this singleton needs to be defined.

---

## History

### Previous approach (now discarded)

The original `brewfolio` repo (now `brewfolio-deprecated`) attempted to build factory functions on top of Keystatic (547 lines of abstraction), create separate contract systems (portfolio vs app) with different schema bundles, and implement a complex CLI scaffolding with template variants. This was over-engineered — the abstraction layer added complexity without solving a real problem.

**What was discarded:**
- Factory functions in `packages/brewfolio/keystatic/index.ts` (547 lines)
- Separate contract bundles (portfolioContent, appContent, etc.)
- Complex template scaffolding system
- Multi-phase implementation plan with 12+ phases

**What stays:**
- All components (GitHubPane, ProjectDrawer, MetricsGrid, etc.)
- Layouts (DashboardLayout, AppLayout)
- Tokens (tokens.css)
- Notebook rendering pipeline
- Content loading utilities
- The Keystatic schema itself (simplified, no factories)
