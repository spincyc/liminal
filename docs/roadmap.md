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

## Next

1. **Hard SAT Math families.** Parameterized generators, each built around
   what a strong student must recognize, each producing hundreds of distinct,
   independently verified repetitions with the real test's traps built in,
   including "not drawn to scale" figures that lure toward an offered wrong
   answer. They load in the browser as well as in Node, so a session can draw
   fresh repetitions instead of cycling a fixed bank. Record the family and
   seed with each attempt so a missed item can be re-served and drilled.
2. **Stop naming the method.** Remove the structure suffix and the filler from
   SAT Math stems, and let the near-duplicate gate report the true size of the
   bank rather than tuning it away.
3. **Feedback mode and question count for every session.** A *Feedback* choice
   on the practice form, *Instant* or *Report at the end* (no feedback, free
   navigation, then the summary and review flow), and a number field for the
   question count with quick picks. An optional timer at real pace: SAT Math
   35 minutes per 22 questions, Reading and Writing 32 minutes per 27.
4. **A one-click Hard Math set.** SAT Math, Hard only, the chosen count and
   feedback mode, fresh repetitions.
5. **Show Hard accuracy on its own.** Overall accuracy on a bank that is mostly
   Easy and Medium is what made practice look like 700.
6. **Render figures.** Draw a figure above its stem, with "Note: Figure not
   drawn to scale." beneath it when flagged. Parse the SVG as data with an
   allow-list of elements and attributes; never inject it as HTML.
7. **Accept equivalent numeric answers.** Typed fractions such as `3/4` should
   match a key of `0.75`, as the real test accepts both.
8. **Fix the difficulty gate** to compare measures a generator cannot set per
   tier, such as solution length or blind solvability.
9. **A test screen that feels like the real one.** A review against the
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
10. **Split `src/lib/core.js` into focused modules** (filtering, scoring,
    sessions, analytics, recommendation, storage) behind the same tests, and
    `src/app/app.js` into view components, so pieces can be reused.
11. **Carry progress between devices.** Local storage is per browser. A
    download-and-restore progress file works without a server.
12. **Reading and Writing content.** The same review found only 63 distinct
    question stems across 575 items, the identical key on all 52 Cross-Text
    items, the longest choice keyed 55% of the time when one choice is
    longest (chance is 25%), and passages with a median of 32 words. Like SAT
    Math, it rewards recognizing answer patterns over reading. It needs the
    same treatment as the math families: authored passages and generators
    built to the calibration rubric.
13. **Module and full-length simulations.** A related SAT-only prototype
    assembled 22- and 27-question module tests and a four-module, 98-question
    simulation with official times and per-module domain quotas. Build the
    same on the digital test mode, with a break screen between sections.
14. **Stronger construct-validity gates.** The same prototype rejected
    multiple-choice options that are one expression written two ways (by
    evaluating each algebraic choice at several values of x) and capped three
    test-wiseness tells per skill at 40%: topic-word overlap with the stem,
    the longest choice, and eliminating absolutes. Add both to the gates.
15. **Easy and Medium SAT content.** That prototype's in-browser generators
    cover the 31 official skill categories with clean stems (no method names)
    and gated item variety. They are a candidate replacement for the fixed
    SAT banks' Easy and Medium tiers after a sample review; their Hard tiers
    are not (see below).

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
