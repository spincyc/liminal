# AP completion cold review — 2026-10-08

Reviewed the 16 unpublished AP commits from `24d0d3b` through `afdf948` and
completed the remaining Physics 1 repairs. Five independent agent lanes
covered Calculus AB, Physics 1, Physics C: Mechanics, the AP runtime and
validator, and browser/print readiness. The integrating reviewer inspected
the changes and independently solved the new Physics 1 investigation and
worksheet before reading their keys. This is sampled agent review, not human
editorial approval or empirical difficulty calibration.

## Delivered inventory

All three courses have 36 weeks: 108 lessons, 324 worksheets, 2,022 worksheet
items and 317 worked examples. There are 23 unit tests and three practice
exams, containing 402 multiple-choice and 60 free-response questions, plus
two physics formula references. The complete gates require this inventory.
The whole weekly library now has 44 original courses and 47 course views;
the three reused high-school courses do not inflate content counts.

## Findings and repairs

| Area | Finding and disposition |
| --- | --- |
| Physics 1 unfinished work | Integrated and reviewed the final practice-exam investigation, week 35 sheet B and figure repairs. Corrected a new draft's inference that a drag-free distance establishes terminal motion, and clarified uncertainty and accelerometer teaching. [Course review](2026-10-08-ap-physics-1-review.md) records independent calculations and all prior open-item dispositions. |
| Calculus AB rubric | `ab-u2-fr2(c)` demanded a continuity statement that the prompt did not request. Its conclusion point now accepts the sufficient unequal one-sided-limit argument. Blind checks covered 11 changed MC, 74 FR parts and seven weekly items. [Course review](2026-10-08-ap-calculus-ab-review.md) records the sample and numerical results. |
| Mechanics assumptions and figures | `cm-u6-fr2` mixed pad torque with bearing friction while changing only the pad coefficient; the setup and key now consistently neglect other resistance. `cm-pe-fr4` now distinguishes displacement from equilibrium from distance to the center of mass. Two clipped labels have larger viewBoxes. All seven replacement designs passed independent solutions. [Course review](2026-10-08-ap-physics-c-mechanics-review.md) records coverage. |
| Student/key transitions | Opening an uncached student test from a key left the old key visible and printable during the fetch. Routing now clears old content before awaiting data. Pending loads are shared, failures can be retried, and stale success/failure responses cannot replace the current copy. Three async controller regressions cover these cases. |
| Figure admission | A figure could be given in one item and answer-only in another item in the same assessment. Validation now rejects this document-wide conflict. |
| Validator robustness | Malformed nested plan, assessment and reference collections could throw before producing diagnostics. Shape checks now report those errors. Blueprint checks require scoring and FR rotation fields, whole MC allocations, valid timing ranges, ordered sections, exact unit topic membership and week-33 practice-exam placement. Mutation regressions exercise rejection. |
| Print styling | The mobile reference layout is restricted to screen media. Printed assessment figures have a 90 mm height limit, matching weekly figures. These are bounded safeguards; current native pagination was not verified. |
| Documentation | Added the README course entry and exact trademark notice, updated inventory counts, and removed the stale statement that AP courses were excluded from release validation. |

The new Physics 1 spring data independently give a fitted slope of
0.376 m/kg, an intercept of 0.0008 m and a dynamic stiffness of about
52.1 N/m. The static measurement gives about 49.8 N/m; dissipation explains
the direction of the difference. The baking-cup worksheet gives roughly
1.30 m/s and 0.00464 kg/m for its quadratic drag coefficient. Its drag-free
distance of 0.0862 m is explicitly insufficient to establish terminal motion
in the real drop; the worksheet asks for a video-based check.

## Source check

The three official HTML exam pages were rechecked on 2026-10-08. The plan's
May 2027 counts and timing agree: Calculus AB has 42 MC (29/13 across
62/38 minutes), followed by six FR (2/4 across 30/60 minutes); each physics
exam has 42 MC in 85 minutes and four FR in 95 minutes. The physics pages
name the four FR types. Sources: [Calculus AB](https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam),
[Physics 1](https://apcentral.collegeboard.org/courses/ap-physics-1/exam),
[Physics C: Mechanics](https://apcentral.collegeboard.org/courses/ap-physics-c-mechanics/exam).
No College Board PDFs, official questions, scoring guidelines or equation
sheets were retrieved. This check did not independently re-verify framework
topic lists, individual FR point values or the laboratory-time requirement.

## Verification and limits

Focused AP model, rendering, validator and async controller tests passed.
Both `check-ap --complete` and `check-weekly --complete` passed. Changed
physics SVGs were admitted by the figure validator and visually inspected
using the installed SVG rasterizer; Physics 1 included light and dark renders.
The integrated `TZ=UTC node tools/check-all.js` gate passed under Node
26.11.1, including a fresh build, static smoke checks and all 71 test files.
This is the same entry point as `npm run check`; npm was not installed.
`git diff --check` also passed.

Native Chromium and ChromeDriver could not start because the execution
sandbox denied socket operations; escalation was rejected by session policy.
No new native phone, keyboard, dark-mode, download or PDF acceptance is
claimed. Earlier AP assessment PDFs in scratch contain fixture questions;
they are not evidence that the final authored assessments paginate correctly.
Long answer-key parts containing multiple figures and a rubric still need
native print inspection. The earlier documented Calculus 11 px superscript
deferral is retained. No exhaustive new correctness or originality claim is
made for unsampled content.

Student/key separation is a presentation boundary; keys remain in browser
assets. Paper investigations do not replace required hands-on physics labs
or establish course authorization or lab credit. Raw points are not converted
to AP scores.

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.
