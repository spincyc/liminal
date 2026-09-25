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
9. **A test screen that feels like the real one.** Findings from a review
   against the College Board's Bluebook app follow in their own section.
10. **Split `src/lib/core.js` into focused modules** (filtering, scoring,
    sessions, analytics, recommendation, storage) behind the same tests, and
    `src/app/app.js` into view components, so pieces can be reused.
11. **Carry progress between devices.** Local storage is per browser. A
    download-and-restore progress file works without a server.
