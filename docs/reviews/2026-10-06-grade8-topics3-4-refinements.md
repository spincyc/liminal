# Grade 8 Topics 3–4 refinements: independent mathematics review

Date: 2026-10-06. Reviewer: independent agent `/root/review_topics3_4`, separate
from the authors of these refinements. **84 samples accepted against the
final source, 0 rejected**, covering three distinct samples from each of
28 templates. The reviewer completed 96 blind solutions: 84 initially,
then 12 supplemental solutions after four designs changed. Final coverage
consists of 72 unchanged samples plus those 12 supplemental samples.
No mathematical defect or insufficient prompt was found in the reviewed
samples. Post-solution inspection of the refined source also found no
mathematical defect in the branches the samples did not exercise.

This is a fresh review of the refined generators. The reviewer previously
reviewed an earlier version; that prior exposure is not represented as a
new blind review of the entire design. For this pass, all 84 current displayed
prompts, tables, and graphs were solved and recorded before the current
keys or refined source were opened. The author's reported automated results
were not used to derive or approve an answer.

## Scope, evidence, and replay

The blind solutions and reasoning were saved to
`.scratch/refined-math-topics3-4/reviewer/answers.json` before reading
`keys.json`. Every key, worked step, and supplied answer-graph coordinate was
then compared with the independent solutions. Only afterward were Topic 3,
Topic 4, and the shared arithmetic helper read to inspect uncovered branches.

The initial source was replayed independently for all 84 sample seeds.
After four bounded changes, the final source was replayed for the original
72 samples from the other 24 designs and 12 fresh samples from the changed
designs. Every prompt, table, student graph, answer, explanation, and answer
graph exactly matched its corresponding review file at the supplemental
freeze. A subsequent frame-only correction was separately verified as
described below; one reviewed graph's upper bound increased from 25 to 30,
with every other displayed field and key preserved. The earlier change
from locale-based to code-unit ordering of canonical practice keys did not
change displays or keys. The reported final acceptance is bound to these
SHA-256 hashes:

| File | SHA-256 |
| --- | --- |
| `src/lib/courses/grade8-topic3.js` | `a9f8e90452a82cbe3fb72111c213b5a31f9d8ae1c6b286a085fe08dcbb9fbab2` |
| `src/lib/courses/grade8-topic4.js` | `c2d66d22bc4107898fc40ba297423a9c9d3534c83f2681ab1bbaeb6b3a2511e2` |
| `src/lib/courses/math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |

Review-file fingerprints:

| Artifact | SHA-256 |
| --- | --- |
| `questions.json` | `41a3efa36ffde6ec91a9a7eb6ce447b0446802d2631b10ffad0f530f2df64c2f` |
| `reviewer/answers.json` | `7bde33402ef4e9c7ecd0a14fbdbfc886c34a61a1af950887e211bbbeac22089e` |
| `keys.json` | `d32f6b5f6bb443ae545b705911afa8cb9d1384c397ab528c90a1ff75eb6cab25` |
| `supplement/questions.json` | `123ac7d652c1e4c56c3a5c34b4a411ce3e35de26b3b54e6da5f35c45610cb7ba` |
| `reviewer/supplement-answers.json` | `1df4a3440a90eb3971c6b1f3e8ed820ba056fd6167b3226c9a8ce5cb625c7d06` |
| `supplement/keys.json` | `f74d1362dc983e85b5e3b9edcbb06df7a65fd3a55a6aeb51d4a8039b48727075` |

The initial 84-sample snapshot used Topic 3 hash
`209c2af7ea3b2653f348c452467180e2f758f52946c190839df78536de688ea3`
and Topic 4 hash
`5ec6e55807036f31871484407cf081f34baf209c2455c293d5b2ca44c54a56b4`.
The supplemental review and unchanged-design replay renew that acceptance
against the final hashes above; they do not silently reuse approval for
changed displays.

For every template ID in the evidence table below, the exact sample IDs are
`<templateId>/0`, `<templateId>/1`, and `<templateId>/2`. The corresponding
exact seeds and invocation are:

```js
const M = require('./src/lib/courses/math.js');
const templates = [
  ...require('./src/lib/courses/grade8-topic3.js'),
  ...require('./src/lib/courses/grade8-topic4.js')
];
for (const template of templates) {
  for (const i of [0, 1, 2]) {
    const seed = `cold-repair-2/${i}/${template.id}/0`;
    const sample = template.generate(M.random(seed));
  }
}
```

The trailing `/0` is part of the seed. For example,
`g8-t4-compare-fit-lines/0` uses
`cold-repair-2/0/g8-t4-compare-fit-lines/0`.

## Results for the initial 84 samples

Each row gives independent results in sample order `/0`, `/1`, `/2`.
All three samples in every row are accepted. Counts in table completions
follow displayed row order; graph vertices are joined only when the prompt
calls for a continuous function. The four designs in the supplemental section
below have renewed final-source samples; their original results here remain
historical evidence.

| Template ID | Independent result and key comparison |
| --- | --- |
| `g8-t3-relation-table` | Yes; no because input 0 has outputs 6 and 2; no because input 2 has outputs 0 and −4. Repeated outputs are allowed, repeated inputs with different outputs are not. |
| `g8-t3-vertical-line-points` | Yes; no because x=−2 has outputs −2 and 1; yes. The prompt explicitly limits each relation to the four discrete plotted points. |
| `g8-t3-rule-table-graph` | Output lists `(−3,−2,−1,0,1)`, `(−8,−5,−2,1,4)`, `(1,2,3,4,5)`. Equations `y=x/3−1`, `y=3x−2`, `y=x+3`; all answer points and line endpoints satisfy the stated equations. |
| `g8-t3-graph-function-rule` | `y=x−1`, output 3 at x=4; `y=3x+1`, output 16 at x=5; `y=x+2`, output 5 at x=3. The explicit word “line” supplies the model beyond the displayed segment. |
| `g8-t3-linear-or-nonlinear-table` | All three are linear over the shown inputs, with constant rates 3, 4, 3 and intercepts 1, 0, 5. No conclusion about unshown inputs is required. |
| `g8-t3-compare-function-rates` | Rate winners A (7 > 6), B (6 > 3), B (7 > 6). Output-at-zero winners B (6 > 3), A (9 > 7), B (3 > 2). B is explicitly linear, resolving the prior review's missing-assumption concern. |
| `g8-t3-context-linear-model` | `y=6x+15`, 33 m² after 3 hours; `y=3x+10`, 28 m² after 6; `y=4x+9`, 37 m² after 7. Rates 6/3/4 m² per hour and initial areas 15/10/9 m² are correctly interpreted. |
| `g8-t3-two-values-linear-model` | Cost functions `4x+10`, `6x+7`, `3x+7` dollars. Per-piece charges $4/$6/$3; setup fees $10/$7/$7. Fixed fee and constant charge assumptions are explicit. |
| `g8-t3-square-display-model` | Rules A/B: `5n+10` / `n²+12`, `9n+12` / `n²`, `6n+8` / `n²+2`. Table pairs: `(15,13),(20,16),(25,21),(45,61)`; `(21,1),(30,4),(39,9),(102,100)`; `(14,3),(20,6),(26,11),(38,27)`. Target winners B/A/A. A is linear and B nonlinear; the unequal final table gaps do not get treated as unit steps. |
| `g8-t3-rental-comparison-model` | Cost pairs `(56,50),(62,62),(68,74)`; `(12,13),(18,18),(24,23)`; `(92,91),(102,102),(112,113)`. Break-even hours 5/3/9. Cheaper before/after: B/A, A/B, B/A. Fees, names, and explanatory comparisons remain consistent after swapping options. |
| `g8-t3-increasing-decreasing-graph` | Increase/constant/decrease intervals: `4–6 / 0–4 / 6–9`; `6–9 / 0–2 / 2–6`; `6–9 / 0–3 / 3–6` minutes. The final sample increases from −3 to −1 despite remaining negative. Endpoint conventions are appropriately flexible. |
| `g8-t3-compare-increasing-intervals` | Rates 3 versus 4 m/s, second faster; 4 versus 2, first faster; 4 versus 3, first faster. Rates use both coordinate differences rather than ending heights. |
| `g8-t3-sketch-walk-rest-return` | Vertices `(0,0),(4,80),(7,80),(11,0)`; `(0,0),(4,120),(6,120),(10,0)`; `(0,0),(4,140),(5,140),(9,0)`. All answer graphs match the timing and distance-from-home interpretation. |
| `g8-t3-sketch-filling-rates` | Vertices `(0,4),(3,10),(6,19),(8,19)`; `(0,6),(3,9),(6,15),(8,15)`; `(0,3),(3,6),(6,15),(8,15)`. Slopes 2/3/0, 1/2/0, 1/3/0 liters per minute. No-water-loss intervals preserve final volume. |
| `g8-t4-scatter-association` | Negative approximately linear; positive approximately linear; positive approximately linear. Local plateaus do not invalidate overall association. None establishes causation. |
| `g8-t4-scatter-outlier` | Negative main trend, E(3,13) below it; positive main trend, E(2,26) below it; positive main trend, G(5,68) above it. Labels are read from the actual points, and automatic deletion of unusual observations is rejected. |
| `g8-t4-construct-scatter` | Positive nonlinear `y=x²+12`; no association because each x has y=8 and y=23; negative approximately linear. Every answer point matches the table, axes are in the requested order, and no observations are connected. |
| `g8-t4-correct-scatter-point` | B should be `(2,11)`; E `(5,25)`; E `(5,13)`. Only those plotted vertical coordinates disagree with the tables. |
| `g8-t4-compare-fit-lines` | Model B wins all three. Absolute-error sums A/B: 69/13, 68/14, 32/4. Correct B residuals: `(0,3,−2,2,3,−3)`, `(3,3,0,−2,−3,−3)`, `(1,−1,0,−1,−1,0)`. “Other line” directions lower/higher/higher are correct. |
| `g8-t4-write-fit-line` | `y=x/2+22`, `y=−2x+28`, `y=x+20`. Exact slopes come from endpoint changes 5/10, −10/5, 5/5. Answer graphs use the correct intercepts and slopes. Off-line observations lie on both sides and do not invalidate an approximate model. |
| `g8-t4-model-prediction` | About 14/91/46 minutes at 1/16/6 km; slopes 2/5/6 min/km. Classification: extrapolation below the observed range, extrapolation above it, interpolation. |
| `g8-t4-inverse-prediction` | Inputs 16/17/22, all extrapolation beyond observed 4–12. Substitution returns 93/105/152, and model limitations are stated. |
| `g8-t4-volunteer-data-model` | About 55/56/61 kits at seven volunteers. No exact causal increment is justified. Thirty volunteers is outside observed 2–8, with plausible resource and coordination limitations. |
| `g8-t4-model-realistic-range` | Early/later algebraic counts 39/−9, 24/−9, 33/−18 boxes. Zero at 16/13/17 hours. Negative physical counts are rejected; even the zero forecasts lie beyond observed 0–8. |
| `g8-t4-two-way-counts` | Joint/outdoor/grand counts `(11,34,69)`, `(13,25,50)`, `(22,52,69)`. All margins reconcile. |
| `g8-t4-complete-two-way-table` | Missing cells `(10,25,30,84)`, `(19,20,36,71)`, `(17,25,31,67)`. Nonwalking lunch counts 25/20/25 follow from both the row and column margins. |
| `g8-t4-relative-frequency-denominators` | Joint/conditional percentages `(6%,30%)`, `(42%,70%)`, `(30%,75%)`. Grand-total denominators are 100; morning denominators 20/60/40. All are exact, with no rounding needed. |
| `g8-t4-compare-conditional-frequencies` | Morning/afternoon 30%/80%, 40%/60%, 20%/20%. The first two show sample association; the last shows none. In the second sample, larger morning raw counts coexist with a lower percentage. In the last, counts 12 and 4 reflect group sizes 60 and 20, not association. Population significance and causation are not inferred. |

## Supplemental review of the four final changes

The final changes expand meaningful parameter ranges in three templates and
add a blank calculation workspace to the fit-line comparison. The reviewer
read the 12 supplemental displays, solved every prompt and graph, and saved
`reviewer/supplement-answers.json` before opening supplemental keys or the
final source changes. All 12 are accepted. Their sample IDs again end in
`/0`, `/1`, `/2`; their distinct seed prefix identifies the supplemental set:

```js
template.generate(M.random(`cold-repair-supplement/${i}/${template.id}/0`));
```

| Template ID | Supplemental results in order `/0`, `/1`, `/2` |
| --- | --- |
| `g8-t3-vertical-line-points` | Yes, with distinct inputs −2/−1/1/2; yes, with distinct inputs −4/−3/−1/0; no, since x=−1 has outputs 3 and 6. The expanded vertical spacing preserves the exact function criterion. |
| `g8-t3-sketch-filling-rates` | Vertices `(0,7),(4,15),(8,35),(10,35)`; `(0,2),(5,7),(10,27),(12,27)`; `(0,4),(5,19),(10,49),(12,49)`. Slopes 2/5/0, 1/4/0, 3/6/0 liters per minute. All answer graphs match. |
| `g8-t4-correct-scatter-point` | A should be `(1,10)` rather than `(1,15)`; C `(3,16)` rather than `(3,21)`; E `(5,27)` rather than `(5,22)`. The final draw exercises the newly allowed downward plotting error. |
| `g8-t4-compare-fit-lines` | Winners B/A/A. Absolute-error totals A/B: 25/5, 3/25, 6/54. Predictions A/B by row: `(26,31,36,41,46,51)` / `(22,27,32,37,42,47)`; `(20,17,14,11,8,5)` / `(16,13,10,7,4,1)`; `(22,19,16,13,10,7)` / `(31,28,25,22,19,16)`. Blank columns correctly request the corresponding predictions and absolute errors; total placeholders occur only in the two error columns. |

The final delta's source formulas were inspected after these solutions.
Vertical-line points now use a rise of 2–5; the repeated-input case still
has distinct outputs separated by 3, and all plotted points remain within
the given bounds. Filling durations of 2–5 minutes and larger positive
starting volumes/rates preserve the cumulative-volume calculation; the
second rate remains strictly greater than the first and graph maxima exceed
the final volume. Correct-scatter errors are ±5 at exactly one of five
distinct x-values; even the smallest downward-shifted point stays above
zero. The six-column fit workspace copies only the observed values and
blank answer cells, leaving the original mathematics unchanged.

A nonblocking illustration limitation was found in supplemental
`g8-t4-correct-scatter-point/2`, seed
`cold-repair-supplement/2/g8-t4-correct-scatter-point/0`: the requested correct
point is `(5,27)`, while the graph's original upper boundary was 25. The displayed
incorrect point `(5,22)` is visible and the prompt only requires identifying
the point and stating its correct coordinates, so the mathematical answer
remained sufficient. The explanation's suggestion to move the point would
have extended beyond the supplied frame. This limitation is now resolved.

### Frame correction verified and closed

The author changed only the correct-scatter template's upper-bound
calculation to include both true table values and plotted values. The
reported seed now has `yMax=30`, containing the correct point `(5,27)`.
Reversing precisely that one expression change in the final source
reproduces the previously accepted Topic 4 SHA-256
`6a1d57b4f95b0fd76ed9c6c773d7d739ead469e7b080806dc683d65ecb2e1355`.
The final Topic 4 hash is
`c2d66d22bc4107898fc40ba297423a9c9d3534c83f2681ab1bbaeb6b3a2511e2`,
as recorded in the controlling source table above.

The reviewer replayed all 84 accepted samples. All prompts, observed values,
points, keys, steps, and answer graphs remained identical; the reported
sample's upper bound was the only changed display field. A further 2,000
draws using `M.random('frame-closure/' + i)` for `i=0..1999` covered 359
distinct coordinate/error cases, both error signs, and all five point
labels. Every true and plotted y-value fit inside the new frame. Comparison
with the prior source's generated records confirmed that every field other
than `graph.yMax`, including `practiceKey`, remained identical. Bounds grew
in 133 of those draws. There were no failures; this is varied-seed coverage,
not a claim to have exhaustively enumerated all cases.

Evidence is saved in
`.scratch/refined-math-topics3-4/reviewer/frame-closure-verification.json`.
Because the verified edit changes only bounds, the existing blind solutions
remain valid; no additional blind solve was claimed. Mathematical
acceptance remains 84 final-source samples, 0 rejected, with the illustration
note closed.

## Source inspection beyond sampled branches

The following checks were performed after the blind phase. They are source
reasoning, not additional blind samples or a claim of exhaustive runtime
testing.

- Fractional and negative slopes: reducing numerator/denominator uses an
  absolute-value gcd and a positive denominator. Topic 3 table inputs are
  multiples of the reduced denominator, giving exact integer outputs.
  Their bounds satisfy `|x| ≤ 8` and `|y| ≤ 13`, inside the supplied frame.
  Topic 4 named endpoints differ by `5q` horizontally and `5p` vertically,
  so the exact slope is `p/q`; intermediate errors `−3,−1,1,3` guarantee
  points on both sides without claiming a uniquely optimal fit.
- Nonlinear tables: the unsampled quadratic branch is `ax²+b` with positive
  a and unit-spaced inputs. Its consecutive changes are `a,3a,5a,7a`,
  necessarily unequal. The prompt restricts the conclusion to shown inputs.
- Equal comparisons: the square-design equality branch compares full counts
  including both fixed decorations. The function-comparison equal-intercept
  branch leaves the unequal slopes separate. Both use the appropriate
  equality condition rather than a fixed winner.
- Rental reversals: the added fee is `(high−low) × breakEvenHours` on the
  lower-rate option. Subtraction proves the intended before/equal/after
  ordering for either label assignment; a positive rate gap precludes a
  degenerate equality across all times.
- All six interval orders: shuffling `[1,0,−1]` gives each direction exactly
  once. Durations are positive; nonzero rises/falls are positive magnitudes
  multiplied by the direction. Both answer intervals and explanations use
  the resulting actual coordinates. Sign of the output never determines
  increasing/decreasing status.
- Scatter forms: the unsampled no-association branch repeats the identical
  three-value output distribution at each x; the nonlinear branch is
  `x²+base`; the cluster branch has three points at x=1–2 and three at x=6–7,
  with the latter group's y-values strictly higher. Its key describes both
  the two separated clusters and positive overall association. Positive and
  negative approximate-line branches use small bounded residuals.
- Outlier direction and labels: normal-point deviations are ±1; the extra
  point differs from the underlying line by 15–22 units, of either sign.
  Thus it cannot coincide with a normal point at the same x. The answer
  finds its label after shuffling instead of assuming a special letter or
  position. Dynamic bounds contain all points.
- Either fit-line winner and either offset direction: if amplitude is a,
  each residual e satisfies `|e| ≤ a`, while the other intercept differs by
  `|g| ≥ 2a+1`. Therefore `|e−g| ≥ a+1 > |e|` for every point. The intended
  model has strictly smaller total absolute error for all such draws,
  regardless of signed gap, slope sign, shuffled residuals, or A/B naming.
- Predictions: interpolation draws stay strictly inside the stated ranges;
  extrapolation draws fall outside them. Inverse-model slopes are positive
  and nonzero, so their constructed targets recover a unique input. The
  realistic-range branch always puts its zero after hour 8 and its later
  target beyond that zero, guaranteeing the intended negative-count failure.
- Frequencies: cell ranges keep counts and conditional denominators
  positive. Exact fractional percentages use reduced integer fractions,
  including when morning totals are 60. Conditional-equality classification
  compares percentages rather than raw counts; equal percentages are a
  valid descriptive no-association case in the displayed table.
- Canonical practice keys: mathematical givens are retained while irrelevant
  row order, point labels, and interchangeable model names are normalized
  where appropriate. JSON code-unit ordering is deterministic across
  locales. Key construction does not alter the mathematical prompt, answer,
  or worked explanation. This is inspection of the template identities,
  not a separate certification of packet-selection behavior.

## Limits and rendering handoff

This review provides independent agent mathematical review, not human
editorial approval, measured student difficulty, an exhaustive seed search,
or a guarantee that all future source changes preserve correctness. Three
samples per design leave real branch gaps: all initial fit comparisons favor
B (the supplement additionally covers A), all inverse predictions are
extrapolation, all table classifications are linear, and only two interval
orders appear. The source reasoning above
addresses those gaps without relabeling them as blind sample coverage.

Graphs were reviewed as structured mathematical displays, including points,
line endpoints, scales, and axis meanings. Browser/PDF visual quality was not
reviewed in this lane. In particular, `g8-t3-rule-table-graph/1` correctly
defines `y=3x−2` with answer-line endpoints `(−9,−29)` and `(9,25)` outside
the frame `−14 ≤ y ≤ 14`; the renderer must clip that line at the frame
without distorting its slope. Negative-output axes, fractional-slope scales,
neutral outlier labels, handwriting space, pagination, and student/key
separation remain subjects of the separate rendering review.

Only this report and files under the assigned reviewer scratch directory
were written. No production edits, commits, or pushes were made by this
reviewer.
