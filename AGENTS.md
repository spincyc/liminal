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

- The browser app has no module loader. `index.html` loads the generated
  catalog and template registries, `lib/core.js`, `lib/template-mask.js`,
  `lib/runs.js`, `lib/test-engine.js`, `app/render.js`, `app/test-shell.js`,
  `lib/booklet.js`, `app/site.js` (the shared header and SAT | ACT switch),
  then `app/app.js`. Section banks load on demand from `content/<section>.js`,
  and a SAT section's templates load from `lib/families/` the first time that
  section is chosen.
- SAT sections are built from templates (`docs/question-templates.md`): a run
  takes at most one question per template and one per scene, and is described
  by its template mask and seed. ACT sections draw from their fixed banks.
  New templates must pass `npm run check:families` and be registered with
  `npm run templates`; registry bits are permanent.
- Every session runs in the digital test mode (`window.LiminalShell`): the
  setup view builds a question list and calls `LiminalShell.start` with a
  feedback mode (`instant` or `end`), an optional time limit, and callbacks.
  `src/lib/test-engine.js` holds the session logic and has no DOM access;
  `src/app/render.js` renders stimuli and sanitizes figure SVG through an
  allow-list. Never show domain, skill, difficulty, or IDs during a session.
- Content strings render as text, never as trusted HTML. Figures are parsed
  as SVG data and rebuilt element by element.
- Browser storage: `liminal:progress:v2` holds attempts (each carries its
  section, skill, domain, and difficulty, plus family and seed for generated
  questions), the marked-for-review list, and each section's seen-template
  mask; `liminal:session:v1` holds an unfinished set so it can resume after a
  reload; `liminal:test:v1` holds the SAT | ACT choice.
- A generated question's id is `<section>:<template>:<seed>` (older ones use
  `sat-math-hard:<family>:<seed>`), so it can be rebuilt exactly; never store
  generated questions in a bank.
- Do not claim that the recommendation logic implements official SAT
  adaptivity, ACT scoring, or score prediction, and do not add scaled score
  estimates (see "Decided" in `docs/roadmap.md`). Reports show accuracy, with
  Hard accuracy on its own.
- `content/guides/answer-signs.js` powers the Study tips view. It is a study
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
the digital test mode in both feedback modes (timer, navigator, review page,
eliminator, figures, numeric entry, report), resuming after a reload, review
lists, progress, keyboard operation, and phone width. Report unavailable
tooling rather than installing it.

## Editing and completion

- Inspect `git status` and preserve unrelated work.
- Keep changes small and reviewable, with terse imperative commit subjects.
- Update documentation when behavior, schema, commands, counts, or limitations
  change.
- Keep the independent-project and trademark wording visible in the interface
  and README.
