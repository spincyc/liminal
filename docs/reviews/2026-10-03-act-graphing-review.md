# ACT graphing review — 2026-10-03

Reviewer: independent agent `/root/review_act_graphs`. Authors: `/root/act_graphs` (Math) and `/root` (Reading and shared infrastructure).

## Method and scope

The reviewer first queried only each selected question’s stem, choices, stimulus and figure, plus the displayed title, introduction, passage and figure for Reading p018. No keys, teaching fields, generator code or graph helper implementations were inspected before solving. All 25 chosen answers and their reasoning were saved before key access. The figures were also rendered by Chromium and inspected visually in independent question packets. The exact blind-answer lock time was `2026-10-03T22:33:35.651Z`.

After the answer lock, the reviewer compared all keys, inspected hints, explanations, solution steps, distractor rationales, strategies, traps and principles, and checked the plotted data against the descriptions. Follow-up display-only repairs are recorded below. This is sampled independent agent review, not human editorial approval, psychometric calibration or verification of every retained ACT item. The bank review statuses remain unchanged.

## Independent answers

Indices are zero-based. Every row below matched the authored key when first compared and still matches after the final presentation repairs. Final disposition: **25 accepted, 0 rejected, 0 unresolved blocking findings** within this sampled scope.

| Question | Index | Independently selected choice | Reasoning |
| --- | ---: | --- | --- |
| act-mathematics-0072 | 3 | 2 | The lines meet at (2,3); the horizontal coordinate is 2. |
| act-mathematics-0122 | 3 | 4 | The solid line is y=x+1 and the dashed line is y=10-2x, so their intersection is (3,4). The vertical coordinate is 4. |
| act-mathematics-0191 | 0 | −1 | Slope = (-8-(-2))/(2-(-4)) = -6/6 = -1. |
| act-mathematics-0203 | 0 | 3/2 | Slope = (8-(-1))/(2-(-4)) = 9/6 = 3/2. |
| act-mathematics-0173 | 0 | y = −2x + 3 | The y-intercept is 3 and rise/run = (-1-3)/(2-0)=-2, giving y=-2x+3. |
| act-mathematics-0179 | 3 | y = 2x + 4 | The y-intercept is 4 and rise/run = (8-4)/(2-0)=2, giving y=2x+4. |
| act-mathematics-0177 | 1 | y ≥ −3 | The upward parabola has its included minimum y=-3 and no upper bound, so y>=-3. |
| act-mathematics-0195 | 0 | y ≤ 4 | The downward parabola has its included maximum y=4 and no lower bound, so y<=4. |
| act-mathematics-0192 | 3 | 3 | Zeros are x=-2 and x=3; the greater zero is 3. |
| act-mathematics-0198 | 3 | 4 | Zeros are x=-3 and x=4; the greater zero is 4. |
| act-mathematics-0184 | 0 | (−1, −4) | P=(-3,3). Input x-2 shifts the point right 2 to -1; output becomes -2(3)+2=-4. |
| act-mathematics-0208 | 1 | (−7, 13) | P=(-4,4). Input x+3 shifts the point left 3 to -7; output becomes 3(4)+1=13. |
| act-mathematics-0275 | 2 | 2 | The horizontal-axis crossing is (2,0), so its x-coordinate is 2. |
| act-mathematics-0293 | 3 | 3 | The horizontal-axis crossing is (3,0), so its x-coordinate is 3. |
| act-mathematics-0379 | 2 | 15 | Q1=15 and Q3=30, so IQR=30-15=15 minutes. |
| act-mathematics-0384 | 0 | 10 | Q1=20 and Q3=30, so their separation is 10 minutes. |
| act-mathematics-0389 | 1 | 23 | Disjoint workshop counts total 5+8+6+4=23. |
| act-mathematics-0404 | 3 | 27 | Disjoint workshop counts total 6+9+7+5=27. |
| act-mathematics-0394 | 2 | 20 ≤ t < 25 | There are 24 journeys. Cumulative counts are 3,11,18,24; ordered positions 12 and 13 both lie in [20,25), so their mean also lies there. |
| act-mathematics-0454 | 2 | 25 ≤ t < 30 | There are 24 journeys. Cumulative counts are 2,11,17,24; positions 12 and 13 both lie in [25,30). |
| act-mathematics-0380 | 3 | 18 | Fitted line slope=(21-6)/5=3 and intercept 6; at x=4 the prediction is 18. |
| act-mathematics-0450 | 2 | 27 | At x=5 the fitted line gives 27, from slope (27-7)/5=4 and intercept 7. |
| act-mathematics-0405 | 2 | −4 | At x=4 the prediction is 18 and the observed P is 14; observed-predicted=14-18=-4. |
| act-mathematics-0410 | 0 | 5 | The fitted line has slope (15-7)/4=2 and intercept 7; at x=5 prediction=17, observed=22, residual=5. |
| act-reading-0173 | 0 | September, near the end of summer. | The most negative departure shown is September at -4 ppm; October is -3, December -1, May +4. |

## Findings and disposition

- **Accepted repair — exact graphical readings.** The original slope question 0203 placed A halfway between grid lines, and fitted-line questions required exact readings between coarse vertical ticks. Visible coordinate labels for slope A/B, regression reference points and residual P remove unnecessary measurement uncertainty. Squares distinguish reference points on the fitted line from circular observations. The numbers, stems, choice ordering and answers remain unchanged. The final label placements were reinspected and accepted after moving text clear of the plotted lines and the vertical axis.
- **Accepted repair — alternative-text accuracy.** Slope questions 0191 and 0203 originally said both numbered axes stepped by 2. The vertical numbered ticks step by 4; the grid itself steps by 2. The corrected description states that distinction.
- **Accepted repair — instructional accuracy.** Transformation 0208 has a positive vertical multiplier, so its original trap about omitting a reflection was false. The transformation trap now refers to applying the vertical shift before the scale factor, which describes an actual offered distractor for both 0184 and 0208.
- **Retained limitation — regression distractors.** The prediction items warn against using an observed point, but their current wrong options use the intercept, omit the intercept, or use the adjacent input. In 0380, the observed value at x = 4 is 19 and is not an option. The distractors are mathematically coherent; this is a weaker test of the specific advertised observation-versus-prediction trap.
- **No answer-key defect found.** Histogram totals are 24; both central observations are in the keyed class. The explanations correctly avoid claiming that grouped data reveals the exact median. Residual signs use observed minus predicted. The Reading graph’s unique minimum is September at −4 ppm.
- **No separate figure answer leak found.** Alternative text describes data and visible features, rather than supplying a computed slope, interquartile range, residual or selected choice. Coordinate labels supply the same data needed to solve. Describing the lowest vertex or an intercept makes very simple reading questions simple, as their rendered figures already do.

## Infrastructure review

Standalone figures pass through the existing strict SVG validator and renderer sanitizer; passage questions are prohibited from owning a competing figure. Generation preserves the figure object, and browser/Node hydration retain shared passage ownership. The reviewer found no new raw-SVG route into the HTML fallback: HTML escapes the alternative text, and LaTeX escapes its description through the existing text conversion. Shared figures print once with their passage; standalone figures remain independent.

The exact, structural and near-duplicate paths now include descriptive figure data; the admission audit also includes it while stripping numbers for shape comparison. This avoids treating every identical graph-reading stem as an exact duplicate merely because its plotted data differs. It remains a textual approximation: the duplicate gates do not prove that SVG geometry agrees with alternative text, nor do they measure pedagogical novelty. The review caught a fixture that changed only alternative text while retaining the same SVG. The corrected fixture changes the SVG as well. Agreement between descriptions and plotted geometry still requires a separate check.

The fallback is explicitly a diagram description, not a graph drawing. It preserves access to the data for renderer-free HTML and LaTeX, but those exports cannot assess visual graph-reading in the same way as the rendered site.

## Coverage and limits

The Math review covers all 24 new standalone-figure records, out of 575 Math records: two examples each of 12 designs—system intersection, slope, linear equation, quadratic range, quadratic zeros, combined point transformation, x-intercept, box-plot IQR, bar-chart total, histogram median class, fitted-line prediction and residual. These are 12 designs with two numerical variants each, not 24 independent designs. Most are direct-reading or short-calculation exercises. Existing ACT difficulty tiers remain unverified.

Reading review covers question 0173 and shared passage p018’s line chart and context. The graph is used by a ten-question passage set, but the other nine questions were not independently solved in this lane. There is one SVG-bearing Reading passage in the inspected bank. Question 0173 asks for a single graphical minimum; this does not demonstrate broad graph-and-prose synthesis coverage. The historical and scientific prose was inspected for context and internal consistency, not externally fact-checked in this lane.

No SAT template source or seed review was performed in this lane. Browser packet inspection checked SVG readability and data agreement; the coordinator owns integrated app, mobile, print and dark-mode testing. This finite review does not establish comprehensive ACT graph coverage, accessibility on every device, student difficulty, or official-form equivalence.

## Verification

- `node --test test/graphing-content.test.js test/booklet.test.js test/act-reading-review.test.js`: 51 passed, 0 failed.
- `node --test test/audit-questions.test.js`: 6 passed, 0 failed.
- `git diff --check`: passed at the inspection checkpoint.

The final combined rerun of those four suites passed **57 tests, 0 failures**. No installed npm command was needed; these were run with `/usr/bin/node`. No PDF/LaTeX engine run was performed in this lane.

Reviewed snapshot SHA-256: `1e35161b99dbfba9cea63da18bdc39c96d8c1d81169ee136fc55cb807b8c6ec0`. The digest input is compact `JSON.stringify({questions, passages})`, where `questions` contains the 25 complete canonical records from the answer table sorted by ID, and `passages` contains the complete canonical `act-reading-p018` record. A later change to those records requires a scoped reinspection before relying on this acceptance.
