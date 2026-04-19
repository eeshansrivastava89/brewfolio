# brewfolio

A CMS-driven design system for Astro. Ships two layouts (Dashboard and App),
plus a library of pre-built components, design tokens, and a full Keystatic
schema so the admin UI is populated out of the box.

The fastest way to start a new brewfolio site is the scaffolder:

```bash
npx create-brewfolio my-site
```

…which picks a site type, installs this package, and wires up the CMS for you.

## Install manually

```bash
npm install brewfolio @keystatic/core @keystatic/astro @astrojs/react react react-dom tailwindcss @tailwindcss/vite --legacy-peer-deps
```

## Use

### Keystatic schema

Re-export the full schema in your project's `keystatic.config.ts`:

```ts
import { config } from '@keystatic/core'
import { collections, singletons } from 'brewfolio/keystatic.config'

export default config({
  storage: { kind: 'local' },
  collections,
  singletons
})
```

### Layouts

```astro
---
import DashboardLayout from 'brewfolio/layouts/DashboardLayout.astro'
// or AppLayout
---
<DashboardLayout meta={{ title: 'My Portfolio' }}>
  {/* your content */}
</DashboardLayout>
```

### Components

```astro
---
import ProjectsPane from 'brewfolio/components/ProjectsPane.astro'
import AnalysisPane from 'brewfolio/components/AnalysisPane.astro'
---
```

### Design tokens (CSS)

In your `src/styles/global.css`:

```css
@import 'tailwindcss';
@source '../../node_modules/brewfolio/src/**/*.{astro,ts,js,tsx,jsx}';
@import 'brewfolio/styles/tokens.css';
```

## What's inside

- **2 layouts** — Dashboard (5-pane grid) and App (section-driven with optional notebook-backed analysis routes)
- **Portfolio components** — ConceptsPane, ProjectsPane, WritingPane, AnalysisPane, GitHubPane, WorkTimeline, ImpactShelf, ContentModal, and more
- **Shared components** — Header, Footer, ContentModal, NotebookSummaryCard, ArticleTOC, GitHubTimeline
- **Keystatic schema** — `projects`, `writing`, `notebooks` collections; `concepts`, `timeline`, `about`, `impact`, `siteConfig`, `sections`, `secrets` singletons

## License

MIT
