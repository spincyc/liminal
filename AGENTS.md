# AGENTS.md — repository guidance

## Boundaries

Liminal is a public, dependency-free classroom study and SAT/ACT practice site. GitHub Pages serves
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

Template source changes also need renewed independent review recorded in
`content/template-reviews.json`, following `docs/question-templates.md`. The
reviewer must solve displayed samples before seeing their keys and must differ
from the author of the change. `tools/check-template-reviews.js` binds this
sampled agent review to the current source/version/tier. It is not human
editorial approval or measured SAT difficulty. Source fingerprints conservatively
include shared dependencies, sibling templates, comments and metadata; review
the impact of those changes rather than automatically refreshing approvals.

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

- UI changes follow `docs/design-system.md`: choose the applicable page template,
  reuse shared control components, and verify its screen/print contract. Keep
  section-specific task behavior coherent; do not impose reader pagination on
  active assessments. Record justified template exceptions in the section docs.
  Grade, weekly and AP worksheet exports share `styles/worksheet-print.css` and the bundled
  Computer Modern faces in `styles/print.css`; use the same ruled question
  headings and two-column flow as SAT/ACT, with offline fonts/license intact.

- Grade lesson expansions use `content/lesson-modules/<track>/<grade>/`,
  `src/lib/lesson-modules/<track>/<grade>/`, and `lessons.html`. They belong to
  the matching curriculum pathway and grade; Grade 8 mathematics is not a
  standalone course. Register reviewed expansions in the shared module catalog,
  not per-grade application branches. SAT/ACT progress stays separate.
  Follow `docs/lesson-modules.md` for schema, generation, review, and print
  verification. Textbook references identify scope; all instruction and
  exercises are original. Never commit scanned textbook pages or student work.

- Courses for AP® exams (track `ap`: `calculus-ab`, `calculus-bc`, `physics-1`,
  `physics-c-mechanics`) follow `docs/ap-courses.md`. Weekly work uses the
  weekly engine; unit tests and practice exams are `liminal-ap-assessment`
  documents in `content/ap/assessments/<course>/`, validated by
  `node tools/check-ap.js` (`--complete` for release) and built by
  `tools/build-ap.js`. `ap.html` loads `content/ap-plan.js`, `content/ap.js`,
  `content/weekly-index.js`, `lib/high-school.js`, `lib/weekly.js`,
  `lib/assessment.js`, `lib/assessment-adapters.js`, `lib/ap-assessment.js`,
  `app/render.js`, `app/ap-render.js`, `app/ap.js`;
  student copies and answer keys are separate routes and printouts. Report
  raw points only (no score prediction or conversion), never claim an
  authorized AP course, keep the exact College Board disclaimer on every page
  and export that shows the marks, and say that paper investigations do not
  replace the required physics lab work.

- Every page has one Liminal header: its source holds the placeholder
  `<!-- liminal:site-header -->`, which `tools/build.js` replaces with the
  wordmark and navigation from `tools/lib/site-header.js`, styled by
  `styles/brand.css`. Four primary areas stay visible at every width:
  Courses, Readings, AP prep, and SAT/ACT. `src/lib/navigation.js` owns
  destination and contextual route decisions; `src/app/navigation.js` updates
  the header as hashes change, preserving course/grade context. The build
  inserts these shared scripts and `tools/smoke-static.js` validates the
  canonical header and assets. Test prep keeps its SAT | ACT switch and views
  in a bar beneath, in normal flow. Browsing pages share the palette and type
  in `tokens.css`; the active assessment shell retains its separate theme.
- The browser app has no module loader; each page loads plain scripts in
  order, and `tools/smoke-static.js` pins that order.
  - `index.html`: the compact learning directory, `styles/home.css`, and
    `app/home.js` for legacy practice-hash redirects. It loads no test banks
    or progress storage. SAT/ACT module links select `?test=SAT` or `?test=ACT`.
  - `practice.html`: the generated catalog, answer signs, template registries
    and Desmos routes (`content/desmos-routes.js`), then `lib/core.js`, `lib/template-mask.js`, `lib/question-identity.js`, `lib/runs.js`,
    `lib/modules.js`, `lib/simulation.js`, `lib/assessment.js`,
    `lib/assessment-adapters.js`, `lib/test-engine.js`,
    `lib/session-store.js`, `lib/annotations.js`, `lib/line-reader.js`,
    `lib/progress.js`, `lib/review-queue.js`,
    `lib/practice.js`, `lib/analytics.js`, `lib/progress-io.js`,
    `app/render.js`, `app/test-shell.js`, `app/site.js` (the SAT | ACT
    switch in the test-prep bar), the views in `app/views/`, then `app/app.js`.
    Stylesheets: `tokens.css`, `app.css`, `test-shell.css`, `math.css`,
    `review.css`, `progress.css`.
  - `learn.html`: `content/learn-sat.js` (built by `tools/build-learn.js`),
    `lib/learn-markup.js`, `app/site.js`, `app/render.js`, `app/learn.js`;
    it routes `#<pageId>` and `#<pageId>/<anchor>`.
  - `print.html`: the catalog and registries, `lib/core.js`,
    `lib/template-mask.js`, `lib/question-identity.js`, `lib/runs.js`, `lib/modules.js`,
    `lib/assessment.js`, `lib/assessment-adapters.js`, `lib/booklet.js`,
    `lib/progress.js`, `app/render.js`, `app/site.js`, `app/print.js`.
  ACT section banks load on demand from `content/<section>.js`; a SAT
  section's templates load from `lib/families/<section>.js` when needed.
  The built registries (`content/templates.js`) carry every template's tier,
  domain, skill and subskill, so labels and re-tiering never need a bundle.
- SAT, ACT and AP assessment mechanics share `lib/assessment.js` through
  explicit adapters. Follow `docs/assessment-platform.md`: keep generators,
  numeric comparisons, session/progress storage and program scoring policies
  with their existing owners; student projections use display allowlists.
- `app/app.js` is the page shell: routing, the one place sets are launched
  and recorded, and the `ctx` it hands each view. The view interface is
  documented at its top; each view (`practice`, `progress`, `review`, `tips`)
  lives in `app/views/`.
- SAT sections are built from templates (`docs/question-templates.md`): a run
  takes at most one question per template, avoids repeated items and scenes,
  reports reuse if its bounded draw search is exhausted, prefers
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
  - ACT Writing drafts live only in unfinished-session storage and the active
    report. Progress records completion, never essay text or an essay score.
    Preserve draft download before closing a finished report and exclude
    essays from scored denominators in summaries and analytics.
  - A finished module in an unfinished simulation keeps its question snapshots
    and template versions so a template update cannot regrade old choices.
    Older saved modules lacking recoverable snapshots retain recorded totals;
    explain when their individual questions can no longer be reviewed.
  - New fixed-bank attempts store `contentIdentity` from the question actually
    shown, including its resolved passage. Use `questionMatchesAttempt` before
    attaching a historical response to current choices. Missing or changed
    identity preserves outcomes but withholds unverifiable question details;
    a current-version retry is explicitly labeled. Preserve identities through
    progress export/import and do not let a revised item mature an old item's
    review schedule.
  - Generated attempts also store `visibleIdentity`, a hash of displayed
    content independent of seed, template, answer key and choice order.
    Repeated visible items count only once in accuracy and mastery. Preserve
    this identity through import and merge; do not infer it for old attempts
    whose displayed content is unavailable. Section history keeps bounded
    recent item identities and scenes, shared by practice and booklets.
  - `liminal:progress:v3` (`src/lib/progress.js`) holds every attempt a set
    shows (a blank is recorded as wrong), each with its source, hint use,
    time, feedback mode, template id, version and seed, and `reviewOf` when
    it re-practises a miss; marks; per-section serve history and scenes;
    session summaries; the error log; the plan (per test: SAT and ACT each
    keep a test date and weekly goal); and official scores the
    student reports (Bluebook practice tests and real SATs, shown beside
    Liminal accuracy over the 28 days before each, never predicted); and
    official question-bank checks (`officialChecks`: `{ id, sectionKey,
    skill, difficulty Medium|Hard, attempted 1–50, correct, date }`,
    validated by `LiminalProgress.cleanOfficialCheck`); and `planLedger`,
    a per-section checkpoint of the plan's replay (`Analytics.planState`
    `checkpoint`), refreshed on every save, so the plan survives the cap on
    kept attempts (the newer `at` wins across tabs and imports). The record
    keeps top-level fields it does not know, so an older tab cannot erase a
    newer field. It
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
  attempts and stores nothing. A generated question's schedule belongs to
  its template: every version of a design shares one, and a right answer to
  any version in any set counts once it is due; a bank question has its
  own. In SAT Math, misses on skills never in flight are parked: they are
  not due until the skill first flies, and misses on drilled skills come
  first among those due. A miss (wrong, blank, or right only after a
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
- One next step for every page (`Analytics.nextStep`, built by `ctx.guide`):
  Review when anything is due, at most once a calendar day per test
  (`Analytics.reviewDoneToday`; a set takes `LiminalReviewQueue.SET_LIMIT`,
  six, most overdue first); after that the step moves on and carries
  `reviewDue`; only the due set (`step: "review"`) closes the day's Review,
  not Missed, Marked or single-question retries. SAT Math runs the plan (`Analytics.PLANS`, held to the catalog
  and the Learn page by a test) as two tracks, stages 1–2 and 3–4, each with
  one skill in flight (`Analytics.planState`, replayed from the attempts), so
  Advanced Math starts in the first week. A skill leaves flight at the gate
  or after `BUDGET` (20) answers from its own drills at any level (the
  diagnostic, modules, mixed and Desmos sets spend nothing); one that leaves
  short of the gate has moved on (flagged when its drills never left Easy,
  and prompted for an official check) and returns in the next pass, while a
  skill whose latest official check is low (`OFFICIAL_CHECK`) returns at the
  next opening in its track. After Review, the rotation (`ROTATION`,
  `rotationStep`) offers a timed Module 1 after 7 days without one, or after
  10 practice sets and 3 days, once three skills are started; a mixed set
  after a drill (`mixedSpec`, `practice.buildMixedSet`); and the Desmos drill
  (`#desmos/sat-math`, only when `window.LiminalDesmosRoutes` loaded) when
  none was taken in 7 days until four are done, then every 14 days, drawn
  from routed templates where a graph genuinely solves; otherwise a drill on
  the track drilled least recently: Easy until
  routine (`ROUTINE`: 8 of the last 10 Easy or Medium first answers), then
  Medium with `HARD_MIX` Hard once routine at Medium (`MEDIUM_ROUTINE`), then
  Hard-led at the gate (`skillLevel`). The gate and Hard bar are practice
  targets and no longer block moving on. For Reading and Writing the step
  is the weakest skill with evidence; for ACT the lowest accuracy, with no
  level, track, budget or rotation. The diagnostic reports by domain and
  places the student in the plan (`PLACEMENT`) but does not by itself make
  a timed module due. "Read the lesson" is offered until a skill's first
  drill. Results pages lead with the next step; "Practice what I missed"
  (`missed-drill`) counts as Review-like and spends no budget. `app.js` holds `ctx.guide`, `stepWords`, `startStep`
  (which launches every step kind), `startDiagnostic`, `startMixed` and
  `startDesmos`. Practice's "Start here" opens on a first visit with the
  Math diagnostic first and stays dismissible (`liminal:start-hidden:v1`,
  per viewer). Sessions may carry `step` (the step kind that launched them)
  and, for drills, `skill`. Template bundles load only when a set needs
  their questions; counts and labels come from the built registries
  (`practice.registryTemplates`).
- Progress shows a weekly report per test (`Analytics.weeklyReport`,
  printable, with plain text from `weeklyReportText` for Copy summary, so a
  student can send it to a parent) with an On track / Needs attention
  signal that lists each reason: practice days, timed modules, pace toward
  the test date, flat official scores (two at least 14 days apart with
  practice between), official checks well below Liminal accuracy, and
  practising without learning (a skill whose turn ended below routine at
  Medium, no target reached in 21 days of practice, or flat Medium
  accuracy). Its copied summary is plain English for a parent, without plan
  jargon. Backlog size alone never makes it say Needs attention. SAT-only parts are omitted for ACT, and it never
  estimates a score. Official question-bank checks (`officialChecks`)
  record X of N College Board Student Question Bank questions per skill
  and tier; a confirming check is shown on the skill, and a low one returns
  the skill to flight.
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
  of one template; `practice.html#practice/<sectionKey>/<skillSlug>` fills in
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
  fails, and SAT pages hold no ACT-only rules. SAT Math pages put a
  `> **Try it.**` problem (answer and worked solution required; optional
  `**First step.**` and `**Hint.**`) after every Example, with at least one
  in each subskill section; `## Before you start {#before-you-start}` holds
  2–5 checks and links to `lessons.html#common-core-math/8/<lesson>` or
  `weeks.html#<track>/<grade-or-course>/<week>`, which `check:learn`
  validates against the lesson-module catalog and the published courses.
  Material at the official Easy/Medium level comes first; Hard-only material
  sits under `## Harder versions {#hard}`, kept in step with template tiers.
  Never rename or delete an anchor: templates and other pages link to them.
- `content/desmos-routes.json` gives a Desmos route (`enter`, `read`,
  `fails`; plain text, one line, at most 300 characters each) for each SAT
  Math template where Desmos genuinely solves or checks the question,
  verified against generated questions when written. `tools/check-desmos.js`
  (in `npm run check`) holds the format, active template ids in template
  order, and the text rules. The build emits `content/desmos-routes.js`
  (`window.LiminalDesmosRoutes`). The test screen shows a question's route
  under its explanation only after the answer is checked or the set is
  finished, never names the template, and hides the feature when the bundle
  is missing. When a template changes what it shows, re-verify its route or
  remove it. The Calculator button opens desmos.com in one window beside the
  test, reused while the page stays loaded; the window is detached
  (`opener = null`) so Desmos cannot reach the page, which means a reload
  opens a second window. Embedding the Desmos API needs the owner's approval
  (an API key and an external script).
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
