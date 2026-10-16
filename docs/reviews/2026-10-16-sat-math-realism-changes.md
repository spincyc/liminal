# SAT Math realism changes: author notes, 2026-10-16

These are the **author's notes** for approved changes 2 and 7 of the
2026-10-16 learning-loop review. They are not the independent review:
`content/template-reviews.json` is unchanged, and every template listed under
"Stale templates" needs a reviewer other than the author before
`tools/check-template-reviews.js` passes again.

The changes are:

- **Change 2.** Tiers were moved so that official-Medium question types are
  Liminal Medium and over-tiered Medium types are Easy.
- **Change 7.** Templates were added for the official question types the
  corpus lacked.

The tier labels are editorial judgements against the official bands, not
measured difficulty.

Baseline `feature/sat` at e87395b: 200 SAT Math templates (48 Easy / 102 Medium /
50 Hard). Result: 217 templates (52 / 118 / 47).

## Method

- **Audits.** Two audits blind-solved every SAT Math template on 2026-10-16
  (lanes A and B of that review). Each of their tier judgements was treated
  as a proposal.
- **Blind reads.** Before moving any template, the author read at least three
  seeds as a strong test-taker, with the key hidden, then checked the key and
  explanation.
- **New templates.** Every new template was read the same way, on at least
  three seeds of its final source. Every blind answer matched its key.
- **Who did the work.** Three sub-lanes of the templates lane did the work
  in parallel: Algebra, Advanced Math, and Problem-Solving and Data Analysis
  with Geometry. The lane author spot-checked each sub-lane's new templates
  blind on further seeds (31–33).
- **Notation.** Rubric scores below are in the order steps, concept,
  interpretation, distractors, abstraction, synthesis, trap.

## Re-tiers

| Template | Skill | Old → new | Rubric old → new | Reason | Seeds read |
| --- | --- | --- | --- | --- | --- |
| literal-equation-factor-target | Linear equations in one variable | Hard → Medium | 9 → 8 (1,1,1,2,2,0,1) | Gather the target and factor it out: one known move in an unfamiliar form; official Medium | 1, 2, 3, 5, 21–23 |
| linear-equation-two-quantities | Linear equations in one variable | Hard → Medium | 9 → 8 (1,1,2,2,1,0,1) | One modelling translation with a delayed start; official Medium | 1–3, 21–23 |
| linear-table-unknown-entry | Linear functions | Hard → Medium | 10 → 7 (1,1,1,2,1,0,1) | Two slope expressions set equal; official Medium | 1–3, 21–23 |
| line-intercept-conditions | Linear equations in two variables | Hard → Medium | 10 → 8 (1,1,1,2,2,0,1) | Slope −b/a plus one relation; official Medium | 1–3, 21–23 |
| inequality-graph-region | Linear inequalities | Hard → Medium | 10 → 7 (1,1,2,1,1,0,1) | Read the boundary lines, then test a point, with solid versus dashed boundaries; official Medium | 1–3, 21–23 |
| inequality-two-variable-context | Linear inequalities | Medium → Easy | 7 → 3 (1,0,1,0,0,0,1) | Writing ax + by ≥ c from words; official Easy. The "which combination is possible" form is the heaviest. | 1–10, 21–23 |
| absolute-value-cases | Nonlinear equations | Hard → Medium | 10 → 7 (1,1,1,1,1,0,2) | \|linear\| = linear with a case check; official Medium | 1–6 |
| average-rate-required-leg | Ratios, rates, and units | Hard → Medium | 9 → 7 (1,1,1,2,0,0,2) | The average fixes the total time, then three short steps; official Medium | 1–3 |
| data-change-statistics | One-variable data | Hard → Medium | 10 → 8 (1,1,2,2,1,0,1) | Compare SD or mean from frequency columns; must-be-true after a change; official Medium | 1–3, 5–7, 9 |
| could-be-median | One-variable data | Hard → Medium | 10 → 7 (1,1,1,2,1,0,1) | x slides the middle between two neighbours; official Medium | 1–3 |
| data-change-median | One-variable data | Medium → Easy | 5 → 3 (1,0,0,1,0,0,1) | The change and the statistic are stated exactly; official Easy | 1–3 |
| residual-actual-predicted | Two-variable data | Hard → Medium | 10 → 8 (1,1,2,2,0,0,2) | Actual = predicted + residual, point by point; official Medium | 1–3 |
| stratified-sample-total | Statistical inference | Hard → Medium | 11 → 8 (1,1,1,2,0,1,2) | Two proportional estimates, then a sum; official Medium | 1–3 |
| quadratic-must-be-true | Nonlinear functions | Medium → Hard | 8 → 11 (1,2,2,2,2,0,2) | See the note below | 1–10, 21–23 |

Every re-tier keeps its id, and the draws are unchanged except in two cases:

- **inequality-two-variable-context.** One fix in this template: "a $8 fee"
  now reads "an $8 fee". This changes the displayed text in 36 of 600 draws.
- **quadratic-must-be-true.** This template was changed as explained below.

**quadratic-must-be-true.** This move reverses the 2026-10-03 relabel to Medium,
recorded in `2026-10-03-sat-math-expansion.md`. That relabel rested on branches
that familiar graph facts settle directly; the new evidence is about which
draws actually do that.

- **Standard-form draws are official Hard.** Blind reads show that these draws
  need b = −2ah, discriminant reasoning or root-sign reasoning, with a
  could-be statement always offered. Examples: two positive roots give
  ab < 0 and bc < 0; no x-intercepts gives ac > 0. The 2026-10-16 audit also
  rated the type official Hard.
- **Vertex-form draws are Medium.** In seeds 4, 8 and 10 the answer was the
  sign of k, read straight from the opening and the vertex. These are the
  directly settled branches.
- **The template is now standard form only, at Hard.** A Medium vertex-form
  sibling was built and rejected. Its statement space is too small: "k > 0"
  recurred in 36% of draws and was the key in 86% of them, against a gate
  limit of 75%. Splitting that template would need new statements. Vertex
  reading at Easy and Medium remains in quadratic-vertex-reading,
  graph-quadratic-level and vertex-from-conditions.

### Split

**expression-substitution** (Hard) drew two kinds of question:

- **The "powers" form, 55% of draws.** For example, 16^x · 64^y given
  2x + 3y. This is official Medium.
- **The "reciprocal" forms, 45% of draws.** For example, x² + 1/x² or
  x³ + 1/x³ from x ± 1/x, sometimes hidden in a quadratic. These are Hard.

The powers form moved to the Medium **expression-from-combination**, as a third
form (weights: linear 0.40, same base 0.25, different base 0.35).

expression-substitution stays Hard with only the reciprocal forms. Its
rubric goes from 11 to 10. On their own the reciprocal forms failed two
gate checks: the key was always the smallest or largest value, and only 131
items were distinct in 200 draws. The fixes:

- add the x − 1/x cube;
- widen k to 14;
- add slips on both sides of the key.

It now has 408 distinct items in 600 draws.

### Hard cells refilled

Moving 11 templates from Hard to Medium would have left five skills with fewer
than 2 Hard templates. It would also have left the Algebra domain with 10 Hard
templates. `test/sat-freshness.test.js` needs 12 to fill two consecutive full
SATs on the harder route without borrowing tiers.

Seven new Hard templates fill those gaps (see "New templates"):

| Template | Skill |
| --- | --- |
| linear-solution-parameter-condition | Linear equations in one variable |
| tiered-rate-regime | Linear equations in one variable |
| linear-percent-of-original-rate | Linear functions |
| standard-form-sign-quadrants | Linear equations in two variables |
| inequality-percent-of-total | Linear inequalities |
| crew-rate-change | Ratios, rates, and units |
| greatest-value-from-center | One-variable data |

Domain Hard counts are now Algebra 12, Advanced Math 14, Problem-Solving and
Data Analysis 13, and Geometry and Trigonometry 8. Each meets the freshness
need, which is 12, 14, 6 and 6 respectively.

## Moves declined

| Template | Proposed | Kept | Why |
| --- | --- | --- | --- |
| linear-equation-unknown-constants | Hard → Medium (M–H) | Hard | Its draws are the k² form (two candidates from matching x-coefficients, one rejected by the constants) and the "solution for every k" form, both official-Hard style. The official-Medium form (no or infinitely many solutions, one constant) is equation-solution-count, already Medium. |
| unknown-coefficient-product | Hard → Medium (M–H) | Hard | Its draws solve for a and b from a + b and ab with an order condition, or enumerate eight factor pairs for "could be". The simple official-Medium "true for all x, find k" form is now in the new Medium polynomial-multiply. |
| discriminant-parameter | Hard → Medium (M–H) | Hard | The parameter forms (b ± 12 with the positive root chosen, tangency) are official-Hard style. The new Medium quadratic-solution-count carries the no-parameter "how many real solutions" form. |
| root-sum-product | Hard → Medium (M–H) | Hard | Every draw asks for 1/r + 1/s, r² + s² or (r − s)² after rearranging. That is a symmetric-function identity on top of the sum and product, an official-Hard form. A plain "sum of solutions" would be Medium, but that is not this template. |
| equation-solution-count, linear-expression-from-equation, literal-equation-rearrange, function-constant-from-value, linear-model-interpretation, system-combination-value, system-word-totals, system-graph-two-lines, system-mixture-blend, inequality-system-check | Medium → Easy (the Algebra audit judged these Easy–Medium) | Medium | None is clearly official Easy. Each has an intermediate quantity that is the common stopping error (b before f(5); u before a multiple of u; x and y before x + y), a modelling translation, or a mixed form. The mixed forms are the unit-conversion variants of linear-model-interpretation (2 of 3 draws) and the "greatest integer k" bound form of inequality-system-check (40%), with strict and non-strict boundaries. That matches the Medium definition in `docs/difficulty-calibration.md`. Seeds 1–3 of each (and 4–7 of function-constant-from-value and inequality-system-check) were read. |

## New templates

Every new template follows the contract in `docs/question-templates.md`:

- original content;
- distractors that model named errors;
- a `verify` that takes a different route from `build`;
- a hint, an explanation, steps, principles and a trap;
- at least two surface forms.

All use existing catalog subskills only.

### Missing official question types (change 7)

| # | Type | Template | Skill / subskill | Tier (rubric) |
| --- | --- | --- | --- | --- |
| 1 | Add, subtract and multiply polynomials | polynomial-add-subtract | Equivalent expressions / factoring | Easy (3) |
| 1 | | polynomial-multiply | Equivalent expressions / factoring | Medium (5) |
| 2 | Line through a point parallel to a given line | parallel-line-through-point | Linear functions / slope | Medium (5) |
| 3 | Quadratic model, not a projectile | quadratic-context-model | Nonlinear functions / quadratic functions | Medium (5) |
| 4 | Which system of inequalities represents a context | inequality-system-from-context | Linear inequalities / systems of inequalities | Medium (7) |
| 5 | Number of real solutions | quadratic-solution-count | Nonlinear equations / quadratic equations | Medium (5) |
| 6 | Straightforward rational equation | rational-equation-solve | Nonlinear equations / radical equations | Medium (5) |
| 7 | Population density with area units | population-density | Ratios, rates, and units / unit conversion | Medium (6) |
| 8 | Line graph or time series | line-graph-reading | Two-variable data / scatterplots | Easy (3) |
| 9 | Given one trig ratio, find another | trig-ratio-from-ratio | Right triangles and trigonometry / trigonometric ratios | Medium (7) |

**1. polynomial-add-subtract (Easy) and polynomial-multiply (Medium).**

- **polynomial-add-subtract** has a difference, a sum, or a monomial times a
  trinomial. It asks which expression is equivalent, or for one numeric
  coefficient.
- **polynomial-multiply** has (ax + b)(x + c) − (x + d)², a binomial times a
  trinomial, a single coefficient, or "true for all x, find k". It is the
  Medium sibling of unknown-coefficient-product.
- **Distractors** cross two independent slips: the minus not distributed,
  (a − b)² taken as a² − b², missing cross terms, or exponents added.
- **Subskill:** factoring. The Learn page's Factoring section says expanding
  and factoring are the same skill run in opposite directions.

**2. parallel-line-through-point.**

- **Forms:** the given line is in standard form, slope-intercept form, two
  points, or an `S.plane` graph. The question asks for the new line's
  y-intercept, its equation, or k for a point (p, k) on it.
- **Distractors:** the perpendicular slope, the reciprocal slope, a sign slip
  specific to each form, and the given line's own intercept.

**3. quadratic-context-model.**

- **Revenue form:** the price rises in $1 steps and sales fall. The question
  asks for the best price, the greatest revenue, or the price for a target
  revenue.
- **Pen form:** a pen fenced on three sides. The question asks for the
  greatest area, the side along the wall, or x for a target area.
- **The root the context rules out** is always offered.

**4. inequality-system-from-context.**

- **Scenes:** five. Each has a count plus a total, or a total plus "at
  least k times as many".
- **Variables** are sometimes defined in the opposite order to the story.
- **Choices** form a 2×2 grid of two errors from: rates swapped, direction
  reversed, strict versus non-strict, ratio reversed.

**5. quadratic-solution-count.**

- **Count form:** "How many distinct real solutions" for a quadratic not in
  standard form. This includes quadratic = linear (the line–parabola case
  written as one equation), x² terms that cancel, and identities.
- **Which-equation form:** "Which of these equations has no real solution,
  exactly one, or two?"
- **No parameter.** The parameter version stays in the Hard
  discriminant-parameter.

**6. rational-equation-solve.**

- **Forms:** a/(x + p) = b/(x + q); (x + p)/(x + q) = k; 1/x ± 1/(mx) = 1/n;
  a/x = (x + b)/c. The question asks for the solution, the positive
  solution, or the sum of the solutions.
- **Subskill:** radical equations. The Learn page teaches simple rational
  equations in its #radical-equations section, with the same "clear the
  fractions, solve, and check" method. The existing Hard
  rational-equation-structure stays under quadratic equations.
- **Realism:** the proportion and ratio forms are closer to official
  Easy–Medium.

**7. population-density.**

- **Meters form:** a rectangle measured in meters; the density is asked per
  square kilometer.
- **Miles form:** an area in square miles or square kilometers. The density,
  or the count, is asked in the other unit, with 1 mile = 1.6 kilometers.
- **Distractors:** the length factor used for an area (1,000 or 1.6 instead of
  its square), an unconverted area, and a conversion in the wrong direction.

**8. line-graph-reading.**

- **Figure:** an SVG line graph in the official style: dots joined by
  segments, light gridlines, and labelled axes and tick values. Values sit
  on gridlines. `verify` reads the values back from the SVG.
- **Forms:**
  - the consecutive interval with the greatest increase or decrease;
  - how many times the value was above or below a level, with a value
    exactly on that level;
  - the change between two named times.
- **Scenes:** five, by year, month or week.
- **Alt text** lists the plotted values.

**9. trig-ratio-from-ratio.**

- **Forms:** given sin, cos or tan of A in right triangle ABC, find another
  ratio of A or of B (the complementary-angle form, sin A = cos B), or find
  a side from the ratio and one side.
- **Distractors:**
  - the leg found by subtraction instead of the Pythagorean theorem;
  - the ratio at the other angle;
  - an inverted ratio;
  - the given ratio, offered only when the other angle is asked.
- **The key's rank** among the four values is balanced: it is the smallest
  or largest value about half the time.

### Hard templates added to refill cells

| Template | Skill / subskill | Rubric | What makes it Hard |
| --- | --- | --- | --- |
| linear-solution-parameter-condition | Linear equations in one variable / solve | 12 | The solution of p(x + qa) = rx + s is an expression in a. Form 1 asks which values of a put the solution above or below c; a reversed inequality and an unchanged sign are offered. Form 2 asks for a when the solution is d more than a, or k times a. |
| tiered-rate-regime | Linear equations in one variable / solve | 10 | A rate changes past a threshold (overtime, two-tier electricity, movers, a cyclist). The student must find which piece applies before solving, and the one-rate answer, on the wrong side of the threshold, is always offered. |
| linear-percent-of-original-rate | Linear functions / slope | 12 | A linear model whose yearly change is a percent of the starting value. Percent of the current value and compounding are both offered. |
| standard-form-sign-quadrants | Linear equations in two variables / graph interpretation | 10 | Which quadrant a line ax + by = c misses, or which slope and intercept signs it must have, from the constants' signs or from pairwise products. |
| inequality-percent-of-total | Linear inequalities / solve inequalities | 11 | "How many must be added so that at least P% are …": the unknown is in both the part and the whole. P% of the current total and the wrong rounding are both offered. |
| crew-rate-change | Ratios, rates, and units / unit rates | 9 | A fixed job measured in worker-days or worker-hours; the crew changes size partway. Restarting the whole job with the new crew, and scaling time in the wrong direction, are both offered. |
| greatest-value-from-center | One-variable data / mean and median | 10 | The greatest possible largest value, or range, of n whole numbers with a given mean and median, distinct or with repeats allowed, and a least allowed value. Ignoring the cap the median puts on the upper half, or ignoring "different", gives an offered answer. |

Author concerns for the reviewers:

- **inequality-two-variable-context** is at the top of the Easy band. Its
  "bound" form fixes one variable, solves, and rounds; that form is
  Easy–Medium. If reviewers judge it Medium, split it out rather than
  rescore the template.
- **Two new templates sit on the Medium–Hard border** by the official scale:
  tiered-rate-regime, because a strong student checks the threshold quickly,
  and linear-percent-of-original-rate, whose "start value" ask is its
  lightest form.
- **standard-form-sign-quadrants** says "the x-intercept is positive" as
  shorthand for the sign of the intercept's coordinate.
- **inequality-percent-of-total** scores 34% against the blind hub strategy.
  The per-template limit is 50%, and the Hard tier overall stays at 28%.
- **quadratic-solution-count** offers "Infinitely many" as a fixed choice.
  In "which equation has two solutions", the key is sometimes the only
  equation with a negative constant. That is legitimate reasoning, and
  across draws that choice is the key only about 20% of the times it
  appears.

## Matrix before and after

| Skill | Before E / M / H | After E / M / H |
| --- | --- | --- |
| Linear equations in one variable | 3 / 3 / 3 | 3 / 5 / 3 |
| Linear functions | 3 / 4 / 2 | 3 / 6 / 2 |
| Linear equations in two variables | 5 / 3 / 2 | 5 / 4 / 2 |
| Systems of two linear equations | 2 / 6 / 2 | 2 / 6 / 2 |
| Linear inequalities | 3 / 4 / 3 | 4 / 5 / 3 |
| Equivalent expressions | 3 / 6 / 4 | 4 / 7 / 4 |
| Nonlinear equations | 2 / 3 / 4 | 2 / 6 / 3 |
| Systems of equations | 2 / 4 / 3 | 2 / 4 / 3 |
| Nonlinear functions | 3 / 13 / 3 | 3 / 13 / 4 |
| Ratios, rates, and units | 3 / 4 / 2 | 3 / 6 / 2 |
| Percentages | 2 / 7 / 2 | 2 / 7 / 2 |
| One-variable data | 3 / 5 / 3 | 4 / 6 / 2 |
| Two-variable data | 2 / 7 / 3 | 3 / 8 / 2 |
| Probability | 2 / 4 / 3 | 2 / 4 / 3 |
| Statistical inference | 2 / 5 / 3 | 2 / 6 / 2 |
| Area and volume | 2 / 9 / 2 | 2 / 9 / 2 |
| Lines, angles, and triangles | 2 / 6 / 2 | 2 / 6 / 2 |
| Right triangles and trigonometry | 2 / 4 / 2 | 2 / 5 / 2 |
| Circles | 2 / 5 / 2 | 2 / 5 / 2 |
| **Total** | **48 / 102 / 50 (200)** | **52 / 118 / 47 (217)** |

Every cell holds at least 2 templates, and each tier has at least 22.

## Verification (author)

**The families gate**, `node tools/check-families.js`, passes 217/217 for SAT
Math:

- numeric share 30.7%;
- blind hub strategy by tier: Easy 28%, Medium 27%, Hard 28%;
- look-alike pairs by tier: 26%, 26%, 25%.

**The deep pass**, `--reps 3000` (1,302,000 draws), passes 217/217, with the
same tier aggregates.

**These checks also pass:**

- `node --check` on every family file;
- `validate-content --complete`;
- `audit-questions --admission`;
- check-passages, check-science, check-shapes and check-answer-positions;
- `update-templates --check`;
- check-lesson-modules and check-weekly;
- check-ap and check-daily-reading;
- check-reading-level;
- build and smoke-static, which loads 217 SAT Math bundles;
- check-guides;
- check-learn (380 templates resolve to a Learn section);
- `node --test "test/**/*.test.js"`.

**`check-template-reviews` fails as expected**, with 154 problems:

- 129 stale reviews;
- 17 missing reviews, one for each new template;
- 8 recorded seed answers that no longer match, all on templates whose
  draws changed.

Those failures cover exactly the 146 templates listed below.

**`test/sat-math-realism.test.js`** rechecks three of the new types from the
displayed text alone, over 160 seeds each:

- quadratic-solution-count, against the discriminant of the displayed equation;
- line-graph-reading, against the values listed in the alt text;
- population-density, against the count and area in the stem.

## Stale templates

Every SAT Math template whose registry version or fingerprint differs from
`feature/sat` needs a renewed independent review. There are 146: every
template in the 12 edited skill files.

The files that were not edited were systems-of-two-linear-equations,
systems-of-equations, percentages, probability, area-and-volume,
lines-angles-and-triangles and circles. No `common.js` or `shared/` file
changed.

The list was classified by comparing 600 generated records per template,
on integer and runtime-shaped seeds, with `feature/sat`.

| Kind | Count | Templates |
| --- | --- | --- |
| New | 17 | polynomial-add-subtract, polynomial-multiply, parallel-line-through-point, quadratic-context-model, inequality-system-from-context, quadratic-solution-count, rational-equation-solve, population-density, line-graph-reading, trig-ratio-from-ratio, linear-solution-parameter-condition, tiered-rate-regime, linear-percent-of-original-rate, standard-form-sign-quadrants, inequality-percent-of-total, crew-rate-change, greatest-value-from-center |
| Draws changed | 4 | expression-substitution (600/600), expression-from-combination (308/600), quadratic-must-be-true (600/600, also Medium → Hard), inequality-two-variable-context (36/600 for the article fix, also Medium → Easy) |
| Tier only (identical records) | 12 | literal-equation-factor-target, linear-equation-two-quantities, linear-table-unknown-entry, line-intercept-conditions, inequality-graph-region, absolute-value-cases, average-rate-required-leg, data-change-statistics, could-be-median, data-change-median, stratified-sample-total, residual-actual-predicted |
| Source only (identical records, teaching text included) | 113 | Every other template in the 12 edited files (below) |

By domain (`.scratch/lane/stale-templates.txt` in the templates worktree has
the same list with old and new versions):

- **Algebra (45).**
  - Existing templates: linear-equation-solve, linear-equation-context-meaning,
    equation-solution-count, linear-equation-word-model, literal-equation-rearrange,
    linear-expression-from-equation, function-value-and-input, slope-from-two-points,
    line-intercept-read, function-constant-from-value, perpendicular-line-through-point,
    linear-function-transformation, linear-function-identity, point-on-line,
    standard-form-slope, two-variable-equation-model, linear-graph-context,
    linear-model-interpretation, line-point-shift, inequality-allowed-range,
    linear-inequality-solve, inequality-word-limit, inequality-system-check,
    inequality-integer-optimization, inequality-region-corner,
    literal-equation-factor-target, linear-equation-unknown-constants,
    linear-equation-two-quantities, linear-graph-transform-parameter,
    linear-table-unknown-entry, linear-intercept-meaning, translated-line-intercept,
    line-intercept-conditions, inequality-two-variable-context, inequality-graph-region,
    inequality-parameter-range, integer-combination-count, inequality-solution-containment.
  - New: linear-solution-parameter-condition, tiered-rate-regime,
    parallel-line-through-point, linear-percent-of-original-rate,
    standard-form-sign-quadrants, inequality-system-from-context,
    inequality-percent-of-total.
- **Advanced Math (46).**
  - Existing templates: monomial-exponent-rules, quadratic-factor-match,
    rational-expression-combine, rational-exponent-rewrite, unknown-coefficient-product,
    expression-substitution, quadratic-square-root-solve, radical-equation-solve,
    absolute-value-equation, quadratic-irrational-solutions, root-sum-product,
    extraneous-roots, factored-polynomial-intercepts, exponential-model-reading,
    quadratic-vertex-reading, projectile-height-model, exponential-table-model,
    vertex-from-conditions, exponential-rewrite, function-transformation-table,
    polynomial-factor-remainder, expression-from-combination, nonlinear-formula-rearrange,
    common-base-exponent, quadratic-structure-form, rational-equation-structure,
    absolute-value-cases, function-table-evaluate, polynomial-constant-from-remainder,
    exponential-from-words, graph-which-function, graph-transformation,
    complex-fraction-equivalence, radical-parameter-extraneous, quadratic-must-be-true,
    signed-cube-root-value, quadratic-square-coefficient, shifted-exponential-recovery,
    quadratic-zeros-in-interval, graph-quadratic-level, graph-polynomial-sign-integers.
  - New: polynomial-add-subtract, polynomial-multiply, quadratic-solution-count,
    rational-equation-solve, quadratic-context-model.
- **Problem-Solving and Data Analysis (46).**
  - Existing templates: proportional-rate-scaling, ratio-share-of-total,
    rate-unit-conversion, ratio-after-change, multi-unit-rate, average-rate-two-legs,
    list-mean-or-median, box-plot-summary, data-display-center, mean-missing-value,
    weighted-mean-groups, data-change-statistics, best-fit-line-equation,
    scatterplot-shape-and-count, scatterplot-fit-reading, two-group-fit-lines,
    uneven-table-growth, fit-slope-rescaled-units, sampling-method-choice,
    margin-and-sample-size, sample-proportion-estimate, mark-recapture-estimate,
    sample-inference, two-estimates-compare, average-rate-required-leg,
    density-cube-edge, combined-work-rate, data-change-median,
    histogram-class-intervals, compare-spread-plots, could-be-median, fit-model-choice,
    outlier-removal-fit, exponential-fit-interpretation, interval-mean-scope,
    stratified-sample-total, extreme-value-correction, fit-slope-unit-rate,
    residual-actual-predicted, experiment-scope-grid, margin-sample-size-scaling,
    residual-plot-reconstruction.
  - New: population-density, crew-rate-change, greatest-value-from-center,
    line-graph-reading.
- **Geometry and Trigonometry (9).**
  - Existing templates: right-triangle-ratio-read, special-right-triangle,
    pythagorean-two-step, trig-context-length, trig-similar-cofunction,
    unit-circle-quadrant, cofunction-complementary-angles, two-observer-elevation.
  - New: trig-ratio-from-ratio.

## Follow-ups for other owners

- **Learn pages.** Some Learn pages still describe as Hard question types that
  are now Medium:

  | Page | What it calls Hard | Template, now Medium |
  | --- | --- | --- |
  | nonlinear-equations | checking which absolute-value cases survive | absolute-value-cases |
  | one-variable-data | which changes to summary statistics must happen | data-change-statistics |
  | ratios-rates-and-units | the speed one part of a trip needs | average-rate-required-leg |
  | statistical-inference | combining separately drawn samples | stratified-sample-total |

  Population density, parallel lines and line graphs have Learn sections
  (unit conversion, slope, scatterplots), but their examples could mention
  the new forms.
- **Rational equations.** The Learn page should keep its rational-equation
  paragraph and example in #radical-equations, because
  rational-equation-solve links there.
- **Desmos routes.** Routes are keyed by template id, so the new templates
  need routes where Desmos is a real route. Good candidates are
  quadratic-solution-count (graph both sides and count the intersections),
  rational-equation-solve, quadratic-context-model and
  trig-ratio-from-ratio (side lengths).

## Pass 2 fixes (after independent review)

Three independent reviewers reviewed the 146 stale templates at 2928051. Their
evidence is in `2026-10-16-sat-math-review-algebra-geometry.md`,
`2026-10-16-sat-math-review-advanced.md` and `2026-10-16-sat-math-review-data.md`.

- **Blind solves:** 495, every one agreeing with the key.
- **Accepted:** 141. **Rejected:** 5.
- **Tiers:** two of the new Hard refills were judged one band too high.

This pass, made on the integrated `feature/sat` at fa9b23c, fixes every
rejection, makes the two refills honest, fixes every wording slip the
reviewers listed, and adds regression checks. The author is the same
templates lane, so the 147 templates listed below need renewed independent
review.

### The five rejections

| Template | Defect | Fix |
| --- | --- | --- |
| inequality-percent-of-total | "1 of whom are seniors" when the starting count was 1 | The starting count is now drawn from 2 up; no scene can show a count of one |
| line-intercept-conditions | "Assumes the two intercepts are equal" was offered in the b − a form, where it cannot apply | That slip is offered only in the a + b form. The b − a form offers the opposite-intercepts slip instead (a = −b, so b − a = 2b) with its own value and reason |
| quadratic-context-model | The "count" rationale described the count at the other, rejected price; "price of a boxs" in the stem | The count is now N − D·x at the chosen price, with its arithmetic shown. The stem reads "Of the two prices that give this revenue". Each scene has its own "no sales" phrase |
| data-change-statistics | The explanation said the greater-SD set had more values at the extremes and fewer at the center when the counts did not show it (about 17% of symmetric draws); the mirror form said "more at the high end" when the end counts were equal | Draws are kept only when the counts support the explanation's statement. That happens exactly when the explanation's comparison holds, and then 8 × outer + 2 × inner in step², and so the SD, is larger too. The explanation and steps now give both sets' counts. `test/sat-math-realism.test.js` rechecks the counts from the table |
| density-cube-edge | kg/m³ draws printed rounded cubic-meter volumes inside exact equations ("0.008 × 1,000,000 = 7,992") | Volumes are printed exactly, to up to six decimal places ("0.007992 cubic meters"), and a regression test checks every printed equation |

### Tier honesty for the two Hard refills

- **tiered-rate-regime → Medium.** The reviewer's judgement is accepted: once
  a strong student compares the total with the amount at the threshold, one
  equation in one piece remains. The cyclist scene has no real threshold
  decision at all. The rubric goes from 10 to 7 (2,1,1,2,0,0,1). The draws
  are unchanged, so its Desmos route still holds.
- **New Hard: line-intercept-parameter-range** (Linear functions /
  intercepts, rubric 11 = 1,2,1,2,2,1,2). It keeps the Algebra domain at the
  12 Hard templates `test/sat-freshness.test.js` needs.
  - **Slope form.** A line with unknown slope m passes through a fixed point,
    and its x-intercept must lie to one side of a value. The question asks
    which set of slopes, or which slope, is possible.
  - **Why it is Hard.** The parameter sits in a denominator, so clearing it
    without regard to its sign reverses the inequality. That set is offered,
    along with the boundary slope and slopes of the wrong sign.
  - **Intercept form.** A line through a fixed point and (0, b); the question
    asks for the greatest integer b that keeps the x-intercept beyond a
    value. A case split on the sign of b − q decides it.
  - **verify** bisects for each x-intercept and scans the parameter.
  - Seeds 51–57 and 81–84 were read blind by the sub-lane, and 91–93 by the
    lane author. All match the key.
- **crew-rate-change → made genuinely Hard, kept Hard.** The Medium forms
  were dropped: "how long after the change" and "the whole job" only divide
  the work left by a new crew. The Medium combined-work-rate already asks a
  harder version of that question. Two forms remain:
  - "How many more must join to finish k units early": the work left over
    the time left, less the crew already working. The reviewer judged this
    form closest to Hard.
  - "For how long did the original crew work before the others joined",
    given that the job finished early: an equation with the joining time as
    the unknown, n·d + (n + k)(T − d) = n·D. Offered slips:
    - the time after the change;
    - the saved time valued at the larger crew's rate;
    - the planned finish used instead of the actual one;
    - the whole job divided by the larger crew.
  - The rubric goes from 9 to 11 (2,2,2,2,1,0,2). `verify` simulates every
    whole joining time.
  - Seeds 1–6 and 8 were read blind; all match the key.

Hard templates per cell stay at 2 or more. Algebra has 12 Hard and the domain
counts meet the freshness test.

### Wording slips fixed

The visible slips in the table below changed what students see. In each
case only the named field changed, as the stale list below records.

| Template | Fix |
| --- | --- |
| linear-percent-of-original-rate | "a 8%" now uses `S.article` |
| linear-table-unknown-entry | Negative factors are in parentheses: "4 · (−3a)" |
| inequality-two-variable-context | x and y are defined in the bound-form and pair-form explanations (the bound form was not split) |
| standard-form-sign-quadrants | "The x-coordinate of the x-intercept" and "the y-coordinate of the y-intercept", in choices, steps and rationales |
| linear-expression-from-equation, line-intercept-read, line-intercept-conditions, rational-equation-solve | No "x = −17, so x = −17" clause when the coefficient is 1 |
| quadratic-must-be-true | The two dead fact entries were removed, which changes which fact is drawn (302/600). The doubled "so a > 0" was trimmed |
| polynomial-multiply, quadratic-factor-match, quadratic-solution-count, rational-equation-solve, rational-expression-combine | A coefficient of one is no longer written out: "−k", "x² + x − 12", "x/(x + 5)" |
| exponential-table-model | "f(x) = 4^x", not "1(4)^x", in choices and teaching text |
| exponential-rewrite | "an 87.5% decrease" and two more percent sites now use `S.article` |
| nonlinear-formula-rearrange | "the given formula" (Math shows the formula above the stem) |
| absolute-value-cases | The slip rationale says the candidate passes the sign check, not the equation |
| absolute-value-equation, exponential-from-words | Exact fractions, or "about", instead of cut-off decimals |
| crew-rate-change | `plural()` for every count of time ("1 hour"), and the hint no longer names the method; the punctuation and shrinking-crew slips went with the dropped forms |
| population-density | `plural()` for "1 kilometer" and "1 square kilometer" |
| average-rate-required-leg | The trap's distance-weighted slip prints exactly or as "about 59.67" |
| stratified-sample-total | The rationale describes the computation: each group's sample count scaled by the other group's ratio of group size to sample size |
| weighted-mean-groups | The trap prints "about 4.33" |
| uneven-table-growth | The trap prints "about …" instead of a cut-off decimal |
| fit-model-choice | Ratios print exactly to three decimals or as "about 0.889" |
| scatterplot-fit-reading | No "each square is 1 unit" contradiction when gridlines are 1 apart |
| combined-work-rate | No "18 = 18 minutes" when the fraction is a whole number |
| histogram-class-intervals | "the mean of values number 14 and 15" |
| ratio-after-change | "9k and k", and no factor of 1 in the cross-multiplied equation |
| trig-ratio-from-ratio | The add or subtract slip names the sides it uses ("Finds XZ as XY − YZ") and is offered only when that side is the one asked |

### Regression checks

- **`test/sat-math-text.test.js`** scans 400 draws of every SAT Math template.
  It checks every field a student can see, rationales and teaching text
  included. It looks for:
  - a count of one with a plural noun;
  - "1 of whom are";
  - "a" before a vowel-sound number, or "an" before a consonant-sound one;
  - a written-out coefficient of one.

  Five pre-existing hits sit in files this change did not edit. They are
  listed by name in the test, because fixing them would put 42 more templates
  up for review:

  | Template | File | Slip |
  | --- | --- | --- |
  | frequency-distribution-probability | probability | "the 1 students" |
  | inscribed-composite-solids | area-and-volume | "a 8-by-8 patch" |
  | volume-unit-conversion | area-and-volume | "1 liters" |
  | regular-polygon-angle-ratio | lines-angles-and-triangles | "1u" |
  | system-word-totals | systems-of-two-linear-equations | "1b = 23" |

  Fix each one, and remove it from the list, the next time its file is
  edited.
- **`test/sat-math-realism.test.js`** gains the data-change-statistics and
  density-cube-edge checks described above.

### Desmos routes

These checks used the desmos lane's verifiers, copied so they run against
this tree.

| Template | Seeds | Result |
| --- | --- | --- |
| quadratic-context-model | 200 | 200 ok |
| inequality-percent-of-total | 400 | 158 ok, 242 out of the route's scope |
| standard-form-sign-quadrants | 400 | 400 ok |
| trig-ratio-from-ratio | 200 | 200 ok |
| polynomial-multiply | 200 | 156 ok, 44 out of scope |
| quadratic-solution-count | 200 | 200 ok |
| rational-equation-solve | 200 | 200 ok |
| tiered-rate-regime | 200 | 200 ok |
| exponential-table-model | 40 | 40 ok (that verifier's fixed count) |
| average-rate-required-leg, uneven-table-growth, fit-model-choice | 200 | 200 ok each |

**standard-form-sign-quadrants** needed only the verifier's expected wording
updated for "x-coordinate of the x-intercept". The route text names no
wording, so the route is unchanged.

**`content/desmos-routes.json`:** one change. The tiered-rate-regime entry
moved before linear-solution-parameter-condition, to follow the templates'
order after the re-tier; `check-desmos` passes.

No route text changed, and line-intercept-conditions has no route.

### Pass 2 matrix

218 templates (52 / 119 / 47). The pass-1 matrix changes in two rows:

| Skill | Pass 1 (E / M / H) | Pass 2 (E / M / H) |
| --- | --- | --- |
| Linear equations in one variable | 3 / 5 / 3 | 3 / 6 / 2 |
| Linear functions | 3 / 6 / 2 | 3 / 6 / 3 |

Domain Hard counts are Algebra 12, Advanced Math 14, Problem-Solving and Data
Analysis 13, and Geometry and Trigonometry 8.

### Pass 2 verification

- **Families gate:** `node tools/check-families.js` passes 218/218 for SAT Math:
  - numeric share 30.7%;
  - hub strategy by tier 28/27/28%;
  - look-alike pairs by tier 26/26/24%.
- **Deep pass:** `--reps 3000` passes 218/218.
- **All other checks pass:**
  - syntax, `validate-content --complete`, `audit-questions --admission`;
  - passages, science, shapes, answer positions;
  - `update-templates --check`, check-desmos;
  - lesson modules, weekly, AP, daily reading, reading level;
  - build and smoke-static (218 bundles);
  - check-guides and check-learn (381 templates resolve);
  - `node --test "test/**/*.test.js"` (972/972).
- **`check-template-reviews`** fails only for the stale templates below.

### Pass 2 stale templates (147)

Every SAT Math template whose registry fingerprint differs from fa9b23c. Each
was classified by comparing 600 draws (300 integer and 300 runtime-shaped
seeds) with fa9b23c's source. The comparison covered:

- the displayed question (stem, stimulus, figure, choices) and the key;
- the rationales;
- the explanation, steps, principles, trap and hint.

`.scratch/lane/stale-templates-pass2.txt` in the templates worktree lists each
template with its versions.

**Draws changed (37).** Counts are out of 600 draws. "Shown" means the
displayed question differs; "text" means only the teaching text or rationales
differ.

| Template | Change |
| --- | --- |
| line-intercept-parameter-range | new |
| crew-rate-change | shown 600 |
| standard-form-sign-quadrants | shown 290, text 310 more |
| inequality-percent-of-total | shown 327 |
| nonlinear-formula-rearrange | shown 314 |
| quadratic-must-be-true | shown 302, text 118 more |
| quadratic-context-model | shown 103, text 15 more |
| data-change-statistics | shown 26, text 114 more |
| exponential-table-model | shown 23 |
| line-intercept-conditions | shown 11, text 12 more |
| tiered-rate-regime | tier only, identical draws (Hard → Medium) |
| inequality-two-variable-context | text 354 |
| density-cube-edge | text 317 |
| stratified-sample-total | text 289 |
| fit-model-choice | text 278 |
| linear-table-unknown-entry | text 229 |
| ratio-after-change | text 205 |
| average-rate-required-leg | text 161 |
| histogram-class-intervals | text 130 |
| combined-work-rate | text 86 |
| quadratic-factor-match | text 81 |
| trig-ratio-from-ratio | text 75 |
| scatterplot-fit-reading | text 59 |
| linear-expression-from-equation | text 54 |
| absolute-value-cases | text 50 |
| rational-equation-solve | text 37 |
| absolute-value-equation | text 24 |
| weighted-mean-groups | text 22 |
| rational-expression-combine | text 21 |
| line-intercept-read | text 14 |
| exponential-from-words | text 14 |
| uneven-table-growth | text 11 |
| polynomial-multiply | text 10 |
| exponential-rewrite | text 8 |
| population-density | text 4 |
| quadratic-solution-count | text 4 |
| linear-percent-of-original-rate | text 2 |

**Source only, identical draws (110).** Every other template in the 12
edited skill files: 36 Algebra, 33 Advanced Math, 33 Problem-Solving and Data
Analysis, and 8 Geometry and Trigonometry.

## Pass 3 fixes (after the cold content review)

All 147 pass-2 templates were accepted by independent review and committed at
3f8e23a. A cold content review then blind-solved 74 template draws, all
correct, and found the issues below. This pass, made on 3f8e23a, fixes them.

### Ambiguity and tier honesty

- **greatest-value-from-center.** Two kinds of draw changed.
  - **The problem.** "7 different whole numbers" did not say whether 0 is
    allowed, and the key needed it.
  - **The fix.**
    - That set now says "different nonnegative integers". The basketball
      scene says "a whole number of points, possibly 0".
    - The explanation and steps name the least value used ("starting from 0,
      the least value allowed").
    - With repeats allowed and 5 values, starting the smaller values one too
      high gives the same number as forcing all the values to differ. That
      choice now gets one rationale naming both slips.
- **linear-solution-parameter-condition (Hard).** Every draw now has a sign
  decision to make.
  - **Dropped:** the "solution is k times a / d more than a" form, two linear
    steps and official Medium.
  - **Kept:** the "which values of a" form, which needs the sign reversal.
  - **Added:** a numeric form, "the greatest (or least) integer value of a",
    where the reversal and the strict boundary both matter.
  - **Forced:** when the inequality needs no reversal (u > 0), the equation
    is divided by a negative number on the way to x (k < 0), so the
    unnecessary reversal is always a live trap.
  - Rubric unchanged (12). Algebra keeps 12 Hard templates.
- **inequality-percent-of-total (Hard).**
  - **Dropped:** the "which inequality represents this" form, a single
    translation step and official Medium.
  - **Remaining forms:** the least number to add (at least / more than) and
    the greatest number that may be added (at most / less than). Each is
    solved and rounded, multiple choice or numeric.

### Text slips

| Template | Fix |
| --- | --- |
| trig-ratio-from-ratio | The Pythagorean step is written in k throughout: "DF = √((37k)² − (12k)²) = 35k" |
| trig-ratio-from-ratio, population-density, multi-unit-rate, trig-context-length | Numeric-entry traps no longer mention "an offered choice" or "the other choices" |
| crew-rate-change | The step now introduces the time left on the plan before subtracting the time saved |
| inequality-system-from-context | Each scene names what it counts (tickets, acres, balls, hours, crates) instead of "items" |
| quadratic-solution-count | An equation already "= 0" gets a sign-reading trap and hint, not "move every term to one side" |
| inequality-two-variable-context | The worker now rides in the elevator, so the worker's weight belongs in the model; the bound is "1,396 ÷ 27 ≈ 51.7", not an improper fraction |
| expression-substitution | When the equation hides x ± 1/x, the hint asks for that rewriting instead of jumping to squaring or cubing |
| population-density | Counts of residents or animals offer only whole-number wrong answers; two whole-number slips were added for that form |
| rational-equation-solve | "5(x + 9) = x − 7", not "1(x − 7)" |

The optional quadratic-must-be-true "so a > 0" trim was not made: its file is
not otherwise edited in this pass.

### Regression checks

`test/sat-math-text.test.js` adds a check that numeric-entry items never
mention offered choices: "offered", "answer choice(s)", "other choices" or
"the choices".

- **Known case:** altitude-hypotenuse-similarity, in a file this change did
  not edit. It is listed by name, as before.
- **Speed:** both scans now share one set of draws, about 9 seconds in all.

### Desmos routes

These checks used the desmos lane's verifiers, copied so they run against
this tree. `content/desmos-routes.json` is unchanged in this pass.

| Template | Seeds | Result |
| --- | --- | --- |
| linear-solution-parameter-condition | 400 | 400 ok, 163 of them the new integer form |
| inequality-percent-of-total | 400 | 400 ok, 170 of them the greatest form |
| quadratic-solution-count | 300 | 300 ok |
| rational-equation-solve | 300 | 300 ok |
| trig-ratio-from-ratio | 300 | 300 ok |
| trig-context-length | 200 | 200 ok |

**The verifier copy now checks two more forms.**
- The integer form takes the nearest whole a beyond the edge, on the asked
  side.
- The greatest form takes the last whole number before the crossing, and
  keeps a whole-number crossing only for "at most".

**Route text the desmos lane may want to update** (it owns route text):
- **linear-solution-parameter-condition:** the route still mentions the
  dropped "x = 2a or x = a + 3" form. It could add that for the integer form
  the answer is the nearest whole a past the edge, never the edge.
- **inequality-percent-of-total:**
  - The read text describes only the least form (round up). The greatest
    form needs rounding down, with a whole-number crossing kept only for
    "at most".
  - The fails text's sentence about "which inequality" questions no longer
    applies.

### Pass 3 verification

- **Families gate:** `node tools/check-families.js` passes 218/218 for SAT
  Math (52 / 119 / 47):
  - numeric share 30.7%;
  - hub strategy by tier 28/27/28%;
  - look-alike pairs by tier 26/26/24%.
- **Deep pass:** `--reps 3000` passes 218/218.
- **All other checks pass:**
  - syntax, `validate-content --complete`, `audit-questions --admission`;
  - passages, science, shapes, answer positions;
  - `update-templates --check`, check-desmos;
  - lesson modules, weekly, AP, daily reading, reading level;
  - build and smoke-static;
  - check-guides and check-learn;
  - `node --test "test/**/*.test.js"` (980/980).
- **`check-template-reviews`** fails only for the 81 stale templates below.

### Pass 3 stale templates (81)

These are every template in the 7 edited skill files:

- linear-equations-in-one-variable;
- linear-inequalities;
- equivalent-expressions;
- nonlinear-equations;
- ratios-rates-and-units;
- one-variable-data;
- right-triangles-and-trigonometry.

Each was compared on 600 draws with 3f8e23a, covering the displayed question,
key, rationales and teaching text. `.scratch/lane/stale-templates-pass3.txt`
in the templates worktree lists them all.

**Shown changed (5):**

| Template | Displayed questions that differ (of 600) |
| --- | --- |
| linear-solution-parameter-condition | 546 |
| inequality-percent-of-total | 600 |
| greatest-value-from-center | 244, plus teaching text in 356 more |
| inequality-two-variable-context | 165, plus teaching text in 212 more |
| population-density | 61, plus teaching text in 211 more |

**Text only (8):** teaching text or rationales differ, but the questions are
identical.

| Template | Draws that differ (of 600) |
| --- | --- |
| trig-ratio-from-ratio | 600 |
| trig-context-length | 600 |
| expression-substitution | 403 |
| inequality-system-from-context | 357 |
| crew-rate-change | 303 |
| multi-unit-rate | 110 |
| quadratic-solution-count | 51 |
| rational-equation-solve | 33 |

**Identical draws (68):** every other template in those 7 files; only the
source changed.

## Pass 4 fixes (coordinator-20261016)

Two one-line text fixes after the pass-3 reviews; the coordinator is their
author, so the reviewers re-review the two files.

- `quadratic-solution-count` (`nonlinear-equations.js`): the hint for an
  equation already set to 0 named the method ("What is the sign of
  b² − 4ac?"). It now reuses the sibling form's nudge, "What decides how
  many times the graph of y = ax² + bx + c meets the x-axis?", as
  `docs/question-templates.md` requires.
- `inequality-two-variable-context` (`linear-inequalities.js`): the bound
  printed "≈" when the division came out exact (for example 38 ÷ 4 ≈ 9.5).
  It now prints "=" whenever the two-place value is exact. Of 3,000 draws,
  382 now print "=" and 861 "≈"; each sign was checked against the true
  quotient, with no mismatches.

The displayed questions are unchanged; only hint and teaching text differ.
The registry re-versions every template in the two files.
