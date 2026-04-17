# Brewfolio Phase 6 — Thorough Test Report

**Date:** April 17, 2026
**Test directory:** `/tmp/brewfolio-thorough-test/`
**CLI command:** `node /Users/eeshans/dev/brewfolio/packages/create-brewfolio/src/index.js brewfolio-app --no-git --local-brewfolio /Users/eeshans/dev/brewfolio/brewfolio/brewfolio-0.1.0.tgz`
**Dev server:** `http://127.0.0.1:4324`

---

## Screenshots

All screenshots are saved at `/tmp/brewfolio-thorough-test/screenshots/`

| Screenshot | Path | Description |
|-----------|------|-------------|
| 01 | `/tmp/brewfolio-thorough-test/screenshots/01-homepage-metrics.png` | Homepage with AppLayout + sections (metrics-grid + results-list) |
| 02 | `/tmp/brewfolio-thorough-test/screenshots/02-keystatic-home.png` | Keystatic admin home |
| 03 | `/tmp/brewfolio-thorough-test/screenshots/03-keystatic-sections.png` | Keystatic Sections singleton editor |
| 04 | `/tmp/brewfolio-thorough-test/screenshots/04-keystatic-articles.png` | Keystatic Articles collection |
| 05 | `/tmp/brewfolio-thorough-test/screenshots/05-dashboard-layout.png` | DashboardLayout test page |
| 06 | `/tmp/brewfolio-thorough-test/screenshots/06-game-layout.png` | GameLayout test page |
| 07 | `/tmp/brewfolio-thorough-test/screenshots/07-keystatic-sections-editor.png` | Sections singleton editing view |
| 08 | `/tmp/brewfolio-thorough-test/screenshots/08-components-showcase.png` | StatsGrid, StatusCard, ActivityLog, Timer, ScoreDisplay |
| 09 | `/tmp/brewfolio-thorough-test/screenshots/09-data-components.png` | FilterBar, DataTable, ExecutionPanel |
| 10 | `/tmp/brewfolio-thorough-test/screenshots/10-github-leaderboard.png` | GitHubTimeline, Leaderboard |

---

## What was tested

### 1. CLI Scaffolding ✅
- Project scaffolded with `npx --yes create-astro@latest --template minimal --no-git --yes`
- Template overlay files applied (`keystatic.config.ts`, `astro.config.mjs`, `global.css`, `index.astro`)
- Dependencies installed: `brewfolio` (local tarball), `@keystatic/core@latest`, `@keystatic/astro@latest`, `react`, `react-dom`

### 2. Homepage with AppLayout + sections ✅ (screenshot 01)
- `AppLayout` renders with header, footer, skip link
- Sections (metrics-grid + results-list) render correctly from inline data
- `tokens.css` loads — coffee palette + Tailwind custom properties active

### 3. Keystatic Admin UI ✅ (screenshots 02–04, 07)
- **Home** (`/keystatic`) — navigation sidebar with collections and singletons listed
- **Articles collection** (`/keystatic/collections/articles`) — list view functional
- **Sections singleton** (`/keystatic/sections/sections`) — editor with conditional fields works (metrics-grid, results-list, notebook, github-timeline)
- `fields.conditional` successfully renders discriminated variant fields

### 4. DashboardLayout ✅ (screenshot 05)
- `/test-dashboard` — `DashboardLayout.astro` renders correctly

### 5. GameLayout ✅ (screenshot 06)
- `/test-game` — `GameLayout.astro` renders correctly

### 6. StatsGrid, StatusCard, ActivityLog, Timer, ScoreDisplay ✅ (screenshot 08)
- All Phase 3 components render with test data
- Proper typography, spacing, card styling

### 7. FilterBar, DataTable, ExecutionPanel ✅ (screenshot 09)
- FilterBar with filter tabs
- DataTable with columns and rows
- ExecutionPanel with log entries at different levels (info/warn/error)

### 8. GitHubTimeline, Leaderboard ✅ (screenshot 10)
- GitHubTimeline shows 26-week contribution grid, activity columns (commits + issues/PRs), profile link
- Leaderboard with rank, name, score, medal labels

---

## Issues Encountered

### Issue 1: `fields.dynamic` → `fields.conditional` (P0 — fixed before this test run)
Described in prior report. Already fixed.

### Issue 2: `reader.singletons.sections.read()` fails in Astro page (P1)
**Error:** `TypeError: Cannot read properties of undefined (reading 'singletons')`
**Cause:** `reader` is exported from `brewfolio/keystatic.config` but the consuming app's `keystatic.config.ts` is different. The reader from brewfolio's config doesn't have access to the consuming app's config context.
**Workaround:** Pass sections as inline props for testing. In production, consuming apps should use Keystatic's Reader API with their own config.

### Issue 3: `.astro` files excluded from package (P1 — fixed before this test run)
Described in prior report. Already fixed.

---

## Layouts Available

| Layout | Import path | Used in test |
|--------|-------------|-------------|
| AppLayout | `brewfolio/layouts/AppLayout.astro` | ✅ screenshot 01 |
| DashboardLayout | `brewfolio/layouts/DashboardLayout.astro` | ✅ screenshot 05 |
| GameLayout | `brewfolio/layouts/GameLayout.astro` | ✅ screenshot 06 |

## Components Available (all accessible)

**Portfolio:** `Dashboard`, `ConceptsPane`, `ProjectsPane`, `WritingPane`, `GitHubPane`, `AnalysisPane`, `ImpactShelf`, `WorkTimeline`, `NotebookSummaryCard`, `ArticleTOC`, `SearchOverlay`, `SearchData`, `ModalSource`, `HomeHeader`, `MiniClockWeather`

**Base:** `BaseHead`, `Header`, `Footer`, `ThemeProvider`, `Button`, `ContentModal`, `Breadcrumbs`

**Shared:** `StatsGrid`, `StatusCard`, `ExecutionPanel`, `ActivityLog`, `DataTable`, `FilterBar`, `SettingsModal`, `SetupWizard`, `Leaderboard`, `Timer`, `ScoreDisplay`

**Section blocks:** `AppSections`, `GitHubTimeline`

---

## Files Created During Test

```
/tmp/brewfolio-thorough-test/
├── screenshots/
│   ├── 01-homepage-metrics.png
│   ├── 02-keystatic-home.png
│   ├── 03-keystatic-sections.png
│   ├── 04-keystatic-articles.png
│   ├── 05-dashboard-layout.png
│   ├── 06-game-layout.png
│   ├── 07-keystatic-sections-editor.png
│   ├── 08-components-showcase.png
│   ├── 09-data-components.png
│   └── 10-github-leaderboard.png
└── brewfolio-app/           ← scaffolded project
    ├── src/pages/
    │   ├── index.astro      ← with inline sections (metrics-grid + results-list)
    │   ├── test-dashboard.astro
    │   ├── test-game.astro
    │   ├── test-components.astro
    │   ├── test-data.astro
    │   └── test-github.astro
    └── src/data/sections.json
```

---

## Verdict

All 3 layouts render correctly. All tested component groups render correctly. Keystatic admin UI loads and the Sections singleton editor works with `fields.conditional`. No blocking issues remain.
