# Nonlinear graph templates: independent sampled review

Date: 2026-10-03. Reviewer: `/root/review_sat_nonlinear`. New-template author:
`/root/sat_graphs`. Scope: all 19 templates in
`src/lib/families/sat/math/advanced-math/nonlinear-functions.js`.

## Decision and source impact

Accepted for independent sampled-review admission: both new templates and all 17
existing siblings, at their current provisional tiers. Initial presentation
defects were corrected and rechecked before this decision. No unresolved defect
was found in the reviewed samples.

Final reviewed file SHA-256:
`129144f8e2c44bc631f92de63742ab36ddce49957fb1021f680e5a8a2cc7f660`.
The registry's transitive source fingerprint is recorded separately by the
coordinating agent.

The source diff adds `graph-quadratic-level` and
`graph-polynomial-sign-integers`; 16 existing sibling definitions are unchanged.
The existing `exponential-rewrite` also receives a copy correction in one solution
step, from “Over year” to “Over 1 year”, with no changed displayed problem or key.
All siblings' fingerprints change because the registry fingerprints whole source
files. Each sibling received three fresh independent solves, rather than an
automatic approval refresh.

## Blind procedure and answers

I required the module and `shared.instantiate` without reading its implementation,
and generated packets restricted to displayed fields: template identification,
difficulty, seed, response type, stem, stimulus, figure, and choices. I recorded
answers and mathematical reasoning in the review scratch area before reading any
answer key, explanation, or build source. Every baseline triple has three distinct
displayed items, not just reordered choices. I subsequently compared the recorded
answers with the keys and read the hints, solution steps, principles, traps, and
multiple-choice distractor rationales.

The table records seeds `graph-review-0`, `graph-review-1`, and `graph-review-2`
in order. Letters identify displayed multiple-choice answers; bare numbers are
student-produced responses. All 57 baseline answers matched the keys.

| Template | Independent answers | Coverage and competing interpretations |
| --- | --- | --- |
| `factored-polynomial-intercepts` | 12; A; B | y-intercept substitution; factor signs; a nonunit linear factor |
| `exponential-model-reading` | B; 4840; B | initial amount versus rate; evaluating two growth periods |
| `quadratic-vertex-reading` | 1; 2; C | equation and table; extreme value versus its input; signs of vertex coordinates |
| `projectile-height-model` | C; D; 2 | vertex height; initial-height recurrence; selecting the later of two times |
| `exponential-table-model` | 1; A; B | forward and backward extrapolation; reciprocal factor and first-row coefficient errors |
| `function-table-evaluate` | A; 0; D | table with equation and paired tables; order of composition versus multiplication |
| `polynomial-constant-from-remainder` | 12; A; −12 | factor and nonzero-remainder forms; divisor sign and final division |
| `exponential-from-words` | D; D; D | growth and decay; elapsed periods; splitting a compounding percentage |
| `graph-transformation` | C; C; D | point image, function value, and maximizing input; inside/outside shift signs |
| `vertex-from-conditions` | A; −20; B | recover coefficient from vertex and point; equal-height symmetry; input versus maximum |
| `exponential-rewrite` | D; A; 368 | extract an annual factor; compound three periods; recover a shifted coefficient |
| `function-transformation-table` | A; A; −6 | unlisted vertex; recover curvature before applying vertical and horizontal shifts |
| `polynomial-factor-remainder` | C; C; B | division statement and rational identity; polynomial value versus quotient value |
| `graph-which-function` | D; D; D | cubic multiplicity/end behavior, exponential asymptote, quadratic roots/scale |
| `quadratic-must-be-true` | A; A; A | coefficient signs; standard and vertex forms; necessary versus possible statements |
| `shifted-exponential-recovery` | C; C; A | differences remove the shift; input spacing two; negative coefficient; coefficient versus f(0) |
| `quadratic-zeros-in-interval` | C; −18; D | distinct real roots, midpoint location, strict endpoint constraints, integer sum |
| `graph-quadratic-level` | 2; 3; 1 | marked vertex/point determine curvature; off-window height; larger root |
| `graph-polynomial-sign-integers` | 3; 6; 6 | strict positive/negative conditions, nonstrict equality, isolated touching zero |

Both new templates also received independent blind solutions at seeds
`graph-review-3` through `graph-review-8`, bringing the total to 69. Quadratic
answers were `0, −2, −1, 2, 0, −4`; polynomial-sign answers were
`−3, 1, 7, 6, 21, 6`. All matched their keys. These add smaller-root requests,
both parabola openings and horizontal shift signs, all four inequality relations,
count and sum requests, both orders of the crossing/touching zeros, endpoint
inclusion, and a touching zero isolated from the requested sign region.

## Mathematical and editorial assessment

The sampled questions have a single defensible answer. In the new quadratic
design, the explicitly marked vertex and second point uniquely determine the
quadratic; the requested height is outside the displayed window, so a solver must
recover its equation and choose the requested root. In the cubic design, the
stated cubic degree, complete intercepts, touching/crossing behavior, and end
direction determine its sign regions. Equality requires retaining zero inputs,
including a touching zero whose neighboring values have the opposite requested
sign. The explanations enumerate the correct integer set before counting or
summing it.

Medium is a reasonable provisional editorial tier for both new numeric designs.
The quadratic requires recovering a coefficient and then solving a new level; the
cubic requires combining graph signs, equality, the closed input interval, and the
requested aggregate. Numeric items have no multiple-choice distractors; their
traps address choosing the wrong root, reading beyond the graph window, reversing
sign at a touch, excluding or including zeros incorrectly, and answering a count
instead of a sum. The sampled sibling distractors correspond to plausible wrong
methods and do not introduce a second correct answer. Hints guide attention without
giving the numerical answer.

## Figures, findings, and limits

Chromium galleries of all three baseline samples for `graph-transformation`,
`graph-which-function`, and both new designs were visually inspected. Geometry,
marked points, curvature, crossing/touching behavior, and the text alternatives
agree in those samples. The new cubic graphs clearly distinguish crossing from
touching. Alt text supplies the same graph data without stating the requested root,
integer count, or sum.

The initial quadratic figure at `graph-review-2` placed `(−3, −9)` over the y-axis
tick `−10`; the initial `graph-review-0` vertex label was crowded by x-axis ticks,
and the `graph-review-6` point label crossed a parabola arm. These versions were
returned to the author before acceptance. The final figures use small A/B labels
near the points, with exact coordinate pairs in a separate legend below the grid.
I rendered and inspected all nine final quadratic samples: the legends, point
names, ticks, and curves are legible, and their values agree with the blind
packets. Updated alt text identifies A as the vertex and B as the other point.

The initial cubic explanation at `graph-review-4` said “There are 1 qualifying
integers”. The final wording correctly uses “the qualifying integer is −5” and
“There is 1 qualifying integer”. The author also corrected the existing
`exponential-rewrite` step to “Over 1 year”. Inspection of the final source diff
and regenerated samples confirms that these changes affect presentation and
teaching copy; all 69 recorded answers still match, and all stems, stimuli,
response types, choices, and numerical data remain unchanged.

## Validation

The targeted command
`node tools/check-families.js --section sat-math --file advanced-math/nonlinear-functions`
reports **19/19 families passing**, with 300 integer and 300 runtime-shaped seeds
per template. Its filtered-section aggregate reports a missing not-to-scale-figure
count: this one-file subset has zero and the full-section requirement is three.
That aggregate does not establish a full-section pass; the coordinating agent owns
the complete corpus gate. Final regeneration independently compared the 69
recorded responses against the corrected builds with zero mismatches.

This is sampled independent agent review, not human editorial approval, exhaustive
proof of every seed, or empirical SAT calibration. The samples exercise several
representations and branch combinations but do not establish population difficulty
or student readiness. The coordinating agent owns registry/manifest renewal and
repository-wide validation.
