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
