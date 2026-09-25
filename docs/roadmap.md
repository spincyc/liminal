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

- **Hard SAT Math families** (`src/lib/families/sat-math-hard/`, 27 types),
  served fresh in the *Hard math reps* mode; each attempt records its family
  and seed, so a missed or marked problem can be rebuilt and practiced again.
- **Digital test mode** for every session, with a *Feedback* choice (after
  each question, or a report at the end), any question count with module
  quick picks, an optional timer at real-test pace, and resume after reload.
- **Hard accuracy on its own** on the Progress view and in every report.
- **Figures** rendered from sanitized SVG with the not-to-scale note.
- **Equivalent numeric answers**: fractions, decimals, and the U+2212 minus.

## Next

1. **Stop naming the method.** Remove the structure suffix and the filler from
   SAT Math stems, and let the near-duplicate gate report the true size of the
   bank rather than tuning it away.
2. **Fix the difficulty gate** to compare measures a generator cannot set per
   tier, such as solution length or blind solvability.
3. **A test screen that feels like the real one.** A review against the
   College Board's Bluebook app (2026-09-25) found the practice screen looked
   nothing like the real test. The digital test mode addresses the first
   tier; still missing afterwards:
   - Module structure on screen: two modules per section at real counts and
     times (Reading and Writing 27 questions / 32 minutes, Math 22 / 35), a
     review page between them, and the break between sections.
   - Typeset math (fractions and exponents are plain text today).
   - Highlights and notes, and a line reader, for Reading and Writing.
   - An embedded graphing calculator. Desmos requires an API key and would
     be the project's first external dependency, so the calculator opens
     desmos.com in a new window instead.
   - Adaptive Module 2, which the app does not attempt.
4. **Split `src/lib/core.js` into focused modules** (filtering, scoring,
   sessions, analytics, recommendation, storage) behind the same tests, and
   `src/app/app.js` into view components, so pieces can be reused.
5. **Carry progress between devices.** Local storage is per browser. A
   download-and-restore progress file works without a server.
6. **Reading and Writing content.** The same review found only 63 distinct
   question stems across 575 items, the identical key on all 52 Cross-Text
   items, the longest choice keyed 55% of the time when one choice is
   longest (chance is 25%), and passages with a median of 32 words. Like SAT
   Math, it rewards recognizing answer patterns over reading. It needs the
   same treatment as the math families: authored passages and generators
   built to the calibration rubric.
7. **Module and full-length simulations.** A related SAT-only prototype
   assembled 22- and 27-question module tests and a four-module, 98-question
   simulation with official times and per-module domain quotas. Build the
   same on the digital test mode, with a break screen between sections.
8. **Stronger construct-validity gates.** The same prototype rejected
   multiple-choice options that are one expression written two ways (by
   evaluating each algebraic choice at several values of x) and capped three
   test-wiseness tells per skill at 40%: topic-word overlap with the stem,
   the longest choice, and eliminating absolutes. Add both to the gates.
9. **Easy and Medium SAT content.** That prototype's in-browser generators
   cover the 31 official skill categories with clean stems (no method names)
   and gated item variety. They are a candidate replacement for the fixed
   SAT banks' Easy and Medium tiers after a sample review; their Hard tiers
   are not (see below).

10. **Remove quiz-era styles.** The old question and results screens are
    gone; about 40 class selectors in `src/styles/app.css` served only them.
    Some classes are built dynamically, so prune rule by rule with a browser
    check, not by a text search.

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
