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

## Next

1. **Retire the fixed SAT banks.** Practice, tests and booklets no longer use
   them; they remain for old attempt ids, `core.js`'s `sat-full` blueprint and
   the smoke test. Move those off and delete the banks and their generators.
2. **Calibrate against real results.** Tiers are judged, not measured.
   Progress now records official Bluebook practice-test and SAT scores beside
   Liminal accuracy over the 28 days before each (2026-09-26), and the
   progress file carries them. Next: with several students' files, shared
   with consent, check whether Hard accuracy tracks the official section
   scores, and re-tier templates where it does not.
3. **Grow thin cells.** Statistical inference has only two Hard templates;
   several Reading and Writing Hard templates are banks of 10–12 items, so a
   heavy user will meet repeats after many tests. Grow banks and add a
   "look-alike pair" tell check.
4. **More of the real test's tools.** Highlights, notes and a line reader for
   Reading and Writing; an embedded graphing calculator (Desmos needs an API
   key, so the calculator opens desmos.com in a new window instead).
5. **ACT templates.** ACT sections still use fixed banks with the weaknesses
   the SAT banks had.
6. **Split `src/lib/core.js`** into focused modules behind the same tests, and
   split the largest views (`review.js`, `practice.js`) and the test shell.
7. **Protect unfinished tests.** Starting a new set replaces a saved one
   silently; a two-hour test deserves a confirmation or its own slot.

## Decided

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
