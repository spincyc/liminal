# AP course cold review

Reviewed 2026-10-08 at `42e974f70474b9738bd77ee3f5870d4268ff5197`.
Scope: pedagogy, elegance, worked examples, worksheet quantity and variation,
and coverage in Liminal's courses for AP® Calculus AB, Physics 1, and Physics C:
Mechanics. Three independent course reviewers and a coordinating reviewer
inspected the material without reading earlier review reports. This report
records findings; it does not change or approve the course content.

The courses are substantial, coherent preparation packages. Their explanations
usually connect meaning, representations, methods, and concrete misconceptions.
Practice supply is ample and its variation is real. The next investment should
be correcting the specific errors below and improving transfer and print support,
rather than increasing worksheet counts across the board. The identified errors
prevent an unqualified recommendation for independent study.

## Inventory and judgments

| Course | Weeks | Worked examples | Worksheets | Worksheet items | Unit tests | Full practice exams |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Calculus AB | 36 | 106 | 108 | 651 | 8 | 1 |
| Physics 1 | 36 | 106 | 108 | 712 | 8 | 1 |
| Physics C Mechanics | 36 | 105 | 108 | 659 | 7 | 1 |

Across the three courses: 317 worked examples, 324 worksheets, 2,022 worksheet
items, and 26 assessments containing 402 multiple-choice and 60 free-response
questions. Item counts include connected subproblems within investigations; they
are not counts of independent scenarios or alternate test forms.

| Criterion | Judgment |
| --- | --- |
| Pedagogy | Strong conceptual explanations, meaningful progression, and explicit misconception work. Later physics and calculus applications retrieve earlier ideas. Unannounced mixed retrieval could appear more regularly before the final review weeks. |
| Elegance | Consistent lesson structure, useful diagrams, restrained presentation, and separated student/key copies. Specific math rendering and print behavior undermine otherwise clear material. |
| Worksheet supply | Ample: usually 18–21 questions per week, often with subparts, plus tests. These are practice supplies to distribute over the week. |
| Worked examples | Generally adequate for supported teaching; a few dense weeks need additional representation-specific models for independent beginners. |
| Variation | Substantial: symbolic, graphical, tabular, qualitative, numerical, error-analysis, design, and modeling tasks. A/B/C usually complement one another; they are not interchangeable alternate forms. |
| Coverage | All 81 AB, 43 Physics 1, and 41 Physics C content-topic references in the plan appear in weekly work and assessments. Reviewers found substantive instruction throughout the units, not merely topic tags. This does not certify every detailed official learning objective or measured exam difficulty. |

The unit structures and weightings agree with the current official course
overviews for [Calculus AB](https://apcentral.collegeboard.org/courses/ap-calculus-ab),
[Physics 1](https://apcentral.collegeboard.org/courses/ap-physics-1), and
[Physics C Mechanics](https://apcentral.collegeboard.org/courses/ap-physics-c-mechanics).
The repo also correctly reflects the May 2027 exam formats, including their
updated multiple-choice counts and timing:
[AB exam](https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam),
[Physics 1 exam](https://apcentral.collegeboard.org/courses/ap-physics-1/exam),
[Physics C exam](https://apcentral.collegeboard.org/courses/ap-physics-c-mechanics/exam).
Only official HTML overview/format facts were consulted; no College Board CED
PDFs, questions, scoring guides, or equation sheets were ingested.

## Corrections needed

The first seven findings are confirmed correctness or worksheet-usability
defects. Line numbers refer to the reviewed snapshot.

1. **The Physics C momentum reference teaches an invalid conservation condition.**
   [Reference](../../content/ap/references/physics-c-mechanics.json), line 260:
   `If ΣF_ext = 0 (or acts only briefly), then Σp_before = Σp_after`.
   A brief external force can deliver a large impulse. Replace the parenthesis
   with a condition of negligible net external impulse over the interval.
   The week-17 lesson correctly qualifies the approximation, so this reusable
   reference currently contradicts the instruction.

2. **An AB area problem omits an intersection and an entire region.**
   [Calculus weekly content](../../content/weekly/ap/calculus-ab.json), line
   10635, `ab-w27-c1`: the curves `x = y² − 3` and `x = e^(y/2)` intersect at
   approximately **−1.843328, 2.572930, and 8.451618**. The two bounded areas
   are **11.927635** and **48.299210**, totaling **60.226844**. The key reports
   only the first two intersections and first area. Specify the lower region
   and a domain explicitly, or ask for both regions and correct the solution.
   Missing the distant intersection is particularly harmful in the week
   teaching multiple intersections and calculator window selection.

3. **A Physics 1 error-analysis rubric requires the wrong conclusion.**
   [Physics 1 weekly content](../../content/weekly/ap/physics-1.json), lines
   7243–7260, `p1-w16-c7`: downhill acceleration raises measured postcollision
   speeds and lowers their reciprocals, but that does not imply a lower fitted
   vertical intercept. A counterexample uses the supplied masses, true launch
   speed 0.80 m/s, and acceleration 0.020 m/s² over 0.10 m. Fitting reciprocal
   measured speed against target mass gives intercept **1.46155 s/m**, versus
   the unbiased **1.25 s/m**, and inferred launch speed **0.6842 m/s**. The key
   requires a speed greater than 0.80 m/s. Separate the certain measurement-bias
   direction from the extrapolated-intercept claim; specify a measurement model
   if students must calculate the latter.

4. **Two Physics C work problems cannot start from their assumed conditions.**
   [Physics C weekly content](../../content/weekly/ap/physics-c-mechanics.json),
   lines 9960 and 9974, `cm-w24-b1` and `cm-w24-b2`. Both keys assume release
   from rest at angle zero, where the net torque is also zero. B1's supplied
   graph initially has `τ = 3θ`; B2 has `τ = 3θ − 0.50θ²`. The exact equilibrium
   remains stationary; integrating work does not make the keyed downstream
   states reachable. B2 also leaves the initial angle unstated. Supply a nonzero
   initial speed and recompute energies, or revise the initial angle/torque so
   release actually starts rotation. B1's SVG agrees with the zero-torque origin.

5. **An AB concavity table is mathematically impossible.**
   [Calculus weekly content](../../content/weekly/ap/calculus-ab.json), line
   4846, `ab-w13-b1`: `f″ > 0` on `[1,2]`, but the secant slope from the supplied
   values at 1 and 1.5 is `(6−7)/0.5 = −2`, equal to the supplied `f′(1.5)`.
   Strictly increasing `f′` requires that secant slope to be smaller than the
   right-endpoint derivative. Generate the givens from a consistent function
   and recheck the tangent estimate. The local calculation 6.2 does not resolve
   the contradictory givens.

6. **The renderer changes the grouping of inverse-derivative formulas.**
   [Renderer](../../src/app/render.js), lines 374–402, and the AB week-9
   explanation at line 3215. `mathTokens('1/f′(a)')` produces a fraction with
   denominator `f`, followed by the text `′(a)`. The screen and PDF therefore
   put the prime and argument outside the denominator. The same pattern occurs
   in examples, solutions, and a later review question. Group denominators
   explicitly, as `1/(f′(a))`, or teach the parser primed function calls and
   verify both screen and print output. This is a mathematical grouping issue,
   not a preference for another notation style.

7. **AB week-35 worksheets omit the data required to solve them independently.**
   [Calculus weekly content](../../content/weekly/ap/calculus-ab.json), lines
   13747–13795 and 13919: worksheet A refers to a drainage table in the lesson;
   `ab-w35-a2`, `a4`, `a5`, and `c1` need those observations. The
   [student projection](../../src/lib/weekly.js), lines 133–147, exports only
   referenced passages/figures and worksheet fields, not lesson explanations.
   An actual standalone C export contained **zero tables** while asking for
   residuals at nine data times. Move the supplied observations into a referenced
   passage or include them in each dependent sheet. An approximate scatterplot
   on A does not supply the exact table needed for the numerical work.

Two smaller modeling statements also deserve correction:

- Physics 1 week 17, line 7297, describes tangential acceleration as “along its
  velocity.” It is tangent to the path and points opposite velocity during
  slowing. The surrounding signed-acceleration instruction is otherwise sound.
- Physics C `cm-w09-c6`, line 3738, assumes two blocks joined by an ideal spring
  on a frictionless table settle to a steady extension “after a short time”
  under constant pull. Without damping or prepared initial conditions, relative
  motion oscillates. State an established common-acceleration condition, or
  supply damping; the intended steady-state force calculations are sound.

## Teaching and presentation improvements

**Offer a printable lesson with worked solutions.**
[weekly.css](../../src/styles/weekly.css), line 104, hides every
`.weekly-example-answer` in print, even when the learner has opened it.
Opening all three week-9 AB examples produced three visible screen solutions;
the resulting lesson PDF contained their prompts and no worked steps. Student
worksheet/key separation is useful, but a distinct teacher or study-guide print
option should preserve worked examples. The present behavior limits the value
of the otherwise substantial example library for offline study.

**Interleave practice-exam multiple choice.**
All three practice exams arrange their primary topics in uninterrupted ascending
unit blocks; both AB calculator parts do this independently. Physics 1 uses
blocks of 5/8/8/5/5/3/3/5 questions. This gives students a cue for choosing the
method. Reorder within calculator sections while preserving any shared-stimulus
groups and blueprint counts. This is a mixed-retrieval recommendation, not an
assertion about official exam item order. Add a few unannounced earlier-topic
questions to ordinary weeks as well. Cumulative application already exists;
it should not be described as absent.

**Teach numerical uncertainty comparisons earlier in Physics 1.**
The design rubrics for `p1-w25-c7` (lines 11405–11425) and `p1-w29-c7`
(13267–13284) expect comparisons “within uncertainty.” Earlier lessons teach
scatter, timing improvement, and systematic error, but explicit numerical interval comparison
appears in week 35 (15549), after the practice exam. Move a worked repeated-data
comparison before week 25 and add an independent decision about whether the
evidence distinguishes two models.

**Add selected models rather than blanket extra worksheets.**
AB week 9 has three worked examples: symbolic chain rule, implicit
differentiation, and a symbolic inverse derivative. Its worksheets also require
table composition (`ab-w09-b1`), graph composition (`b2`), and numerical inverse
solving (`c2`). The prose explains some of these procedures, so this is thin
scaffolding rather than missing instruction. A worked table/graph example, a
calculator inverse example, and a partially completed follow-up would help
independent beginners. Week 16, by contrast, uses its three examples well across
derivative sketching and two distinct optimization models; its count alone is
not evidence of a shortage. General-base exponential differentiation also merits
a short explicit derivation from `a^x = e^(x ln a)` before week 30 expects recall.

## Course strengths and limits

Calculus AB connects limits, derivative meaning, signed accumulation, the
Fundamental Theorem, and applications well. Theorem hypotheses, units, domain
restrictions, and error analysis recur. Modeling and construction tasks add
meaningful variation. The calculator/noncalculator split is clear.

Physics 1 develops systems and diagrams before conservation choices, then
reuses these ideas in rotation and fluids. Its investigations progress through
linearization, slope/intercept interpretation, apparatus design, and evaluation.
All four free-response types occur four times in unit tests and once in the
practice exam. The material is not dominated by numerical clones.

Physics C deliberately supports concurrent calculus: rate/accumulation and
polynomial rules in week 1, `a = v dv/dx` in week 8, exponential derivatives in
week 10, fractional powers in week 15, and trigonometric differentiation in
week 28. Coverage includes continuous center of mass, nonuniform inertia,
resistive forces, slipping-to-rolling, orbits, and physical pendulums. Later tasks
transfer drag to rotational spin-down and combine momentum with oscillation.

The physics packs remain paper preparation. Their lab limitation is stated
honestly; neither the amount of supplied-data practice nor topic coverage makes
them complete hands-on laboratory courses. Official course overviews for
[Physics 1](https://apcentral.collegeboard.org/courses/ap-physics-1) and
[Physics C](https://apcentral.collegeboard.org/courses/ap-physics-c-mechanics)
require laboratory experience.

The sampled screens were orderly and readable, including a dark-mode worksheet.
Three lesson routes and all three practice-exam routes had no horizontal overflow
at 320px or 390px. The six routes produced no captured runtime exceptions.
Letter-size practice-exam PDFs ran 28 pages for AB, 35 for Physics 1, and 37 for
Physics C. Sampled pages were readable, but paper use is substantial; print
economy is a refinement after the correctness and missing-content repairs.

## Independent solution samples

Reviewers extracted prompts without keys and recorded solutions before opening
the answers. The following unit-spanning samples agreed with the keys; the
Physics C reviewer corrected one arithmetic slip in their own initial table sum.
These checks do not imply that all other keys have been independently verified.

| Course | Blind weekly samples and independent results |
| --- | --- |
| AB | `w05-c3`: a=3, b=−4; `w06-b6`: slope 2.3, estimate 5.96; `w10-b4`: y″=39/32; `w13-b6`: estimate 3.2, overestimate; `w15-b6`: minimum at 1, inflections −2 and 0; `w22-b6`: ln(x²+4x+8)+(1/2)arctan((x+2)/2)+C; `w24-b6`: f=1+2e^(x²+x); `w29-b6`: volumes π(e²+1)/2 and π(4e−e²−1)/2. |
| Physics 1 | `w03-b6`: 2.9301 m, below rim and descending; `w06-c6`: 2.083 m/s², 8.015 N; `w12-b7`: 20.145 m/s, 258.81 m; `w16-b5`: 0.600 m/s, 0.270 J; `w20-b6`: a=mg/(m+M); `w23-c4`: v=5v₀/7; `w24-b4`: m=0.400 kg, k=43.865 N/m; `w27-b4`: 0.17525 m/s² upward, 1.6724 kg added lead. |
| Physics C | `w04-c5`: closest distance 2.4 km at 320 s; `w06-b5`: mass 1.875 kg, center 0.580 m; `w14-b6`: compression 0.116667 m, greatest speed 2.458 m/s; `w18-b6`: compression 0.100 m, final velocities −2 and +2 m/s; `w21-b2`: inertias 9.6 and 1.6 kg·m²; `w26-b4`: acceleration 4 m/s², friction 4 N forward; `w30-b2`: pivot L/√12, period 1.525 s for L=1 m. |

Full or partial exam samples also agreed: AB `ab-pe-fr3` accumulation and
extrema; Physics 1 `p1-pe-fr1`, `fr2`, and `fr3` (rolling dynamics, oscillator
representations, and spring-data analysis); Physics C `cm-pe-fr1`, `fr4`, and
`mc29` (quadratic drag, two-mass oscillation, and ring inertia). Thus the blind
sample comprised 23 weekly items, six full free-response questions, and one
multiple-choice question. Reviewers inspected all 108 weeks' instructional and
question prompts and all 26 assessments' prompts; deep key/rubric checks were
sampled.

## Verification and reproducibility

- `node tools/check-ap.js --complete` passed: three plans, 26 assessments,
  and two references.
- `node tools/check-weekly.js --complete` passed the full weekly inventory.
- `node --test test/ap-*.test.js test/weekly*.test.js` passed **59 tests**.
- Scratch builds of weekly/AP assets supported Chromium screen and PDF probes.
  No published site or tracked content was changed.
- Root bisection and the antiderivative `y³/3 − 3y − 2e^(y/2)` independently
  reproduce the AB area finding. The Physics 1 counterexample uses target masses
  0.25, 0.50, 0.75, 1.00, 1.25 kg and measured speed
  `sqrt((0.25*0.80/(0.25+M))² + 2*0.020*0.10)`, followed by an ordinary linear
  fit of reciprocal speed against M.
- The renderer grouping is directly reproducible with
  `require('./src/app/render').mathTokens('1/f′(a)')`. For the export finding,
  build the weekly assets and print/download AB week 35 worksheet C. For the
  worked-example print finding, open the three AB week-9 solutions and print
  the lesson.

Structural coverage and duplicate gates cannot prove semantic diversity or
answer correctness; the confirmed defects passed both gates. This review is
sampled independent agent review, not human editorial approval, an exhaustive
answer-key audit, classroom evidence, measured difficulty calibration, or a
comparison against official exam questions. Screens and PDF pages were sampled,
not exhaustively inspected. The full unrelated repository check was not needed
for this report-only change.

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.
