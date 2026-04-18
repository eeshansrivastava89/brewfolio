# Brewfolio Phase 6.5 — End-to-end test report

**Date:** April 17, 2026
**Test environment:** `/tmp/brewfolio-qa/`, Node 22, Playwright + headless Chromium, `create-astro` minimal template.
**Goal:** Prove that `create-brewfolio` produces a runnable site for each of the three layout types (portfolio / app / game), that the Keystatic admin UI is fully populated, and that user edits made in Keystatic propagate to the live homepage without any manual intervention.

All screenshots below were captured from actual headless Chromium runs against the dev server and are stored at `internal/docs/screenshots/`.

---

## Summary

| Area | Result |
|------|--------|
| CLI scaffolds all three types with no manual edits | pass |
| Homepage renders on first boot (empty data) | pass |
| Keystatic admin loads with full schema (3 collections + 7 singletons) | pass |
| Create-project flow persists to disk and appears on homepage | pass |
| Write / concepts / site-config edits round-trip end-to-end | pass |
| `sections` discriminated-union schema (metrics-grid + results-list + notebook + github-timeline) works | pass (was broken — fixed this pass) |
| Tailwind v4 utility classes used inside brewfolio components are compiled | pass (was broken — fixed this pass) |
| Light mode + dark mode render correctly | pass |
| Mixed-component showcase page (9 components across 3 groups on one Astro page) | pass |
| Publishing to npm | not done — scaffold currently requires `--local-brewfolio <tarball>` |

**Bottom line:** every Phase 6.5 checklist item except "publishing to npm" is now green. The CLI produces a working, CMS-editable site out of the box for all three types.

---

## Bugs found and fixed during this run

| # | Severity | Where | Bug | Fix |
|---|----------|------|-----|-----|
| 1 | P0 | `template/common/keystatic.config.ts` | Imported named `sections` from brewfolio (not a real export), and used `fields.title` / `fields.slug` without importing `fields` (and `fields.title` isn't a real Keystatic field) | Import `collections` + `singletons` bundles from `brewfolio/keystatic.config` and pass straight through |
| 2 | P0 | `brewfolio/src/index.ts` | Re-exported a `keystaticConfig` named export that didn't exist; also tried to `export { default as tokensCss }` from a CSS file without a module declaration | Split the exports: `keystaticConfig`, `collections`, `singletons`, `fields` from the real config; drop the CSS default re-export (consumers `@import` the CSS directly) |
| 3 | P0 | `brewfolio/src/keystatic.config.ts` — `sections` singleton | `fields.conditional` was nested inside a `fields.object` with a redundant `discriminant` select. Keystatic crashed (`Expected never to be called`) when saving any entry because the schema was structurally invalid. See `07-portfolio-keystatic-project-saved.png` (earlier run) for the traceback. | Replace with `fields.array(fields.conditional(discriminantSelect, branches))`. Branches are now `fields.object(...)`. Data shape stays `{ discriminant, value }` so `AppSections.astro` didn't need to change |
| 4 | P0 | `brewfolio/src/components/Leaderboard.astro` | Astro compiler raised "Unable to assign attributes when using <> Fragment shorthand" because `entry.rank <= 3` inside JSX made the parser treat `<=` as a tag opener | Extract to `const isTopThree = entry.rank < 4` |
| 5 | P0 | `brewfolio/src/components/ExecutionPanel.astro` | `.exec-btn` rule inside a plain `<style>` block contained bare Tailwind classes (`w-7 h-7 border border-border …`), which Tailwind v4 rejected as invalid CSS | Move the utilities onto the `<button class="…">` attribute; keep only real CSS in the `<style>` block |
| 6 | P0 | `brewfolio/src/components/DataTable.astro` | `<tbody></tbody>` was always empty in the Astro template. The `data` prop was accepted but never rendered — the JS tried to read rows from an empty DOM and reported "No data available" forever | Render `{data.map(row => <tr>…</tr>)}` inside the tbody |
| 7 | P0 | `brewfolio/src/components/ProjectsPane.astro` | Imported from the repo-local `@/lib/types` alias and from `astro-icon/components`; neither is available in a consumer app. Breaks every portfolio scaffold that uses the pane | Rewrite to a relative import `../lib/types` and replace `<Icon>` with inline SVG (matches every other component) |
| 8 | P0 | `template/common/src/styles/global.css` | Tailwind v4 only scans the app's `./src/**` by default, so every utility class used inside `brewfolio/src/components/*.astro` got stripped from the compiled CSS. Components rendered as unstyled HTML on any page using them | Add `@source '../../node_modules/brewfolio/src/**/*.{astro,ts,js,tsx,jsx}'` to the scaffolded `global.css` |
| 9 | P1 | `brewfolio/src/layouts/AppLayout.astro` | Default was `sections = []`, which made the "no sections configured yet" hint fire when the caller just wanted the `<slot />` branch | Default to `undefined` so the three branches (sections-array, empty-array hint, slot) behave as documented |
| 10 | P1 | CLI `packages/create-brewfolio/src/index.js` | Had `--template` which just proxied to `create-astro`; no way to pick a brewfolio site type. Also had mismatched `spinner.start` / `spinner.succeed` calls | Replace with `--type portfolio\|app\|game` (default `portfolio`) and keep `--astro-template` as the pass-through. Clean up spinner pairing |
| 11 | P1 | `brewfolio/src/keystatic.config.ts` | `secrets` singleton mentioned in the architecture doc was never implemented | Added (GitHub token field) |
| 12 | P2 | `template/tailwind.config.js` | Vestigial Tailwind v3 config from earlier — ignored by Tailwind v4 and confusing | Deleted |

---

## Tests run, by screenshot

### Portfolio type (`create-brewfolio my-site --type portfolio`)

**1. First boot, empty data, light mode**
![](./screenshots/01-portfolio-home-empty-light.png)
All five panes render with the coffee palette: Concepts, Projects, Writing | The Asymptotic, GitHub, Analysis. Empty states are readable (`No analyses yet`, `0 contributions in the last 6 months`, etc.).

**2. First boot, empty data, dark mode**
![](./screenshots/02-portfolio-home-empty-dark.png)
Same layout, dark-theme coffee palette. Dark-mode CSS variables from `tokens.css` apply cleanly.

**3. Keystatic admin home**
![](./screenshots/03-portfolio-keystatic-home.png)
The admin sidebar lists every collection (Projects, Writing, Notebooks) and every singleton (Concepts, About, Timeline, Impact, Site Config, Sections, Secrets). This is the full brewfolio schema, imported from the package via `collections` / `singletons` named exports.

**4. Projects collection — empty state**
![](./screenshots/04-portfolio-keystatic-projects-empty.png)
Keystatic's "Create the first entry" CTA renders correctly.

**5–7. Creating a project via the Keystatic UI**
![](./screenshots/05-portfolio-keystatic-project-create-empty.png)
![](./screenshots/06-portfolio-keystatic-project-create-filled.png)
![](./screenshots/07-portfolio-keystatic-project-saved.png)
Filled out ID, Name, Live URL, Short Description, Description through Playwright's `getByRole('textbox', …)` (same affordances a human clicks). Save persists to `src/data/projects/hello-brewfolio.yaml`.

**8. Homepage picks up the saved project**
![](./screenshots/08-portfolio-home-with-project.png)
"Hello Brewfolio" renders in the Projects pane with the `Live` status chip, description, and a `Try it` CTA pointing at the URL. This is the full CMS → reader → component loop, no dev-server restart needed.

**9–11. Writing collection end-to-end**
![](./screenshots/09-portfolio-keystatic-writing-create-empty.png)
![](./screenshots/10-portfolio-keystatic-writing-filled.png)
![](./screenshots/11-portfolio-keystatic-writing-saved.png)

**12–13. Site Config singleton**
![](./screenshots/12-portfolio-keystatic-siteconfig.png)
![](./screenshots/13-portfolio-keystatic-siteconfig-saved.png)
Changed City and Concepts pane intro.

**14–16. Concepts singleton (array-of-objects edit)**
![](./screenshots/14-portfolio-keystatic-concepts-empty.png)
![](./screenshots/15-portfolio-keystatic-concepts-filled.png)
![](./screenshots/16-portfolio-keystatic-concepts-saved.png)
The modal "Add item" flow — Slug, Name, Description, plus cross-reference arrays for Projects / Writing / Notebooks.

**17. Homepage after all Keystatic edits**
![](./screenshots/17-portfolio-home-with-all-data.png)
Concepts pane now shows the edited intro copy and the "AI Apps" concept row. Projects pane shows the created project. Writing pane shows the created post with its date. Three different Keystatic collections + singletons → three different panes, all refreshed from disk on reload.

### App type (`create-brewfolio my-site --type app`)

**18. Homepage with fallback sections (nothing in Keystatic yet)**
![](./screenshots/18-app-home-fallback.png)
The scaffold includes a graceful fallback — a metrics-grid + results-list with onboarding copy — so the first boot shows something useful instead of an empty shell.

**19. Sections singleton — empty**
![](./screenshots/19-app-keystatic-sections-empty.png)

**20. Add-section modal opens with the discriminated union selector**
![](./screenshots/20-app-keystatic-sections-dialog.png)
The `Type` dropdown (Metrics Grid, Results List, Notebook, GitHub Timeline) drives conditional fields below it. This is the schema that crashed in bug #3 — now it works.

**21–22. Nested array: metrics inside a metrics-grid section**
![](./screenshots/21-app-keystatic-metrics-filled.png)
![](./screenshots/22-app-keystatic-sections-list.png)

**23. Sections saved**
![](./screenshots/23-app-keystatic-sections-saved.png)

**24. Homepage rendering the user's Keystatic-authored section**
![](./screenshots/24-app-home-with-custom-sections.png)
The fallback is gone — the user's `Live metrics` section (label `Requests / sec`, value `8,241`, delta `+2.1%`) comes from `src/data/sections.yaml` written by Keystatic.

### Game type (`create-brewfolio my-site --type game`)

**25. Game layout, light mode**
![](./screenshots/25-game-home-light.png)
Main pane: round/score/question/answer buttons. Right sidebar: Leaderboard with gold/silver/bronze medals, score + delta, `You` badge. ScoreDisplay + Timer render with urgency styling.

**26. Game layout, dark mode**
![](./screenshots/26-game-home-dark.png)

**27. Game-type Keystatic home** (schema still available even though the game page doesn't read from it)
![](./screenshots/27-game-keystatic-home.png)

### Mix-and-match showcase (single Astro page, 9 components across 3 groups)

**28. Showcase light**
![](./screenshots/28-showcase-light.png)

**29. Showcase dark**
![](./screenshots/29-showcase-dark.png)

One AppLayout page imports and renders StatsGrid, StatusCard, FilterBar, DataTable, ActivityLog, ExecutionPanel, Leaderboard, Timer, ScoreDisplay, and ImpactShelf — with no layout conflicts. This is the "mix and match different components" case.

### Post-fix cleanup

**30. Portfolio home, final (all data loaded)**
![](./screenshots/30-portfolio-home-final.png)

**31. Portfolio home, dark, with data**
![](./screenshots/31-portfolio-home-dark.png)

**32. Sections singleton editor (empty — ready for edits)**
![](./screenshots/32-sections-editor-empty.png)

**33. Concepts singleton editor showing the saved AI Apps concept**
![](./screenshots/33-concepts-editor-one-entry.png)

**34. Projects collection list with the saved project**
![](./screenshots/34-projects-list.png)

### Fresh scaffold verification (no manual fixups)

After all fixes landed, scaffolded a brand-new project with the tarball-as-published CLI:

```
node create-brewfolio/src/index.js fresh-portfolio --type portfolio \
  --local-brewfolio brewfolio-0.1.0.tgz
cd fresh-portfolio && npm run dev
```

**35. Fresh portfolio homepage (first boot, never touched Keystatic)**
![](./screenshots/35-fresh-portfolio-home.png)

**36. Fresh portfolio Keystatic admin**
![](./screenshots/36-fresh-portfolio-keystatic.png)

Both responded HTTP 200. No console errors. No manual edits to `keystatic.config.ts` or `global.css` required. The CLI output is good-to-go.

---

## Remaining issues / deferred

| # | Severity | Area | Notes |
|---|----------|------|-------|
| A | P1 | Publishing | CLI still needs `--local-brewfolio <tarball>`. Nothing is on npm. Before external users can `npx create-brewfolio`, we need to `npm publish brewfolio` and `npm publish create-brewfolio` |
| B | P2 | `lib/` notebook renderer | Architecture doc lists a "notebook renderer" under `brewfolio/lib/`; only a `fetchNotebookFromGitHub` URL fetch helper exists. Real ipynb → HTML pipeline is deferred |
| C | P2 | StatusCard API | Component inventory doc describes StatusCard with `label`, `value`, `state` props; actual API is a single `status` enum (`running`\|`completed`\|`failed`\|…). Either update the doc or extend the component |
| D | P2 | ExecutionPanel without SSE | Component is designed around `sourceUrl` + autoConnect; no way to render it with a static list of entries for demos or screenshots. Consider accepting an `entries` fallback prop |
| E | P3 | Astro dev toolbar in screenshots | The floating toolbar shows up in every screenshot. Cosmetic. Could be silenced via `devToolbar: { enabled: false }` in `astro.config.mjs` when running tests |
| F | P3 | Header notch on AppLayout / GameLayout | The centered notch overlaps with the left-aligned nav row on narrow pages (see screenshot 28 top). Portfolio dashboard layout is fine. Small CSS polish |
| G | P3 | Reader import path in scaffold | `src/lib/content.ts` reaches back up to `../../keystatic.config` which works today but is fragile if pages get nested deeper. Consider emitting a Vite alias instead |

---

## Files touched

**brewfolio package:**
- `brewfolio/src/keystatic.config.ts` — named exports for `collections`, `singletons`, individual items; added `secrets`; fixed `sections` discriminated union
- `brewfolio/src/index.ts` — fixed re-exports
- `brewfolio/src/components/ProjectsPane.astro` — relative import + inline SVGs
- `brewfolio/src/components/Leaderboard.astro` — extracted `isTopThree` variable
- `brewfolio/src/components/ExecutionPanel.astro` — moved utilities onto class attribute
- `brewfolio/src/components/DataTable.astro` — render rows in tbody
- `brewfolio/src/layouts/AppLayout.astro` — `sections` default is `undefined`
- `brewfolio/brewfolio-0.1.0.tgz` — repacked

**CLI:**
- `packages/create-brewfolio/src/index.js` — `--type` flag, spinner fixes, tightened console output
- `packages/create-brewfolio/src/utils.js` — `copyTemplateOverlay(projectDir, type)` copies `common/` + `<type>/`
- `packages/create-brewfolio/template/` — rewritten into `common/` + `portfolio/` + `app/` + `game/`; `tailwind.config.js` deleted; `global.css` now `@source`s the brewfolio package

**Docs:**
- `internal/docs/brewfolio-implementation-plan.md` — Phase 6.5 checklist ticked off
- `internal/docs/brewfolio-phase6_5-e2e-test-report.md` — this file
- `internal/docs/screenshots/` — 36 screenshots from the headless run
