# Grade 8 Topic 2 refinements: independent review — 2026-10-06

**Accepted: all 66 fresh samples across 22 templates. Rejected: none.** The
independent reviewer `review_topic2`, distinct from the author, solved the
displayed prompts, tables, and graphs before opening the fresh answer keys or
revised generator source. All 66 keys and worked explanations agree with the
independent solutions. No mathematical repair was required.

This renews the sampled review of Topic 2 after the classifier, graph-label,
rational-slope, input-pool, lesson-assignment, and practice-key changes. The
earlier Topic 2 report remains a record of its earlier source, not approval of
this revision. The reviewer had read that earlier implementation; these 66
question draws and the revised source were unseen when the new solutions were
recorded. This is agent sampling, not human editorial approval or measured
student difficulty.

## Source and reproducibility

| Source | SHA-256 |
| --- | --- |
| `src/lib/courses/grade8-topic2.js` | `84e3fa0313eec7c6376ce1a126ca88472a5b3e4466227339b63d5fd74331032f` |
| `src/lib/courses/math.js` | `e9e571b2b574ef5378ff0e1b105dff2c19a9594ca41df75eac07559055c30baf` |

For each template in the table, the exact three full RNG seeds are constructed
as follows, with `i` equal to 0, 1, or 2:

```js
template.generate(M.random('cold-repair-2/' + i + '/' + template.id + '/0'));
```

All 66 displayed questions are distinct. Their prompts, tables, graphs, keys,
steps, and answer graphs replayed exactly as JSON at the final source hash.
JSON comparison appropriately normalizes JavaScript `-0` to `0`; these are the
same mathematical coordinate and render as the same text.

Blind answers and reasoning were saved to
`.scratch/refined-math-topic2/reviewer/answers.json` before unblinding, with
SHA-256 `5aafcb7cfc490fb3e839d020a80c9a740a475d81cac674f90797574ed720b98f`.
The independently written `solve-blind.py` uses Python `fractions.Fraction`
for exact equation substitution, slope, and table checks. Scratch evidence is
temporary; the reproducible seeds, source hashes, and results below preserve
the durable review record.

The locale-independent ordering adjustment to canonical keys occurred after
sample export. The reviewer checked the final frozen source and independently
replayed all exported student and key data unchanged before accepting it.

## Independent results

Every suffix below has the prefix `g8-t2-`. Columns give answers for seeds 0,
1, and 2 in that order. All listed samples, their explanations, and applicable
answer graphs are accepted.

| Template suffix | Independent answers and essential reasoning |
| --- | --- |
| `combine-terms` | x = 2; 9; −5. Equations reduce to 10x + 9 = 29; 12x + 1 = 109; 12x + 10 = −50. |
| `perimeter-equation` | Width/length: 10/45 cm; 11/36 cm; 12/63 cm. Model 2x + 2(ax + b) = P gives 10x + 10 = 110; 8x + 6 = 94; 12x + 6 = 150. |
| `both-sides` | x = −10; 4; −8. Subtraction gives 6x = −60; 5x = 20; 3x = −24. |
| `equal-savings` | 5 weeks and $43 each; 4 weeks and $51; 9 weeks and $134. Rate differences 2, 3, 6 divide initial gaps 10, 12, 54. Both savings expressions agree at each result. |
| `distribute-both-sides` | x = −4; −4; 2. Distributed equations: 3x − 12 = 6x; 5x − 10 = 10x + 10; 4x = 6x − 4. |
| `fraction-both-sides` | x = 59/3; −7; −3/2. Clearing denominators gives 3x = 59; 3x = −21; 4x = −6. All denominators are nonzero constants. |
| `multistep-subtraction` | x = 3; 2; −7. Distributing the negative factor gives 3x − 41 = −32; 4x − 25 = −17; x − 6 = −13. |
| `decimal-equation` | x = 5; 10; 0. Multiplying by 10 and collecting gives x = 5; 2x = 20; 5x = 0. |
| `classify-solutions` | Infinitely many: 21 = 21; none: 21 = 29; exactly one: −3x = 5, x = −5/3. Substituting the last value gives −14/3 on both original sides. |
| `make-solution-type` | Only k = 32; any k other than 10; only k = −48. Removing equal variable terms leaves respectively 32 = k, 10 = k, and −48 = k. The key's no-solution example k = 3 is valid. |
| `printing-plans` | 9p = 24 + 6p gives 8 packs/$72; at 9 packs B $78 versus A $81. 6p = 5 + 5p gives 5 packs/$30; at 6 B $35 versus A $36. 7p = 8 + 6p gives 8 packs/$56; at 9 B $62 versus A $63. |
| `container-capacity` | None: 12 = 18; none: 24 = 28; every allowed item count: 32 = 32. Physical x values are nonnegative whole numbers; counting labels and items as pieces makes the units coherent. |
| `compare-table-equation` | A by 6 pages/minute: 30/2 − 9 = 6. B by 27/7 cards/minute: 8 − 29/7 = 27/7. B by 1 page/minute: 5 − 12/3 = 1. |
| `compare-graph-rate` | B by 90 liters: (11 − 1)·9. B by 28 liters: (6 − 2/5)·5. B by 69/2 liters: (8 − 9/4)·6. The stated constant-rate assumption permits using times beyond the small displayed graph window. |
| `slope-points` | −7/3 falling; 4/3 rising; −5/3 falling. Each is the change in y divided by the change in x with consistent point order. |
| `slope-triangles` | −2/6 = −8/24 = −1/3, scale factor 4; 4/4 = 12/12 = 1, factor 3; −3/4 = −9/12, factor 3. Signed changes retain their sign; triangle leg lengths themselves remain nonnegative. |
| `graph-y-mx` | Slope −1 through (−1, 1), (0, 0), (1, −1); 7/3 through (−3, −7), (0, 0), (3, 7); 4/11 through (−11, −4), (0, 0), (11, 4). Draw the straight line through each set. |
| `proportional-missing-value` | y = 2x, target 16; y = x/2, target 6; y = x, target 18. Constants come from 4/2, 2/4, and 6/6. |
| `intercept-graph` | (0, 13), initially 13 liters before draining; (0, 15), initially 15 liters before draining; (0, 4), initially 4 liters before filling. |
| `intercept-table` | Slope 4 and intercept (0, −4); slope 3 and (0, 6); slope −3 and (0, 8). All are nonproportional because b is nonzero. Substitution reproduces every table row. |
| `graph-slope-intercept` | Slope −5/3, intercept (0, 5), points (−3, 10), (0, 5), (3, 0); slope 1, intercept (0, −6), points (−1, −7), (0, −6), (1, −5); slope −3/4, intercept (0, 2), points (−4, 5), (0, 2), (4, −1). |
| `equation-from-graph` | y = −2x − 6; y = (2/3)x − 1; y = −2x − 1. Point differences give slopes −4/2, 4/6, and −4/2; either point then gives b. |

## Refined behavior and source checks

- The classifier now generates all three outcomes, and the fresh blind sample
  includes each. Source inspection confirms that equal coefficients with equal
  constants yield an identity, equal coefficients with unequal constants yield
  a contradiction, and unequal coefficients yield a unique rational solution.
- Intercept graphs label their points A and B rather than printing the ordered
  pair sought by the question. Unit grid intervals make each sampled intercept
  readable. Filling/draining language, axis labels, slope sign, initial volume,
  and final displayed volume agree. The source lower bound keeps draining
  volumes positive throughout each displayed segment.
- Hose graph labels are also neutral. Rational table and graph rates produce
  exact fraction differences and volumes. Source exclusions prevent tied
  comparison rates; either machine/hose can be faster. None of the sampled
  graphs prints the requested intercept, slope, or equation as a point label.
- Negative triangle slopes use signed vertical changes, not negative lengths.
  The revised explanations make that distinction correctly. Coordinates given
  in the prompt allow exact calculations when a point falls halfway between
  the graph's two-unit grid lines.
- Every plotted student point and segment endpoint lies within its declared
  graph window. All six graph-construction samples offer at least three exact,
  distinct integer-coordinate points inside the student grid. Their answer
  points satisfy the independently derived equations exactly. Answer-line
  endpoints agree with the rational equations within 10⁻¹²; nonterminating
  rational endpoint coordinates are ordinary floating-point approximations.
  Out-of-window line endpoints permit the renderer to clip an extended line
  to the grid and are not presented as additional plotted points.
- Reduced slopes ensure that equivalent numerator/denominator draws describe
  the same proportional equation. Source bounds keep all three marked answer
  points visible even at maximum rational slope or intercept magnitudes.
- `fraction-both-sides` is assigned to 2-4, whose current objective covers
  fractions and decimals; `multistep-subtraction` is assigned to 2-3, whose
  current objective includes distributing signed factors. The returned
  mathematical exercises match those objectives. This checks the repository
  objectives, not the copyrighted textbook's unseen exercise content.
- Every replayed sample has a nonempty canonical practice key. Source keys use
  mathematical givens, reduced slope values where applicable, and stable
  code-unit ordering for unordered givens. The ordering adjustment changes
  identity construction without changing a question or solution. This source
  inspection does not replace the engine's separate repetition tests.

No mathematical defect or exposed numeric answer-label cue was found. Some
steps are mechanically redundant when a coefficient is 1 or an addend is 0;
they remain correct. The sample with `4(x + 0) = 6(x + 0) − 4` is easier than
other distribution draws, so this acceptance is not a uniform-difficulty
claim.

## Additional checks and limits

These source-directed checks happened after unblinding and are separate from
the 66 blind samples:

| Exact RNG seed | Additional result independently checked |
| --- | --- |
| `refinement-supplement/5/g8-t2-compare-graph-rate` | A passes through (1, 2), so its 2 liters/minute exceeds B's 1; A adds 8 more liters in 8 minutes. |
| `refinement-supplement/52/g8-t2-intercept-table` | (3, 3), (4, 4), (5, 5) gives y = x, intercept (0, 0), proportional. |
| `refinement-supplement/844/g8-t2-equation-from-graph` | (−2, −1) and (2, 1) give slope 1/2, intercept 0, equation y = x/2. |

The reviewer checked all fresh keys and explanations without reading the
author's tests. This lane did not run the 150,000-draw author suite or evaluate
actual browser/PDF appearance. Dense coordinate grids, label placement, line
clipping in rendered output, page breaks, and printed handwriting space still
require the coordinator's print verification. Sampling and source inspection
do not establish complete pedagogical coverage or the absence of every
possible defect.

Only this review report and the assigned reviewer scratch directory were
written. No production files, root-owned sample inputs, commits, or publication
state were changed by this reviewer.
