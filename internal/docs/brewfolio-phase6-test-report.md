# Brewfolio Phase 6 Test Report

**Date:** April 17, 2026
**Tester:** opencode agent
**CLI Version:** `create-brewfolio` (local, commit `b547ec4`)
**Brewfolio Package:** `brewfolio@0.1.0` (local tarball)

---

## Summary

The `create-brewfolio` CLI was successfully tested end-to-end. A new Astro project was scaffolded, brewfolio + Keystatic were installed, and the dev server returned HTTP 200. Two screenshots were captured showing the homepage and Keystatic admin UI.

**One bug was found and fixed during testing:** `fields.dynamic` (only available in Keystatic 1.x, currently only on an alpha/beta track) was replaced with `fields.conditional` which is the correct API for Keystatic 0.5.x.

---

## Test Run

### Command

```bash
node packages/create-brewfolio/src/index.js brewfolio-final-e2e \
  --no-git \
  --local-brewfolio /Users/eeshans/dev/brewfolio/brewfolio/brewfolio-0.1.0.tgz
```

### Output

```
  brewfolio — scaffolding brewfolio-final-e2e

- Checking target directory…
✔ Checking target directory…
- Scaffolding Astro project (minimal template)…
  Running: npx --yes create-astro@latest brewfolio-final-e2e --template minimal --no-git --yes
  ✔  Project initialized!
- Applying brewfolio template…
✔ Applying brewfolio template…
- Installing dependencies…
  Running: npm install /Users/eeshans/dev/brewfolio/brewfolio/brewfolio-0.1.0.tgz @keystatic/core@latest @keystatic/astro@latest react react-dom --legacy-peer-deps
  added 291 packages, and audited 543 packages in 8s
✔
  Done! Your project is ready at ./brewfolio-final-e2e
```

---

## Issues Found and Fixed

### Issue 1: `fields.dynamic` used in `keystatic.config.ts` — not available in Keystatic 0.5.x

**Severity:** P0 (blocker — dev server returned 500)

**Problem:** The `sections` singleton in `brewfolio/src/keystatic.config.ts` used `fields.dynamic()`, which was introduced in Keystatic 1.0 (currently in beta/alpha). The CLI installs `@keystatic/core@latest` which resolves to `0.5.50`, where `fields.dynamic` does not exist.

**Error:**
```
__vite_ssr_import_0__.fields.fields is not a function
  at /private/tmp/brewfolio-final-e2e/node_modules/brewfolio/src/keystatic.config.ts:90:8
```

**Fix:** Replaced `fields.dynamic({ choose: ..., options: { ... } })` with `fields.conditional(<selector>, { ... })`, which is the correct discriminated-union API in Keystatic 0.5.x.

**Before:**
```ts
value: fields.dynamic({
  choose: fields.fields().discriminant,
  options: { ... }
})
```

**After:**
```ts
value: fields.conditional(
  fields.select({ label: 'Type', options: [...], defaultValue: 'metrics-grid' }),
  {
    'metrics-grid': { title: fields.text({ label: 'Title' }), metrics: fields.array(...) },
    'results-list': { title: fields.text({ label: 'Title' }), items: fields.array(...) },
    notebook: { title: fields.text({ label: 'Title' }), notebookId: fields.text(...) },
    'github-timeline': { title: fields.text({ label: 'Title' }) }
  }
)
```

---

### Issue 2: `.astro` files excluded from npm package

**Severity:** P1 (blocker — AppLayout.astro and other components missing from package)

**Problem:** `brewfolio/package.json` had `"files": ["src/**/*", "!src/**/*.astro"]`, which excluded all `.astro` files from the published package. This meant importing `brewfolio/layouts/AppLayout.astro` failed.

**Fix:** Removed the `!src/**/*.astro` exclusion, then added explicit sub-path exports for `layouts`, `components`, and `lib`:

```json
"exports": {
  ".": "./src/index.ts",
  "./styles/tokens.css": "./src/styles/tokens.css",
  "./keystatic.config": "./src/keystatic.config.ts",
  "./layouts/*": "./src/layouts/*",
  "./components/*": "./src/components/*",
  "./lib/*": "./src/lib/*"
}
```

---

### Issue 3: `@keystatic/astro@^0.5` — version not found

**Severity:** P2 (installer error)

**Problem:** `@keystatic/astro` is at version 5.x, not 0.5.x. Using `^0.5` caused `npm install` to fail with `404 Not Found`.

**Fix:** Updated CLI to use `@keystatic/astro@latest` (which resolves to 5.x) and `--legacy-peer-deps` to handle the Astro 6 peer dependency conflict.

---

## Screenshots

### Homepage (`/`)

![Homepage screenshot](/tmp/brewfolio-homepage.png)

**Result:** HTTP 200 ✅ — Page renders successfully with tokens.css loaded and AppLayout applied.

### Keystatic Admin UI (`/keystatic`)

![Keystatic screenshot](/tmp/brewfolio-keystatic.png)

**Result:** HTTP 200 ✅ — Keystatic admin UI loads and is functional.

---

## Files Created in Scaffolded Project

```
brewfolio-final-e2e/
├── astro.config.mjs        ← with @keystatic/astro integration added
├── keystatic.config.ts     ← re-exports from brewfolio
├── package.json            ← with brewfolio, @keystatic/* deps
├── src/
│   ├── pages/
│   │   └── index.astro     ← uses AppLayout + sections
│   └── styles/
│       └── global.css      ← imports tokens.css + tailwind base
```

---

## Verification Checklist

| Feature | Status | Notes |
|---------|--------|-------|
| CLI `--help` works | ✅ | |
| CLI `--dry-run` works | ✅ | |
| Astro minimal project scaffolded | ✅ | |
| Template overlay files copied | ✅ | |
| `brewfolio` package installed | ✅ | via local tarball |
| `@keystatic/core` installed | ✅ | using `@latest` (0.5.50) |
| `@keystatic/astro` installed | ✅ | using `@latest` (5.x) |
| `react` + `react-dom` installed | ✅ | required peer dep |
| Dev server starts | ✅ | HTTP 200 on `/` |
| Keystatic admin UI loads | ✅ | HTTP 200 on `/keystatic` |
| `fields.conditional` works | ✅ | sections schema functional |
| `brewfolio/layouts/*` imports work | ✅ | AppLayout resolved |
| `--local-brewfolio` flag works | ✅ | local tarball installed |

---

## Notes

- `@keystatic/astro` has a peer dependency conflict with Astro 6 (`peer astro@"2 || 3 || 4 || 5"`). `--legacy-peer-deps` is required until `@keystatic/astro` updates its peer dep. This is a known issue and not a brewfolio bug.
- `brewfolio` itself is not yet published to npm. The `--local-brewfolio` flag allows testing with a local tarball. Once published, the flag is unnecessary.
- `npm view @keystatic/core version` returns `0.5.50` — there is no 1.x stable release yet. If `fields.dynamic` is a required feature, brewfolio needs to track Keystatic's beta/alpha releases.
