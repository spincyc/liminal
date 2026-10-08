# AP course repairs and verification

This change resolves the seven confirmed defects and two smaller modeling errors
in the [2026-10-08 cold review](2026-10-08-ap-cold-pedagogy.md), based on source
snapshot `42e974f70474b9738bd77ee3f5870d4268ff5197`. The original review remains a
historical record. Three course authors and a renderer author made separate
changes; the coordinating reviewer solved the changed mathematical prompts
without their keys before inspecting the revised solutions.

## Corrections

| Finding | Repair |
| --- | --- |
| Physics C momentum reference | Exact conservation requires zero net external impulse over the interval; negligible impulse permits approximate conservation. Short duration alone is insufficient. |
| AB `ab-w27-c1` | The prompt and key cover all three intersections and both bounded regions. Stored roots give areas 11.927634643 and 48.299209787, totaling 60.226844430. |
| Physics 1 `p1-w16-c7` | Separates the definite speed/reciprocal-speed bias from the unsupported intercept inference. Prompt, answer, steps and rubric now consider slope changes and extrapolation. |
| Physics C `cm-w24-b1`, `b2` | Specifies positive initial angular speeds, making the trajectories reachable. Initial kinetic energy is included throughout the revised work–energy solutions. |
| AB `ab-w13-b1` | Uses consistent values from a strictly concave-up quadratic. The tangent estimate remains 6.2, an underestimate. |
| Primed inverse derivatives | The math parser keeps the prime and full argument inside fraction operands: `1/f′(a)` has denominator `f′(a)`. Accessible text has the same grouping. Ambiguous apostrophes and numerical unit marks remain plain text. |
| AB week 35 | Original drainage observations, dimensions and units are a referenced passage. Dependent examples and sheets include it; standalone student exports now contain the exact table. The lesson also distinguishes negative volume change from positive outflow. |
| Physics 1 week 17 | Tangential acceleration points with velocity while speeding up and against it while slowing down. |
| Physics C `cm-w09-c6` | Separate trials specify a prepared spring stretch and simultaneous release/pull. Equal initial velocities and accelerations maintain that stretch; an ideal spring is no longer claimed to settle without damping. |

## Teaching and presentation

- AB week 9 adds three distinct worked models: composition from a table,
  composition from a graph, and a numerical inverse derivative. The first table
  exercise now starts with a partly completed solution. General-base exponential
  differentiation is derived and practiced explicitly.
- Physics 1 week 24 introduces mean/half-range timing estimates, a worked
  overlapping-interval comparison, and independent practice with nonoverlapping
  intervals and possible systematic error. These precede the week-25 and
  week-29 uncertainty judgments. The method is described as a classroom scatter
  estimate, with its limits, rather than a confidence interval.
- All three full practice exams interleave MC topics within calculator parts.
  Shared-figure groups remain together. Every question, choice, answer,
  rationale, figure reference, blueprint count, time limit and calculator policy
  is preserved; free-response sections are unchanged. MC IDs are renumbered to
  match printed positions, so old question numbers must be read against the
  original snapshot and student/key copies must come from the same version.
- **Print worked lesson** includes all worked answers and steps, even for
  unopened examples. It restores screen disclosure state afterward and keeps
  examples together when they fit a page. Student worksheets retain separate
  answer-free exports and native print behavior.

The AP inventory is now 321 worked examples, 324 worksheets and 2,023 worksheet
items across 108 weeks: AB has 109 examples/651 items, Physics 1 has 107/713,
and Physics C has 105/659. The 26 assessments still contain 402 MC and 60 FR
questions. Broader recurring mixed retrieval and further paper economy remain
editorial refinements; this repair does not claim an exhaustive proof of every
unchanged answer or hands-on laboratory completeness.

## Verification

Independent calculations reproduced the new results before the coordinating
reviewer opened the keys:

- AB: composition slopes 24 and 1.5; inverse input 0.6103616214 and derivative
  0.1285466543; scaffolded table answers 35, −6 and −9; consistent concavity and
  both bounded areas. Bisection, an analytic antiderivative and numerical
  integration agreed. General-base derivatives were also checked numerically.
- Physics C: wheel work 27 J and final speed 14 rad/s; turntable speeds
  √76 and √(140/3) rad/s, with positive kinetic energy throughout; spring
  acceleration 3 m/s² and required stretches 0.036 m and 0.012 m.
- Physics 1: overlapping intervals 1.41–1.43 and 1.42–1.44 s; independent-task
  intervals 1.40–1.44 and 1.48–1.52 s. The fit-bias reasoning distinguishes the
  measured values from the extrapolated intercept.

The full repository gate passed: `node tools/check-all.js`, the command behind
`npm run check` (npm was unavailable locally). This includes syntax and complete
content validation, template/review admission, a fresh build, static smoke and
link checks, and **880 passing tests**. Renderer tests cover prime grouping,
spoken text and ambiguous-unit fallbacks. Lesson-print tests cover unopened
answers, disclosure restoration, repeat printing and student/key separation.
`node tools/report-content.js --write` left the generated bank report unchanged.

Chromium checks covered AB weeks 1, 9, 35 and 36, Physics 1 week 24, Physics C
week 24, a Common Core week, and all three practice exams. The 27 sampled
viewport checks at 320, 390 and 1280 pixels had no horizontal overflow and the
pages produced no captured application exceptions. Screen and Letter PDF
inspection checked the revised examples and prime grouping, including a dark
screen. Actual print controls produced AB week-35 A/C student sheets containing
the nine observations with no solutions, even after the live key was opened.
Physics C week-24 B and Physics 1 week-24 C answer exports included the repaired
solutions. Native worksheet printing continued to hide opened keys. Practice
exam student PDFs were generated for all three courses.
