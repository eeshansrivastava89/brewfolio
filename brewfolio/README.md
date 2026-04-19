<div align="center">

# brewfolio

**The shared Astro package behind my portfolio at
[eeshans.com](https://eeshans.com), turned into a reusable theme system for
portfolios and apps.**

[![npm](https://img.shields.io/npm/v/brewfolio)](https://www.npmjs.com/package/brewfolio)
[![license](https://img.shields.io/github/license/eeshansrivastava89/brewfolio)](../LICENSE)
[![astro](https://img.shields.io/badge/astro-5.x-ff5d01)](https://astro.build)
[![cms](https://img.shields.io/badge/CMS-Keystatic-6e56cf)](https://keystatic.com)
[![site](https://img.shields.io/badge/example-eeshans.com-cb9f6a)](https://eeshans.com)

[Scaffold a site](https://www.npmjs.com/package/create-brewfolio) •
[Source repo](https://github.com/eeshansrivastava89/brewfolio) •
[Live portfolio](https://eeshans.com)

</div>

## Why this package exists

I spent a lot of time building my own portfolio design in Astro: the dashboard
shell, modal reading flow, notebook rendering, project drawer, GitHub pane, and
Keystatic editing model. `brewfolio` packages that work into a reusable runtime
so I can reuse it across my own projects and make it available for other people
to build on.

This package is the shared runtime. If you want the easiest path, use
`create-brewfolio`.

```bash
npx create-brewfolio
```

## What ships in the package

`brewfolio` currently supports two layouts:

- `DashboardLayout` for portfolio sites
- `AppLayout` for tools, dashboards, and landing pages

It also ships:

- shared header and footer
- modal shell and modal runtime
- notebook loading and rendering helpers
- GitHub helpers
- shared design tokens
- shared Keystatic schema primitives

## Install manually

If you want to wire the package into your own Astro app directly:

```bash
npm install brewfolio @keystatic/core @keystatic/astro @astrojs/react react react-dom tailwindcss @tailwindcss/vite --legacy-peer-deps
```

## Use it

### Re-export the schema

```ts
import { config } from '@keystatic/core'
import { collections, singletons } from 'brewfolio/keystatic.config'

export default config({
  storage: { kind: 'local' },
  collections,
  singletons,
})
```

### Use a layout

```astro
---
import DashboardLayout from 'brewfolio/layouts/DashboardLayout.astro'
---

<DashboardLayout meta={{ title: 'My portfolio' }}>
  {/* your page */}
</DashboardLayout>
```

### Import the tokens

```css
@import 'tailwindcss';
@source '../../node_modules/brewfolio/src/**/*.{astro,ts,js,tsx,jsx}';
@import 'brewfolio/styles/tokens.css';
```

## Scope

The package is intentionally narrower than it was during the experimental
phases. It only keeps the surfaces that are part of the supported product. The
old game layout and the unused generic widget layer were removed instead of
being preserved as dead package weight.

## License

[MIT](../LICENSE)
