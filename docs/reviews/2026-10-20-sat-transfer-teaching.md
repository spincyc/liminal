# SAT Math teaching and transfer review — 2026-10-20

## Problem and resulting materials

The revision addresses Math practice that goes well with a named method but
does not reliably transfer to unfamiliar questions. The supplied domain
report made Geometry and Trigonometry the first teaching priority, while
Algebra, Advanced Math and data work still needed attention and Reading and
Writing needed maintenance. Personal scores are not included in the public
materials. Domain bars and ranges remain performance bands, never exact
topic scores or percentages correct.

The four geometry lessons now contrast competing measurements and methods:
perimeter versus coverage versus capacity; perpendicular height versus a
slanted side; radius versus diameter versus radius squared; angle labels
versus the requested angle; corresponding sides under reordered vertex
labels; and trig ratios versus actual side lengths. They add two worked
examples and seven independent exercises without visible first steps.
Existing anchors, examples, exercises and Hard sections are preserved.

The new `sat/general/math-transfer` lesson adds two interleaved eight-question
sets and two teaching exercises. Students record the requested quantity,
their chosen relationship and their result before opening feedback. Set B
changes the unknown or representation and is attempted on a later day.
Half of each set is geometry; the other half samples Algebra, Advanced Math
and data. This is a finite teaching check, not comprehensive topic coverage
or an official diagnostic. Answers link to repairs and print at the end.

The Math plan supplies a geometry-first route from the first week, keeps
the other Math domains active, and adds short Reading and Writing
maintenance emphasizing evidence, inferences, transitions and rhetorical
goals. Stagnation guidance distinguishes incorrect setup, execution,
requested quantity and pace. The automatic two-track plan is unchanged;
the materials explicitly explain how to start the targeted geometry work.

## Independent review

- `/root/math_transfer_audit` reviewed 15 Algebra, Advanced Math and data
  lesson structures and independently solved nine generated questions
  before inspecting keys. All nine answers and explanations agreed.
  The finding was a teaching bridge missing between scaffolded examples
  and independent selection, not an absence of existing mixed practice.
- `/root/geometry_teaching` authored the four geometry lesson revisions;
  `/root` authored the general lesson and study-plan revisions.
- `/root/cold_content_review`, neither author, independently solved 24 of
  the final new exercises before seeing keys, then reviewed explanations,
  new worked examples, band interpretation and behavior claims. All agreed;
  no blocking correctness or ambiguity finding remained.
- One draft checkpoint repeated an existing chord exercise. The coordinator
  replaced it with a different unknown: given chord length and perpendicular
  distance, find circumference. The cold reviewer saw its replacement key
  before recording a fresh solution, so `/root/math_transfer_audit`
  separately solved that final problem blind: half-chord 8, distance 6,
  radius 10, circumference 20π. Thus all 25 final new exercises have an
  independent solution. Reordering the unchanged problems to interleave
  domains did not change any answer.

The generated-question sample was `linear-equation-solve`/941 (−8),
`linear-table-unknown-entry`/942 (−45), `system-intersection-region`/943 (2),
`quadratic-square-root-solve`/944 (−2), `exponential-table-model`/945 (1024),
`shifted-exponential-recovery`/946 (6), `percent-of-a-quantity`/947 (265),
`weighted-mean-groups`/948 (45), and `fit-slope-rescaled-units`/949 (1400).
These are samples, not verification of all draws or empirical calibration.

## Verification and limits

The full repository gate (`node tools/check-all.js`, the documented
equivalent of `npm run check` where npm is unavailable) passed, including
997 tests, content validation, build, static smoke checks, Learn links and
template-review admission. Learn validation covers 29 skill pages, nine
general pages, 381 template routes and 31 dated, sourced facts.

Chromium/ChromeDriver checked the new lesson, the geometry-first plan link
and all four revised lessons at 1280px and 320px. No horizontal page overflow
or browser errors occurred. All answers began hidden. Keyboard Enter opened
the answer disclosure; closing restored its state. The new lesson rendered
all 18 exercises with no visible first steps. The actual PDF kept problems
before the collected answer key, including an answer opened on screen.

Remaining limits are material to interpreting the change:

- There is no measured score gain or student learning study. Unfamiliar
  official questions and subsequent official tests must check transfer.
- Learn graph instruction still lacks rendered plotted-figure examples;
  prose and equation checks do not establish visual graph-reading transfer.
- `system-intersection-region` seed 943 has a redundant second positivity
  condition, making that sampled Hard draw shallower than its stated
  two-condition rationale. Its answer is valid. Re-tiering or changing
  source needs a variant-level review and renewed source-bound template
  reviews; this teaching revision does not change templates or claim their
  difficulty is calibrated.

The report describes sampled agent review, not human editorial approval.
Scratch evidence and generated PDFs are disposable under `.scratch/`.
