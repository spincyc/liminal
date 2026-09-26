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
| Content | `content/` | Data only: JSON banks, passages, catalog, template registries, authored sources, Learn pages, study guides. No UI or layout. |
| Logic | `src/lib/` | Pure functions with no DOM access, loadable in Node and the browser, covered by `test/`. Reusable pieces belong here. |
| Presentation | `src/app/`, `src/styles/`, `src/*.html` | DOM and styling only; calls into `src/lib/` for every decision. |
| Tooling | `tools/` | Build, validation, audit, generation. Never shipped to the browser. |

`dist/` is build output and is never committed.

## Read before changing content

1. `README.md`
2. `docs/official-structure.md`
3. `docs/question-templates.md` (SAT questions are templates)
4. `docs/difficulty-calibration.md`
5. `content/catalog.json`
6. `content/schema.md` and `docs/content-authoring.md` (the fixed ACT banks)

SAT practice is generated from the templates in `src/lib/families/`; the
fixed SAT banks in `content/banks/` are retired and kept only so old attempts
and ids still resolve, so never regenerate them. A template change follows
`docs/question-templates.md`: pass `npm run check:families` (and a
`--reps 3000` deep pass), read at least three seeds of every changed template
as a strong test-taker, then run `npm run templates` and commit the registry,
whose version bumps when what a template builds changes.

Canonical ACT questions are JSON arrays in `content/banks/`. The build writes the
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

For a coherent ACT bank batch:

1. Preserve accepted IDs and edit or run the relevant generator in
   `tools/generators/`.
2. Validate, inspect failures, and never weaken a gate merely to reach a count.
3. Manually sample every affected domain, difficulty, and response format.
4. Run `npm run check`, and `npm run report:write` when counts or statuses change.
5. Commit source, tests, documentation, and audit notes together.

## Application notes

- The browser app has no module loader; each page loads plain scripts in
  order, and `tools/smoke-static.js` pins that order.
  - `index.html`: the generated catalog, answer signs and template registries,
    then `lib/core.js`, `lib/template-mask.js`, `lib/runs.js`,
    `lib/modules.js`, `lib/simulation.js`, `lib/test-engine.js`,
    `lib/session-store.js`, `lib/annotations.js`, `lib/line-reader.js`,
    `lib/progress.js`, `lib/review-queue.js`,
    `lib/practice.js`, `lib/analytics.js`, `lib/progress-io.js`,
    `app/render.js`, `app/test-shell.js`, `app/site.js` (the shared header
    and SAT | ACT switch), the views in `app/views/`, then `app/app.js`.
    Stylesheets: `tokens.css`, `app.css`, `test-shell.css`, `math.css`,
    `review.css`, `progress.css`.
  - `learn.html`: `content/learn-sat.js` (built by `tools/build-learn.js`),
    `lib/learn-markup.js`, `app/site.js`, `app/render.js`, `app/learn.js`;
    it routes `#<pageId>` and `#<pageId>/<anchor>`.
  - `print.html`: the catalog and registries, `lib/core.js`,
    `lib/template-mask.js`, `lib/runs.js`, `lib/modules.js`,
    `lib/booklet.js`, `app/render.js`, `app/site.js`, `app/print.js`.
  ACT section banks load on demand from `content/<section>.js`; a SAT
  section's templates load from `lib/families/<section>.js` when needed.
  The built registries (`content/templates.js`) carry every template's tier,
  domain, skill and subskill, so labels and re-tiering never need a bundle.
- `app/app.js` is the page shell: routing, the one place sets are launched
  and recorded, and the `ctx` it hands each view. The view interface is
  documented at its top; each view (`practice`, `progress`, `review`, `tips`)
  lives in `app/views/`.
- SAT sections are built from templates (`docs/question-templates.md`): a run
  takes at most one question per template and one per scene, prefers
  templates the student saw least recently, follows the catalog's domain
  weights, and is described by its code (mask, seed and any steered
  attempts). ACT sections draw from their fixed banks. New or changed
  templates must pass `npm run check:families` and be registered with
  `npm run templates`; registry bits are permanent, and a template's version
  goes up when what it builds changes.
- Every session runs in the digital test mode (`window.LiminalShell`):
  `src/lib/test-engine.js` holds the session logic (including each
  question's time) and has no DOM access; `src/app/render.js` renders
  stimuli, typesets Math text when called with `{ math: true }` (so
  `styles/math.css` must load wherever it does), and sanitizes figure SVG
  through an allow-list. Never show domain, skill, difficulty, or IDs during
  a session. Exit is Save and exit (resumable; a practice set's clock
  pauses, a test module's keeps running on the wall clock) or Discard, which
  records every question the set showed, answered or blank, tagged
  `discarded`, and nothing unseen; every start asks before replacing a
  saved set or test (`ctx.confirmReplace`). Reading passages carry Annotate
  (highlights with notes) and a line reader: `src/lib/annotations.js` keeps
  highlights as text offsets per passage and `src/lib/line-reader.js` the
  band's geometry.
- Content strings render as text, never as trusted HTML. Figures are parsed
  as SVG data and rebuilt element by element. Learn pages arrive as block
  trees and render through DOM APIs only.
- Browser storage:
  - `liminal:progress:v3` (`src/lib/progress.js`) holds every attempt a set
    shows (a blank is recorded as wrong), each with its source, hint use,
    time, feedback mode, template id, version and seed, and `reviewOf` when
    it re-practises a miss; marks; per-section serve history and scenes;
    session summaries; the error log; the plan (per test: SAT and ACT each
    keep a test date and weekly goal); and official scores the
    student reports (Bluebook practice tests and real SATs, shown beside
    Liminal accuracy over the 28 days before each, never predicted). It
    migrates
    `liminal:progress:v2` (kept as a backup; answers from the retired SAT
    banks are tagged `legacy-bank`) and merges what another tab saved.
    `LiminalProgress.stats` is the one accuracy model: legacy answers are
    left out, a hinted correct answer is not counted as correct, an answer
    to a question answered before (`repeat: true`, set when recorded) is
    left out, and template answers count at the template's current tier.
  - `liminal:session:v1` holds an unfinished set and
    `liminal:session:test:v1` an unfinished on-screen test
    (`src/lib/session-store.js`), so a set never overwrites a test; each
    value names its owner so another tab cannot write over its successor,
    and a test found in the old slot moves to the new one
    (`config.simulation` is a test's state; `state` is the module on
    screen, null during the break); its shell snapshot also
    carries the set's highlights, notes and line-reader settings, which are
    session scratch and never reach the progress record; `liminal:test:v1` holds the
    SAT | ACT choice.
  - `lib/progress-io.js` defines the downloadable progress file
    (`{ format: "liminal-progress", version: 3, exportedAt, progress }`);
    a restore is validated before anything is written, and a file from a
    newer record version is refused.
- A generated question's id is `<section>:<template>:<seed>` (older ones use
  `sat-math-hard:<family>:<seed>`), so it can be rebuilt exactly while its
  template's version is unchanged; never store generated questions in a bank.
- Review's spaced schedule (`src/lib/review-queue.js`) is derived from
  attempts and stores nothing: a miss (wrong, blank, or right only after a
  hint: `LiminalProgress.isMiss`) returns after 1 day, then 3, 7 and 21
  days after each correct answer, with a fresh version of the same template
  from the second return; a wrong, blank or hinted answer restarts it; a
  correct answer before the due day changes nothing. Error-log tags live in
  the progress record's `errorLog`.
- The Progress view gets every number from `lib/analytics.js`, which counts
  through `LiminalProgress.stats`. Its states are practice guidance: the gate
  is at least 24 correct of a skill's last 30 Medium answers (and needs 30);
  mastered adds at least 10 correct of the last 15 Hard answers; both
  windows hold each question's first answer only and must span two days and
  two templates; under 5 answers is not
  enough data. Skills in sections whose tiers are not verified (the fixed
  ACT banks) show accuracy only: no Hard figures, no gate, no Mastered. The
  windows are long because a student checks them after
  every set, and short windows are met by chance. `npm run check:learn`
  fails unless the SAT Math plan page in Learn states the same bars.
- `src/lib/modules.js` is a practice approximation of the digital test's
  modules (sizes, difficulty mixes, domain counts, order); it builds the
  booklets and the on-screen tests, and every screen that uses it says the
  real routing is not published. Module 2 routes by
  `modules.ROUTING_THRESHOLD` (60% of Module 1), a fixed practice rule.
- On-screen SAT tests: `src/lib/simulation.js` is the state machine
  (modules, routing, the break, resume, the combined report), and
  `practice.buildModuleRun` builds each module from the blueprint without
  repeating a template or an earlier scene in the same test. The shell's
  module mode (`options.module`) submits from the review page with no way
  back, and `LiminalShell.startBreak` runs the break on the wall clock.
  Sessions record one `module` entry per module plus one `section` or
  `full` entry that repeats their totals, so analytics that add sessions
  must not count both. A skill drill (kind `drill`) may take several seeds
  of one template; `index.html#practice/<sectionKey>/<skillSlug>` fills in
  the drill for that skill.
- Do not claim that the recommendation logic implements official SAT
  adaptivity, ACT scoring, or score prediction, and do not add scaled score
  estimates (see "Decided" in `docs/roadmap.md`). Reports show accuracy, with
  Hard accuracy on its own; official Bluebook practice tests are the score
  gauge.
- `content/learn/` holds the SAT Learn pages: one page per catalog skill at
  `<sectionKey>/<slug(domain)>/<slug(skill)>.md`, cross-skill pages at
  `sat/general/<slug>.md`, and time-sensitive values in `facts.json` with
  their official source and the date checked. Pages use the strict Markdown
  subset documented at the top of `src/lib/learn-markup.js`; anything else
  fails the build. `npm run check:learn` requires one `##` section per
  catalog subskill anchored `{#<slug(subskill)>}` with a worked Example,
  every template's skill and subskill to resolve to such a section, dated
  and sourced facts, and working links. Link into Learn with
  `learn.html#<pageId>[/<anchor>]`. Every heuristic is followed by when it
  fails, and SAT pages hold no ACT-only rules.
- `content/guides/answer-signs.js` powers the Study tips view. It is a study
  guide of probabilistic tells, not a question bank: never run it through the
  generators, and keep every tell's caution, each principle's caution, and
  the disclaimer.
- `content/study-guides/` is the Markdown library for general, planning and
  ACT guides; SAT skill content lives in Learn, and links into Learn are
  checked. Every guide must be reachable from its `README.md`;
  `npm run check:guides` enforces this. Heuristics state when they fail;
  time-sensitive facts carry a verify-before-relying note.

## Context hygiene

- **Never read a bank or a build bundle.** `content/banks/` is about 11 MB;
  one bank can exceed a context window. Query with `node -e` and print only
  aggregates.
- **Pipe every gate through `tail`.** A failing report is a count plus the
  first few offenders.
- Work in units that end in a commit.

## Verification

```sh
npm run check                                   # required before any commit that touches code or content
node tools/check-families.js --reps 3000 | tail # after template changes: rare defects hide in 1 draw in 1,000
git diff --check
```

Test major interactions in a current browser when one is available: section
loading, targeted and full sessions, each response type, hints, answer guides,
the digital test mode in both feedback modes (timer, navigator, review page,
eliminator, figures, typeset math, numeric entry, report), Save and exit and
resuming after a reload, Review (Due, the error log, Marked), Progress (the
diagnostic, skill map, pacing, history, plan, download and restore), Learn
pages and their deep links, booklets, keyboard operation, dark mode, and phone
width. Report unavailable tooling rather than installing it.

## Editing and completion

- Inspect `git status` and preserve unrelated work.
- Keep changes small and reviewable, with terse imperative commit subjects.
- Update documentation when behavior, schema, commands, counts, or limitations
  change.
- Keep the independent-project and trademark wording visible in the interface
  and README.
