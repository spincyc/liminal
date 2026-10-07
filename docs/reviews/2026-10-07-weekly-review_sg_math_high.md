# Independent weekly coursework review: Singapore Mathematics 10–12

Status: all three complete courses reviewed. All reported findings were repaired and the affected content rechecked; no unresolved finding remains within this review’s stated scope. This is independent agent sampling, not human editorial approval or comprehensive proof of every exercise.

## Actual review scope

Reviewed the source-linked skeletons in `content/curriculum/singapore-math.json`, then all 36 weekly titles, objectives, explanations, prerequisite/next connections and 72 worked examples in each canonical course. Independently solved 108 worksheet items per course before seeing their keys: one item from every A/B/C sheet in every week, rotating across early and late positions. Also solved revised `sg12-w04-a3` independently. Total: 324 core cold solutions, one extra revised item, and 216 inspected worked models.

For week `w` and worksheet index `j` (`a=0,b=1,c=2`), select one-based item position `1 + ((w + 2j - 1) mod 6)`. IDs follow `sgGRADE-wWW-LETTERPOSITION`; for example week 1 selects a1/b3/c5, week 2 a2/b4/c6, and week 6 a6/b2/c4. This compact rule identifies all 324 core samples. Independent outcomes were recorded before key comparison in the reviewer's scratch files; author verification scripts were not reused.

Targeted re-review also inspected the author’s final expanded solution steps in 33 worksheet items (36 steps) and four model steps; these were not counted as additional cold samples.

A separate reviewer script checked 36-week unit pacing and standard-reference containment for each course, all 648 item IDs/course, two examples/week, three six-item sheets/week, and exact prompt uniqueness including models (720 prompts/course). It also independently recomputed 15 sensitive numerical cases: normal areas, mean-test p-values, sample-size ceilings, population/unbiased variance, binomial tails, circular arrangements and enumerated probability outcomes. These checks supplement the cold solutions; exact text uniqueness does not prove conceptual diversity or semantic correctness.

## Final fingerprints

| Canonical file | SHA256 |
| --- | --- |
| `content/weekly/singapore-math/12.json` | `8a4331693f80d9229b475a218672556dad8f4a4fa8e2b303379595f2d8fe111d` |
| `content/weekly/singapore-math/11.json` | `d6ed429bb5266984a873ac6b14183185c337ef72676686f1c50221c2b241dad1` |
| `content/weekly/singapore-math/10.json` | `70ac4d0721522e8b978aef628b53ee0a0d5790046c0e809b096dd8bf8c263b2a` |

## Findings and confirmed repairs

| Course | Finding | Final disposition |
| --- | --- | --- |
| 12 | Absolute-value bars were split by the author's delimiter, truncating convergence restrictions and fragmenting logarithm reasoning in week 2 and week 6. | Repaired to intact `abs(...)` and `ln(abs(y))`; checked affected answers, models and steps. |
| 12 | Week 4 b6 referred to an earlier identity instead of supplying it. | Geometric identity is now in the item prompt. |
| 12 | Week 13 c5 inferred a point probability from F(2)−F(1) without an integer-valued assumption. | Prompt now explicitly defines an integer-valued count. |
| 12 | Week 22 model 2/a3/a5/b2/b4/b6 and week 23 c3 needed independence explicit beside their sampling calculations. | Independent observations are now explicit. Week 25 c5 also explicitly names an eligible normal test. |
| 12 | Week 35 model 1 described z=2 as at the 5% boundary; week 26 used acceptance terminology. | Boundary wording corrected, with p≈0.0455; week 26 now says non-rejection interval. |
| 12 | Author revised week 4 a3 from an inconsistent arc description to a vertical coordinate calculation. | Independently recomputed 5sin(0.04)≈0.2 cm; circle now explicitly centred at the origin. |
| 11 | Week 2 c6 assumed the inverse existed at 6 from increasing behaviour alone. | Prompt now states strict increase and that 6 belongs to the range. |
| 11 | Week 4 a4 key invented hours; model 2 asked for inverse range while supplying inverse domain. | Time unit and requested domain are now explicit and consistent. |
| 10 | Week 18 c4 key supplied centimetres absent from the prompt. | Prompt now supplies x in cm and V in cm³. |
| 10 | Week 7 c5 model answer introduced unnamed triangle/midpoint labels. | Prompt and proof define triangle ABC, its midpoints and the complete vector subtraction. |
| 10 | Week 35 c3 called a delivery sample faster without defining delivery-time measurements; week 33 c1 blurred rates and accumulated totals. | Delivery times are now measured in minutes; rate comparison is explicit with 2<t≤4, while both totals are 24 units. |
| 10 | Week 24 quartile convention appeared in the explanation but not the separately exportable worksheet directions. | All three sheets specify median-of-halves and exclusion of the overall median for odd-length lists. |

## Scope, progression and negative findings

All three courses match their skeleton unit allocations: weeks 1–4, 5–9, 10–14, 15–18, 19–23, 24–27, 28–32 and 33–36. The Grade 10 course remains the selected G3 plus elective Additional Mathematics route. Its calculus develops power/chain/product/quotient rules, trigonometric/exponential/logarithmic forms, connected rates, constrained optimisation and integration; its data work distinguishes descriptive population SD from later unbiased estimation. It does not introduce an unsupported H2 integration-technique course.

JC1 proceeds from functions and graph restrictions through sequences, Cartesian complex numbers, vectors, extended calculus and conditional probability. Real-coefficient conjugate-root conditions, regularity for parametric derivatives, interval extrema, integration domains and perpendicular-distance conditions are treated explicitly. Polar/exponential complex forms and shortest distance between skew lines remain outside the selected scope.

JC2 retains radian and convergence restrictions, distinguishes local approximations from exact identities, checks differential-equation branches and lost equilibria, and differentiates scaling variance from adding independent variances. Its tests correctly require a normal population with known variance or an adequately large independent sample; small-sample unknown-variance normal tests are explicitly rejected. Regression distinguishes prediction direction, transformation scale, interpolation/extrapolation and correlation/causation. No selected calculation disagreed with its final key after repairs.

The course sequences contain calculation, error analysis, interpretation, proof, open design and modelling decisions. Repeated skills are developed through distinct weekly concepts, rather than whole lessons differing only in numerical parameters. No exact within-course duplicate displayed prompt was found among examples and exercises. Template wording in daily routines is common, but the explanations and mathematical tasks develop the named weekly concepts. Models and exercises include small routine cases; this review does not certify assessment difficulty or student mastery.

## Limits

Only the stated 108 worksheet items/course were cold-solved, plus the one additional revised item; the other worksheet answers were not exhaustively independently solved. All worked examples were inspected and mathematically checked, but this remains an agent review. Final synthesis weeks provide component practice and guidance, not evidence of a learner's completed sustained investigation. No official placement equivalence, syllabus certification or learning-outcome claim is made. Source-linked scope was compared with the existing repository skeleton; this review did not re-audit every official syllabus document.

No subject files were edited, author generators executed, builds run, distribution files written, commits made or browser checks claimed by this reviewer. The coordinator owns integration and browser/print verification.
