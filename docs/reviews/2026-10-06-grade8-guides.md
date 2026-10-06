# Grade 8 authored guide review — 2026-10-06

## Scope and result

An independent agent reviewed every authored example in the four-topic course:
72 examples across 36 lessons (22 in Topic 1, 22 in Topic 2, 14 in Topic 3,
and 14 in Topic 4). This is review of original teaching content, not textbook
reproduction or approval of a complete Grade 8 standards curriculum.

Final result: **72 accepted, 0 rejected; no unresolved blockers**. All 72
numerical/algebraic answers agree with independent solutions. Initial review
accepted 71 and rejected one for a missing time unit; the coordinator corrected
that prompt and a separate lesson-objective alignment issue. A subsequent
notation-description correction in lesson 1-1 was also inspected and accepted.
All three corrections preserve the mathematical answers.

## Method and evidence

Reviewer: independent agent `/root/review_guides`, separate from the content
author, using inherited/default mathematical reasoning. The reviewer received
only displayed example IDs and prompts, solved all 72, and saved independent
answers and reasoning before opening the supplied answer keys or course source.
The saved answer record was created at `2026-10-06T19:43:27.746071+00:00`.
Afterward, the reviewer compared every answer, read every worked step, and
reviewed all 36 objectives, explanation paragraphs, pitfalls, and practice
advice. No author verification report was used.

The independent work used long division, aligned repeating-decimal equations,
perfect-power and root bounds, exponent rules, exact fraction arithmetic,
substitution into equations, slope calculations, segment endpoints, residuals,
and explicitly chosen frequency denominators. A small Python check verified
sample fractions, powers, bounds, scientific-notation arithmetic, both complete
five-point residual lists, and identical coverage of all 72 IDs. This was not
a claim to run a separate automated verifier for every statement.

SHA-256 evidence at initial review:

| Artifact | SHA-256 |
| --- | --- |
| `content/courses/grade-8-math.json` | `617717b587811dbee40a4f337c0baf6bb9948868123978fba1edc4d39c27b3c6` |
| Displayed prompts, `.scratch/review-guides/questions.json` | `3744897217967e73710c8e8e9e89b126a1a3f1d113fbff9c9c0c7f31c2f976fe` |
| Blind answers, `.scratch/review-guides/answers.json` | `be6127e07f679b223e11247a368d56d0231ba434d6a356496571a3e7edacb6fe` |

Final accepted course source SHA-256:
`41af33dd51ab91d891008ad778abb096638c6a7eeb106592bb7dc80d971e9497`.
All 72 answers and step arrays remain identical. Reversing the first two
wording corrections reproduced the original source hash. Reversing only the
later lesson 1-1 notation-description correction reproduced the previously
accepted source hash,
`c129ed5a1ad2dd4ca5c75d5533fc3d972167c03fd05baaca18233163d5521b62`.
These comparisons verify that no other source changes were silently included
in either renewed acceptance.

Scratch artifacts are transient. The answer inventory below preserves the
reviewed IDs and core independent results without depending on their retention.

## Findings and disposition

1. **Missing displayed unit — `4-2-example-1`.** The prompt says “reading
   time” without specifying its unit, but the solution labels the horizontal
   axis in minutes and interprets each change as ten minutes. No surrounding
   explanation supplies that unit. Add “in minutes” to the displayed prompt.
   Plotting the points and identifying the association remain mathematically
   sound; students cannot infer the required unit from the question as written.
   **Resolved:** the final prompt says “reading time in minutes.” The minutes
   label and all numerical work now follow directly from the displayed data.
2. **Objective exceeds worked coverage — lesson `4-5`.** Its objective says
   “Build and evaluate approximate linear models,” while both examples supply
   the model (`K = 7v + 7` and `T = 2b + 7`) and ask students to evaluate it.
   Narrow the objective to evaluating and using models, or add an example
   constructing a proposed model from stated graph points or a justified fit.
   The existing examples are correct and accepted individually.
   **Resolved:** the final objective says “Evaluate and use approximate linear
   models for an original workshop-preparation scenario,” matching its examples.
3. **Notation description — lesson `1-1`.** The coordinator's PDF inspection
   found that the renderer displays overbars while the explanation introduced
   brackets as the visible notation. **Resolved:** the explanation now says
   “A bar marks a repeating block” and “Only the digits under the bar repeat.”
   The source tokens `0.[27]` and `2.1[6]` still denote exactly 0.272727… and
   2.166666…, respectively; the terminating-decimal identity
   `0.375 = 375/1000 = 3/8` is unchanged and correct. This follow-up verifies
   mathematical equivalence and the isolated source edit; actual PDF overbar
   rendering was inspected by the coordinator, not this reviewer.

## Independent answer inventory

Each row identifies two samples: `<lesson>-example-1` and
`<lesson>-example-2`. Repeating blocks below use the course's source bracket
notation, which the course renderer displays as an overbar.

| Lesson | Example 1 independent result | Example 2 independent result |
| --- | --- | --- |
| 1-1 | `7/12 = 0.58[3]`; only 3 repeats | `23/18 = 1 5/18` |
| 1-2 | Rational: 11, −6, −5/11; irrational: √19 | Irrational: gaps between 1s grow without bound |
| 1-3 | `5 < √31 < 6`; nearest tenth 5.6 | `−√11 < −3.3 < −3 1/4 < −3.[2]` |
| 1-4 | `9/10`; `−6` | Both perfect powers; edge 9 cm; face area 81 cm² |
| 1-5 | `x = ±√30` | `z = −³√70`; face dimensions 7 m by 7 m |
| 1-6 | `a^5` | `6^(−4) = 1/1296` |
| 1-7 | `4^3 = 64`; `−1` | `5/2` |
| 1-8 | About `7 × 10^6` files and `8 × 10^(−5)` GB | Rounded counts `8 × 10^6`, `4 × 10^4`; ratio about 200 |
| 1-9 | `4.006 × 10^7`; `7.04 × 10^(−5)` | 209,000 m; 0.000603 m |
| 1-10 | `3 × 10^2`; `5 × 10^(−4)` | `5.5 × 10^6`; `1.5 × 10^4` |
| 1-11 | `6 × 10^7` bytes | 80 times as large; `7.11 × 10^8` more bytes |
| 2-1 | `x = 6` | `a = −5` |
| 2-2 | `x = 5` | `n = −5` |
| 2-3 | `x = 12` | `t = −2` |
| 2-4 | `x = 8` | `y = 3` |
| 2-5 | Identity; all real x | Contradiction; no solution |
| 2-6 | 6 kits; both $42 | C and D always agree on allowed counts; E never agrees |
| 2-7 | A $28, B $24; B saves $4 | A 2,250 m, B 2,400 m; B 150 m farther |
| 2-8 | `6/4 = 9/6 = 3/2` | Slope −3; both fit `y = −3x` |
| 2-9 | (0,0), (4,7), (8,14), (12,21); x = 20 | `y = −4x`; y = −20; x = −4 |
| 2-10 | Initial 18 L; empties at 6 min; domain 0–6 min | Intercept (0,5) |
| 2-11 | `y = −2x + 3`; y = −9 | `C = 7 + 2.5k`; $17; 6 kg |
| 3-1 | A function; B fails at input 1 | (−2,−3), (0,1), (3,7); one output per input |
| 3-2 | `C = 4 + 1.5h`; (0,4), (2,7), (4,10); h ≥ 0 | `y = 12 − 2x`; y(6) = 0 |
| 3-3 | A fits `3x + 1` on shown inputs; B nonlinear | A starts higher (8 vs 1), decreases faster (−3 vs −2) |
| 3-4 | `y = 3x + 5`; y(8) = 29 | `V = 72 − 4t`, 0 ≤ t ≤ 18; empty at 18 min |
| 3-5 | Match at 6 h, $30; at 4 h A $24 vs B $26 | Squares 1,4,9,16; strip 4,7,10,13; differences 3,5,7 vs 3,3,3 |
| 3-6 | Increase 0–3 at 2; constant 3–5; decrease 5–9 at −2 | Rise −4 to −1°C over 0–2 h; fall to −3°C over 2–5 h |
| 3-7 | Join (0,10), (4,30), (6,30), (9,0) | Join (0,0), (2,120), (3,120), (6,0) |
| 4-1 | Positive approximate linear association; retain both x = 2 points | Negative main trend; possible outlier (3,12) |
| 4-2 | Positive approximate linear pattern; x ticks 0–40 by 10, y ticks 0–16 by 2; final prompt supplies minutes | Positive curved pattern; differences 3,5,7 preclude constant rate |
| 4-3 | Reasonable rough line; residuals 1,−1,0,−1,1 | `y = −3x + 20`; slope −3 units/hour |
| 4-4 | $39 interpolation; $102 extrapolation with unknown reliability | 48% at 12 h; −6% at 30 h physically invalid |
| 4-5 | Residuals 0,−1,1,0,0; 49 kits at 6 volunteers is extrapolation | 17 min for 5 boxes; 19 min predicted for 6, 1 below observed |
| 4-6 | Rows 20,40; columns 30,30; grand total 60; walkers' borrowing rate 60% | Missing 5; sport total 16 |
| 4-7 | Fruit 60% vs 40%; morning-and-fruit joint frequency 36% | Helmet rates bicycle 80%, scooter 60%; bicycles among helmet wearers 25% |

## Prose, models, and instructional alignment

The worked steps correctly distinguish a principal square root from both
solutions of a squared-variable equation; negative cube roots keep their sign;
geometry distinguishes length, area, and volume. Exponent rules retain nonzero
base conditions. Exact and rounded scientific notation are distinguished, and
ratios versus differences carry the right units.

Equation solutions check against original expressions. Identity and
contradiction explanations avoid dividing by a vanished coefficient. Pricing
models use allowed quantities. Slope point order, intercept coordinates, and
reverse-function questions are handled correctly.

The source explicitly limits what finite tables establish: `3-3-example-1`
says A is consistent with a linear rule and qualifies continuation of the
constant-rate pattern. Rental billing is qualified as continuous. Draining
models stop at zero. The walking example describes distance from home, and the
guide correctly cautions that a horizontal distance segment alone does not
prove that all possible motion stopped.

Data examples preserve paired observations and repeated inputs. They
distinguish association from causation and interpretation from causal claims;
outliers invite investigation, not automatic deletion. Residuals use observed
minus predicted. Predictions outside observed ranges are flagged, including
the physically invalid battery percentage and unverified predicted empty time.
Conditional and joint frequencies use explicit denominators, and percentage
points are distinguished from relative percentage change.

The examples support their final lesson objectives after narrowing the `4-5`
objective to evaluation and use. Some representations are conveyed as coordinates or verbal
instructions rather than a drawn graph; this review establishes the content
of those instructions, not the appearance or completeness of rendered print
figures.

## Limits

This is exhaustive agent review of the 72 current authored examples and their
surrounding teaching prose, not review of all generated worksheet variants.
It does not certify source textbook page or standards mappings, originality
against an external corpus, publisher approval, human editorial approval,
measured student difficulty, classroom effectiveness, or complete Grade 8
standards coverage. No browser/PDF rendering was inspected in this lane.
The review made no production edits, commits, or pushes.
