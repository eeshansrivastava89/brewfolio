# brewfolio

`brewfolio` is the shared Astro package behind the `create-brewfolio`
scaffolder. It ships the supported layouts, reusable UI primitives, design
tokens, notebook rendering helpers, and the shared Keystatic schema used by the
generated sites.

The fastest way to start a new site is the published scaffolder:

```bash
npx create-brewfolio my-site
```

It picks a site type, installs this package, and wires up the CMS for you.

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

The package currently supports two layouts.

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

Import the shared pieces you actually need.

```astro
---
import ProjectsPane from 'brewfolio/components/ProjectsPane.astro'
import AnalysisPane from 'brewfolio/components/AnalysisPane.astro'
---
```

### Design tokens (CSS)

Import the package tokens and point Tailwind at the package source.

In your `src/styles/global.css`:

```css
@import 'tailwindcss';
@source '../../node_modules/brewfolio/src/**/*.{astro,ts,js,tsx,jsx}';
@import 'brewfolio/styles/tokens.css';
```

## What's inside

The package is intentionally narrower than it was earlier in the project. It
only includes the surfaces that are still part of the supported product.

- **Layouts** — `DashboardLayout` and `AppLayout`
- **Portfolio primitives** — `Dashboard`, `ConceptsPane`, `ProjectsPane`,
  `WritingPane`, `AnalysisPane`, `GitHubPane`, `WorkTimeline`, and
  `ImpactShelf`
- **Shared primitives** — `Header`, `Footer`, `ContentModal`,
  `NotebookSummaryCard`, `ArticleTOC`, `GitHubTimeline`, `ModalRuntime`, and
  `ModalSource`
- **Shared lib helpers** — GitHub fetchers, notebook loaders and renderers,
  TOC extraction, and header resolution
- **Shared schema** — collection and singleton primitives used by the
  scaffolds

## Scope

This package no longer includes the earlier experimental game layout or the old
generic shared app widgets that were never adopted by the real scaffolds. The
goal is to keep the package aligned with the actual supported product rather
than preserving unused abstractions.

## License

MIT
