# SAT Math Hard families

The fixed SAT Math bank's Hard tier does not train Hard. Every one of its 150
Hard items names its method in the stem ("Use the slope perpendicular
structure for this case."), most are one textbook step, and filler sentences
disguise how few distinct problems there are. A student can score well on it
and still meet the real test's second module unprepared.

`src/lib/families/sat-math-hard/` replaces that tier with **families**:
parameterized generators, each built around one thing a strong student must
*recognize*, each producing hundreds of distinct, independently verified
repetitions. They are written to `docs/difficulty-calibration.md`: Hard means
deciding what kind of problem it is before any computation is possible.

## Files

| File | Holds |
| --- | --- |
| `shared.js` | Seeded randomness, notation, SVG figure helpers, `instantiate` |
| `algebra.js` | Algebra families |
| `advanced-quadratics.js` | Advanced Math: quadratics, discriminants, roots, factoring |
| `advanced-functions.js` | Advanced Math: exponentials, extraneous roots, transformations, polynomials, substitution |
| `data-analysis.js` | Problem-Solving and Data Analysis families |
| `geometry.js` | Geometry and Trigonometry families |
| `index.js` | Node entry point listing every family file |

The gate is `tools/check-hard-math.js`; it runs as part of `npm run check`.

Every file in `src/lib/families/sat-math-hard/` is dependency-free and loads
either through `require` or as a plain browser `<script>` (after `shared.js`), which appends its families to
`window.SAT_MATH_HARD_FAMILIES`. That is what will let the app draw fresh
repetitions on demand rather than cycling a fixed bank.

## The family contract

```js
{
  id: "kebab-case-unique",
  domain, skill, subskill,        // exactly as in content/catalog.json (sat-math)
  title: "Human name",            // must never appear in a stem
  recognize: "What the student must see before computing.",
  rubric: { steps, concept, interpretation, distractors, abstraction, synthesis, trap },
                                  // 0-2 each per docs/difficulty-calibration.md; total >= 9, at least two 2s
  tricks: ["..."],                // >= 2 from the vocabulary in tools/check-hard-math.js
  build(t) { return instance; },  // t = S.tools(random): int, pick, shuffle, sign, chance, nonzero, sample
}
```

`build` returns one instance:

| Field | Notes |
| --- | --- |
| `responseType` | `"multiple-choice"` or `"numeric"` (student-produced response) |
| `stimulus` | `null`, or `{ type, content }`: `equations` (one per line), `table` (pipe rows via `S.table`), or `text` |
| `figure` | `null`, or `{ svg, alt, notToScale }` built with `S.svg` and `S.svgParts` |
| `stem` | The question alone, in the real test's register: "In the given system of equations, k is a constant. …" |
| `correct` | Number or display string for multiple choice; number for numeric |
| `wrong` | Multiple choice only: `[value, reason]` pairs, at least 3 surviving de-duplication; each reason names the specific wrong method |
| `explanation`, `steps` (≥ 3), `principles` (≥ 1), `trap`, `hint` | Shown after answering; the hint nudges without naming the method |
| `verify` | `() => boolean` that recomputes the answer **by a different route** than `build` did (substitute back, brute force, determinant, numeric root check) |
| `estimatedSeconds` | Optional; default 105 |

Rules the gate enforces:

- The stem never names the method, never tells the student to verify, and
  never contains the family title.
- Numeric keys are plain decimals that fit the real 5-character answer grid
  (a leading minus is free). `core.js` compares typed answers numerically, so
  a key must be an integer or a terminating decimal, never a fraction string.
- At least 75% of 200 repetitions are distinct, and every family has at least
  two surface forms (a different quantity asked for, or a different
  presentation), so repetitions are not the same question with new numbers.
- A `notToScale` figure must be drawn to *suggest a wrong answer*, and that
  answer must be offered, with a reason that says the drawing misled
  (multiple choice), or be named in the trap (numeric).
- Figures use `currentColor`, carry `alt` text, and contain no script.
- Across all families: 20–40% numeric (the real test is about a quarter),
  keys spread across A–D, the longest choice is not usually the key, and at
  least three families use not-to-scale figures.

## Exam tricks to reproduce

The real test's hard items rarely need more arithmetic; they punish a reflex.
Families declare which tricks they use, and each trick must be backed by a
distractor that a student falls into by committing it:

| Trick | What the offered wrong answer does |
| --- | --- |
| `not-to-scale-figure` | Reads a length or angle off a drawing labelled not to scale |
| `intermediate-value` | Stops at a quantity computed on the way |
| `wrong-quantity` | Answers a neighbouring question: x instead of 2x, the other root, the radius for the diameter |
| `unit-mismatch` | Given in one unit, asked in another |
| `sign-error` | Loses a sign while rearranging |
| `extraneous-solution` | Keeps a root that fails the original equation |
| `must-vs-could` | Picks what could be true when the question asks what must be |
| `rounding-direction` | Rounds the way arithmetic suggests rather than the way the context requires |
| `percent-base` | Takes a percent of the wrong base |
| `part-vs-whole` | Uses a part where the whole is needed, as in similar-triangle segments |
| `equivalent-form` | Choices are rearrangements; only one is truly equivalent |
| `context-constraint` | Keeps a solution the context forbids |
| `unweighted-average` | Averages averages |
| `reversed-condition` | Answers for the opposite case (infinitely many instead of none) |
| `neighbouring-rule` | Uses the rule next door: area for perimeter, sum for product |

## Commands

```sh
node tools/check-hard-math.js                      # gate, 200 reps per family
node tools/check-hard-math.js --file geometry      # one file
node tools/check-hard-math.js --sample <id> --seed 3 --svg-dir <dir>
```

`system-parameter-solution-count` in `algebra.js` is the reference family.

In the app, choose SAT Math and the *Hard math reps* practice mode. Each set
deals the families round-robin and advances a per-family seed stored with your
progress, so a set never repeats a problem you have already been served; a
missed problem keeps its family and seed in its id and can be re-served
exactly from the Missed review.
