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
| Print styling | Native PDFs exposed a border-only page after the Mechanics exam's final FR item and Physics 1 rubrics separated from their diagrams. Terminal section spacing is removed in print; key figures share a responsive row, key question introductions stay with their figures, and the Points column does not break within the word. Given and completed drawings are both retained. The mobile reference layout is restricted to screen media and printed assessment figures have a 90 mm height limit. Targeted native reprints pass. |
| Worksheet downloads | The standalone export's old wordmark class no longer inherited the shared header's symbol dimensions, producing an oversized logo. Export-local layout now keeps the symbol at 28 × 34 px; the actual downloaded worksheet was reopened offline, inspected at 320 px and printed to PDF. |
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

Native Chromium 153 verification ran through the already approved direct
ChromeDriver and curl commands. This supersedes the initial tool-wrapper
failures. The native checks used the actual authored content:

- All 26 student assessments at 320 px had their expected item counts, given
  figures, no key DOM, no page overflow and the disclaimer. All 26 keys at
  both 320 and 390 px showed the key alone without page overflow.
- A further 27 sampled hub, plan, unit, reference and assessment route loads
  covered 1280 px light, 320 px light and 390 px dark. Native keyboard checks
  covered the skip link, unit disclosure and answer-key navigation.
- Eight assessment/plan/reference PDFs were checked. The repaired Mechanics
  practice exam is 37 pages with no blank page. The Physics 1 unit 3 key is
  12 pages: its shared graph stays with its question, and its paired energy
  diagrams and rubrics stay together. Additional keys for Calculus unit 7
  and the Physics 1 practice exam have no blank or rubric-only pages. Every
  sampled PDF contains the exact disclaimer after whitespace normalization;
  the Calculus plan prints all nine units through week 36.
- The integrating reviewer exercised all 324 student worksheet exports and
  324 keys in the native DOM against the deployed coursework. The 2,022
  student items retain all 310 given-figure appearances; student projections
  and exports exclude answer fields, answer DOM and rubrics, and every export
  includes its notice. Actual Physics 1 week 35 B student/key downloads opened
  offline with the expected six items/solutions and supplied table. The final
  student download has no page overflow at 320 px; its six-page PDF retains
  the table, graph, blank workspace and disclaimer without key material.

Native assessment checks used local files; the weekly download flow also
ran over the published HTTPS site. Earlier scratch fixture PDFs were not
used as acceptance evidence. PDF coverage is sampled, not exhaustive, and
does not establish other browser engines, assistive-technology usability or
physical-printer behavior. The earlier documented Calculus 11 px superscript
deferral is retained. No exhaustive new correctness or originality claim is
made for unsampled content.

Student/key separation is a presentation boundary; keys remain in browser
assets. Paper investigations do not replace required hands-on physics labs
or establish course authorization or lab credit. Raw points are not converted
to AP scores.

AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.
