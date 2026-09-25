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

- **Hard SAT Math templates** (27 types, now in `src/lib/families/sat/math/`),
  served fresh in the *Hard math reps* mode; each attempt records its family
  and seed, so a missed or marked problem can be rebuilt and practiced again.
- **Digital test mode** for every session, with a *Feedback* choice (after
  each question, or a report at the end), any question count with module
  quick picks, an optional timer at real-test pace, and resume after reload.
- **Hard accuracy on its own** on the Progress view and in every report.
- **Figures** rendered from sanitized SVG with the not-to-scale note.
- **Equivalent numeric answers**: fractions, decimals, and the U+2212 minus.
- **Templates for all of SAT** (2026-09-25): SAT Math (Easy, Medium, Hard) and
  SAT Reading and Writing are generated from templates; a run takes at most
  one question per template and per topic, is described by a template mask
  and seed, and prefers templates not yet seen. This replaces the fixed SAT
  banks for practice, which fixes the method-naming stems and the
  one-frame-per-skill Reading and Writing items.
- **One design across the site**, shared with the test mode, and an SAT | ACT
  switch that scopes every page to one test.

## Next

1. **Booklets and printed forms from templates.** Printable SAT booklets
   still draw from the old fixed SAT banks, which name the method in math
   stems and repeat one frame per Reading and Writing skill. Build them from
   template runs instead, then retire the fixed SAT banks.
2. **Module and full-length simulations on screen.** Two modules per section
   at real counts and times (Reading and Writing 27 questions / 32 minutes,
   Math 22 / 35), a review page between them, and a break between sections,
   built from template runs.
3. **More of the real test's tools.** Typeset math (fractions and exponents
   are plain text today); highlights, notes, and a line reader for Reading and
   Writing; an embedded graphing calculator (Desmos needs an API key and would
   be the first external dependency, so the calculator opens desmos.com in a
   new window instead). Adaptive Module 2 is not attempted.
4. **More templates.** Grow each skill past the gate's floor so skill drills
   rarely hit the cap, and add a second batch of topics to each Reading and
   Writing template.
5. **ACT templates.** ACT sections still use fixed banks with the same
   weaknesses the SAT banks had.
6. **Stronger construct-validity gates.** Reject multiple-choice options that
   are one expression written two ways (evaluate each algebraic choice at
   several values of x), and cap test-wiseness tells per template: topic-word
   overlap with the stem and eliminating absolutes, alongside the longest
   choice.
7. **Split `src/lib/core.js` into focused modules** (filtering, scoring,
   sessions, analytics, recommendation, storage) behind the same tests, and
   `src/app/app.js` into view components.
8. **Carry progress between devices.** Local storage is per browser. A
   download-and-restore progress file works without a server.

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
