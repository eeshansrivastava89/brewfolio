# create-brewfolio

Scaffold a new Astro project with `brewfolio` pre-configured.

## Usage

```bash
npx create-brewfolio my-site
```

This will:
1. Scaffold a minimal Astro project in `my-site/`
2. Install `brewfolio`, `@keystatic/core`, `@keystatic/astro`, `tailwindcss`, `react`, `react-dom`
3. Copy the starter template (`keystatic.config.ts`, `astro.config.mjs`, `global.css`, `index.astro`)
4. Print next steps

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --template <name>` | Astro project template | `minimal` |
| `-d, --dry-run` | Print what would be done without doing it | `false` |
| `-l, --local-brewfolio <path>` | Path to local brewfolio tarball (for testing before npm publish) | npm registry |

## Templates

Any Astro project template is supported:

```bash
npx create-brewfolio my-site --template blog
npx create-brewfolio my-site --template portfolio
```

## What gets installed

- `brewfolio` — the design system package
- `@keystatic/core` — CMS core
- `@keystatic/astro` — Astro integration
- `tailwindcss` + `@tailwindcss/vite` — CSS framework
- `react` + `react-dom` — required peer deps

## Starter template files

After scaffolding, your project will have:

```
my-site/
├── src/
│   ├── pages/
│   │   └── index.astro     ← uses AppLayout + sections singleton
│   └── styles/
│       └── global.css       ← imports tokens.css + tailwind base
├── keystatic.config.ts      ← re-exports brewfolio schema + sections singleton
├── astro.config.mjs         ← includes @keystatic/astro + @tailwindcss/vite
└── tailwind.config.js
```

## Customising

Replace or extend any part of the `keystatic.config.ts` — the `sections` singleton from brewfolio is already wired up and ready to use.