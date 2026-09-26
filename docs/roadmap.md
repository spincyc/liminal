# Roadmap

## Why SAT Math practice overstated readiness

A student whose practice here pointed to about 700 in SAT Math scored about 500
on the real test. The SAT Math Hard tier explains most of the gap (measured
2026-09-25):

- **Every Hard stem names its method.** `tools/generators/generate-sat-math.js`
  appends `Use the ${family} structure for this case.` to every stem, so items
  read "Use the at least one via complement structure" or "Use the inscribed
  angle theorem structure". Recognizing the structure *is* the Hard skill
  (`docs/difficulty-calibration.md`); the stem does it for the student.
- **Filler hides repetition.** 146 of 150 Hard stems also carry a filler
  sentence ("Work from the … relationship shown, and verify the result in the
  original conditions."). Stripping both leaves at most 121 distinct Hard
  shapes, probably fewer.
- **The difficulty gate passes on a label.** Median solution steps are 3 / 3 / 3
  for Easy / Medium / Hard; only `estimatedSeconds`, which the generator assigns
  per tier, separates them.
- **26.6% of SAT Math is answerable without reading the question.**

## Done

- **Hard SAT Math templates**, then **templates for all of SAT**
  (2026-09-25): SAT Math and SAT Reading and Writing are generated from
  templates; a run takes at most one question per template and per topic and
  is described by a code. This replaced the fixed SAT banks for practice.
- **Digital test mode** for every session, with feedback after each question
  or at the end, any question count, an optional real-pace timer, and resume
  after reload.
- **A cold review** (2026-09-25, recorded in
  [`reviews/2026-09-25-cold-review.md`](reviews/2026-09-25-cold-review.md))
  found that practice still overstated readiness, through tier inflation,
  answer tells, unrecorded skips and full-length practice from the
  discredited bank, and that the site taught nothing. Everything below came
  from it:
  - **Honest templates.** Every template was re-tiered against
    `difficulty-calibration.md`; mixed templates were split; wrong and
    ambiguous keys were fixed; and 88 templates were added (SAT Math 118 →
    171, Reading and Writing 86 → 110), including graph-based Algebra and
    Advanced Math, high-register words, original period prose and poems,
    graph evidence, and conventions items that test two decisions at once.
  - **A gate for answer tells** (`docs/question-templates.md`, checks 1–12):
    runtime-shaped seeds, draws that fail their own check never served, key
    length, extreme values, openers, recurring choices, declared grammar
    features, the blind hub strategy (now about 27% on every tier, from
    35–40%), transition words, variety, and figures that survive the
    sanitizer.
  - **Versioned templates**, so an old question id knows when its template
    has changed; **runs** that rotate by recency and follow the domain
    weights.
  - **Every answer recorded**: blanks count as wrong, hinted answers apart,
    time per question kept, legacy bank answers out of accuracy, template
    answers at their current tier (`src/lib/progress.js`, record v3).
  - **Learn**: a lesson per SAT skill with worked examples, linked from every
    explanation and from Progress, plus general pages and a Math plan for a
    student near 500; the Study tips' factual errors fixed.
  - **Tests on screen**: one module, one section with Module 2 routed by
    Module 1, or the full-length SAT with a break; and **skill drills** that
    reuse templates with fresh seeds.
  - **Review** with spaced re-practice (1, 3, 7, 21 days; fresh versions from
    the second return) and an error log with reasons and rules.
  - **Progress** with a diagnostic, a skill map with practice states,
    pacing, history, a plan, and download and restore.
  - **Booklets from templates** in the module structure.
  - **Typeset math** and **dark mode** outside the test screen.
- **A second cold review** (2026-09-26, recorded in
  [`reviews/2026-09-26-cold-review.md`](reviews/2026-09-26-cold-review.md))
  found the skill map could be passed by chance, repeats counted as new
  evidence, Hard still inflated, tells the gate did not measure, a saved
  test lost silently, and the ACT banks where the SAT banks had been. From
  it:
  - **Honest evidence.** The gate is 24 of the last 30 Medium, Mastered 10
    of the last 15 Hard, each window over two days and two designs, each
    question counted once at its first answer; answers to questions seen
    before are left out of accuracy; a correct answer after a hint is a
    miss; Hard accuracy is shown beside Hard accuracy on each design's first
    appearance; ACT skills show accuracy only.
  - **Honest templates.** Math and Reading and Writing re-tiered again
    (about 30 Hard templates moved down, mixed ones split), one wrong key
    fixed, and 36 templates added (SAT Math 172 → 188, Reading and Writing
    110 → 120), most of them Hard designs; thin Hard cells grown to 40–60
    distinct items.
  - **More gates:** look-alike pairs (check 13), most-similar pairs and
    text hubs (checks 14 and 8), short choices by length, visible text slips
    (check 15), approximation keys, declared tiers; Learn must state the
    app's bars.
  - **One next step** on every page, following the SAT Math plan, with a
    diagnostic that places you in it and a first-visit "Start here".
  - **Official scores** recorded beside recent accuracy (the start of item 2
    below); **highlights, notes and a line reader**; **protected tests** in
    their own slot, a discard that records what was seen, and module clocks
    that keep running; per-section full-length reports; per-test plans;
    Review rules that come back; one History row per test.
  - **Learn**: about 50 more taught recognitions with worked examples; the
    scoring, pacing, plan and ACT blueprint corrections.
  - **ACT**: whole passages in English and Reading sets, two wrong keys
    fixed, tiers no longer used.

## Next

In-flight branches, the order to integrate them, and smaller open items
are in [`handoff.md`](handoff.md).

1. **Retire the fixed SAT banks** (in progress, 2026-09-26). Practice, tests
   and booklets no longer use them; they remain for old attempt ids,
   `core.js`'s `sat-full` blueprint and the smoke test. Move those off and
   delete the banks and their generators.
2. **Calibrate against real results.** Tiers are judged, not measured.
   Progress now records official Bluebook practice-test and SAT scores beside
   Liminal accuracy over the 28 days before each (2026-09-26), and the
   progress file carries them. Next: with several students' files, shared
   with consent, check whether Hard accuracy tracks the official section
   scores, and re-tier templates where it does not.
3. **Measure the tiers.** Tiers are still judged by a rubric; the new Hard
   templates of 2026-09-26 were checked by their authors, not by a cold
   reader. A cold read of the new Hard designs, then calibration (item 2).
4. **An embedded graphing calculator.** Desmos needs an API key, so the
   calculator opens desmos.com in a new window instead.
5. **ACT templates.** ACT Math templates are being built (2026-09-26); then
   passage-set templates for Science, slot templates over authored English
   passages, and Reading kept as authored sets. Until then the ACT banks
   carry method-naming leads in Math, near-duplicate Science items, and
   English and Reading answer tells, and ACT shows accuracy only.
6. **Split `src/lib/core.js`** (in progress, 2026-09-26), then the largest
   views (`review.js`, `practice.js`) and the test shell.
7. **Widen the template fingerprint.** Eight seeds miss edits that change
   only rare draws, so two versions were bumped by hand on 2026-09-26.

## Decided

- **The skill gate must be hard to pass by chance** (2026-09-26). A window
  checked after every set is met by luck far more often than its bar
  suggests: a student right 70% of the time met the old 16-of-20 gate within
  60 Medium answers 82% of the time, and a student right on 30% of Hard
  questions reached the old Mastered (3 of 5) within 20 answers 70% of the
  time. The bars are now 24 of 30 Medium and 10 of 15 Hard, over two days
  and two designs, first answers only (about 50% and 1% for those
  students), and the Learn plan must state them.
- **A second answer to the same question is not evidence** (2026-09-26): it
  tests memory of the question. Repeats stay in the record and drive Review
  but are left out of accuracy and the gate.
- **Discard records what was seen** (2026-09-26): every question a set
  showed, answered or blank; Save and exit records nothing and resumes. A
  test module's clock runs on the wall clock, as on test day.
- **ACT difficulty labels are not used** (2026-09-26) until ACT is built
  from judged templates: Hard differed from Easy by label only.

- **No scaled score estimates** (2026-09-25). The prototype above mapped
  accuracy on its own generated items onto an official practice test's
  raw-to-scaled conversion. Its items, including the ones labeled Hard, are
  much easier than the real test's (for example, "What is the solution to
  5(x + 4) = x − 8?" labeled Hard), so the estimate runs high. It is the
  likely source of the practice reading of about 700 in Math that preceded a
  real score of about 500. An estimate needs items calibrated against real
  performance; until then Liminal reports accuracy, with Hard accuracy on
  its own.
- **Module 2 routing is a fixed practice rule** (2026-09-25): the harder
  Module 2 at 60% or more of Module 1, labelled as an approximation wherever
  it appears. College Board does not publish its routing, and the rule
  exists to make practice feel like the test, not to predict a score.
- **A correct answer after a hint does not count as correct** (2026-09-25),
  in accuracy, the skill map or the review schedule: the question tested the
  hint, not the student. It is shown apart.
- **A template's version tracks what the student sees** (2026-09-25): the
  fingerprint hashes the question, choices, key and teaching text, not the
  tier or other metadata, so relabeling a template re-tiers old answers
  without marking them as answered on a different question.
