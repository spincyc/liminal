# AGENTS.md — repository guidance

## Boundaries

Liminal is a public, dependency-free SAT/ACT practice site. GitHub Pages serves
the `dist/` build of `main`. Keep plain HTML, CSS, and JavaScript; do not add a
framework, runtime server, paid service, or package dependency without explicit
approval.

Never add personal data, credentials, official test questions, commercial
question-bank material, or close imitations of copyrighted questions. All
practice content must be original and self-contained.

Do not push or deploy unless the user authorizes it; a push to `main` deploys
the live site.

Commits use the project identity, set in the clone's local Git config:

```sh
git config user.name "Liminal Project"
git config user.email "71109625+spincyc@users.noreply.github.com"
```

## Layers

Content, logic, and presentation stay orthogonal. A change to one should not
require editing another.

| Layer | Lives in | Rule |
| --- | --- | --- |
| Content | `content/` | Data only: JSON banks, passages, catalog, authored sources, study guides. No UI or layout. |
| Logic | `src/lib/` | Pure functions with no DOM access, loadable in Node and the browser, covered by `test/`. Reusable pieces belong here. |
| Presentation | `src/app/`, `src/styles/`, `src/*.html` | DOM and styling only; calls into `src/lib/` for every decision. |
| Tooling | `tools/` | Build, validation, audit, generation. Never shipped to the browser. |

`dist/` is build output and is never committed.

## Read before changing content

1. `README.md`
2. `docs/official-structure.md`
3. `content/schema.md`
4. `docs/content-authoring.md`
5. `docs/difficulty-calibration.md`
6. `content/catalog.json`

Canonical questions are JSON arrays in `content/banks/`. The build writes the
browser bundles into `dist/content/`; never hand-edit build output. The catalog
defines section keys, official taxonomy, allowed response types, calculator
policies, difficulty targets, and exact domain targets; keep records within it
unless an official-source review justifies a documented catalog change.

Each accepted question needs every field in `content/schema.md`, a
deterministic ID, original-content provenance, a content version matching the
catalog, and an honest review status. `automated-verified` means automated
checks passed; it does not mean a person approved the content. Use
`editorial-reviewed` only after a documented, independent review recorded in
`docs/content-audit.md`.

For a coherent content batch:

1. Preserve accepted IDs and edit or run the relevant generator in
   `tools/generators/`.
2. Validate, inspect failures, and never weaken a gate merely to reach a count.
3. Manually sample every affected domain, difficulty, and response format.
4. Run `npm run check`, and `npm run report:write` when counts or statuses change.
5. Commit source, tests, documentation, and audit notes together.

## Application notes

- The browser app has no module loader: `index.html` loads the generated
  catalog, `lib/core.js`, `lib/booklet.js`, then `app/app.js`; section banks
  load on demand from `content/<section>.js`.
- Content strings render as text, never as trusted HTML.
- Progress is private, versioned `localStorage` data under the
  `liminal:progress:*` key.
- Do not claim that the recommendation logic implements official SAT
  adaptivity, ACT scoring, or score prediction. Mini tests report accuracy
  only; they must never estimate a scaled SAT total or an ACT Composite.
- `sessionKind` in `src/app/app.js` switches the quiz view between `practice`
  (check as you go), `test` (no feedback, timer, free navigation), and `review`
  (answer guide open). A new quiz control must handle all three.
- `content/guides/answer-signs.js` powers the Answer Signs view. It is a study
  guide of probabilistic tells, not a question bank: never run it through the
  generators, and keep every tell's caution and the disclaimer.
- `content/study-guides/` is the Markdown study library. Every guide must be
  reachable from its `README.md`; `npm run check:guides` enforces this.
  Heuristics state when they fail; time-sensitive facts carry a
  verify-before-relying note.

## Context hygiene

- **Never read a bank or a build bundle.** `content/banks/` is about 11 MB;
  one bank can exceed a context window. Query with `node -e` and print only
  aggregates.
- **Pipe every gate through `tail`.** A failing report is a count plus the
  first few offenders.
- Work in units that end in a commit.

## Verification

```sh
npm run check        # required before any commit that touches code or content
git diff --check
```

Test major interactions in a current browser when one is available: section
loading, targeted and full sessions, each response type, hints, answer guides,
results, review lists, progress, keyboard operation, phone width, and dark
mode. Report unavailable tooling rather than installing it.

## Editing and completion

- Inspect `git status` and preserve unrelated work.
- Keep changes small and reviewable, with terse imperative commit subjects.
- Update documentation when behavior, schema, commands, counts, or limitations
  change.
- Keep the independent-project and trademark wording visible in the interface
  and README.
