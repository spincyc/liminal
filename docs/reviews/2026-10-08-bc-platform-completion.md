# Calculus BC and shared assessment platform: completion review

This implements the [cold scope review](2026-10-08-bc-platform-scope.md)
against baseline `3555d8109fa1bf8a1f775a8b47504c0e6251a351`. The decision was
to build a complete first-calculus BC course and share assessment mechanics
where the existing SAT, ACT and AP workflows have matching requirements.

## Delivered course

Calculus BC has 36 weeks, 108 distinct worksheets, 707 worksheet exercises,
130 worked examples and 48 original weekly figures. Every week has three to
five worked examples and three worksheets of six to nine problems. Suggested
worksheet times are 35–50 minutes, with explicit calculator policies. Dense
weeks 4, 14, 18 and 19 have five examples and at least eight items per sheet;
week 30 has four examples and eight items per sheet.

The course starts from precalculus, without assuming prior AB. It covers the
shared AB foundation and BC integration techniques, improper integrals, Euler
and logistic models, arc length, parametric/vector/polar calculus, and series.
Thirty instructional weeks lead to two cumulative review weeks, the practice
exam in week 33, fresh remediation, and two original investigations/capstones.
The plan explicitly asks users to align this sequence with their exam calendar.

The detailed coverage checklist has 111 unit objectives plus two review and
enrichment objectives. Descriptive BC identifiers are explicitly editorial;
they do not pretend to be verified official granular CED numbering. Complete
validators connect all unit objectives to weekly instruction and assessments.
Reviewers separately checked the mathematical substance behind the mappings.

Ten original unit tests and one full practice exam add 162 MC questions and
26 FR questions, comprising 83 scored subparts, with 12 original assessment
figures. Each unit test takes 60 minutes and has 12 MC and two nine-point FR
questions. The practice exam follows the sourced May 2027 format: 42 MC,
six nine-point FR, 190 minutes, and the stated calculator boundaries. Its first
two FR tasks use real-world contexts. Student booklets, answer sheets, worked
keys, distractor explanations and partial-credit rubrics are separate outputs.
Reports retain raw points, without an AP score or AB-subscore conversion.

The complete repository now contains four AP courses, 33 unit tests and four
practice exams: 564 MC and 86 FR questions in 37 assessment documents. Across
all weekly coursework there are 45 original courses, 48 course views, 1,620
weeks, 4,860 worksheets, 29,358 exercises and 3,404 worked examples. Reused
named-course views do not inflate the original-content counts.

## Shared platform and compatibility

`assessment.js` and its explicit adapters now drive SAT/ACT booklet traversal,
numbering and duration totals, student-safe HTML/TeX question rendering,
SAT/ACT typed result summaries, and every AP projection, tally and raw-point
result. The [platform contract](../assessment-platform.md) records the API and
its actual consumers.

The implementation preserves SAT seeded generation, exact numeric comparison,
practice routing, mastery and exposure rules; ACT fixed banks, passage groups
and unscored essays; and AP authored documents and handwritten rubric work.
It introduces no dependencies, server, generic content generator or AP progress
store. Existing storage schemas, question identities, template versions and
run codes remain unchanged.

Independent compatibility checks against the baseline matched:

- All 26 pre-existing AP documents' projections, numbering, timing and tallies.
- 390 adversarial AP raw-grading cases and 392 mixed SAT/ACT engine summaries.
- Twelve sampled SAT/ACT HTML, key and TeX exports byte for byte, plus sampled
  serialized engine/session snapshots.
- The existing 200 SAT Math and 163 SAT Reading and Writing template registry
  fingerprints.

Cold code review found one regression: malformed authored FR solution steps
could throw while the adapter traversed a document, before validation reported
the bad field. Defensive adaptation and a real-validator regression test repair
that behavior. Tests also exercise recursive solution-field exclusion, source
mutation isolation, numeric-comparison ownership, unscored completion, partial
credit and browser script order. No code-review findings remain open.

## Independent content review and repairs

Reviewers received student-only prompts and givens, froze independent solutions,
and then compared authored keys. Every weekly prompt and lesson explanation
received a pedagogy/coverage review; mathematical solution comparison was
sampled as follows:

| Weeks | Examples solved | Worksheet items solved | Total |
| --- | ---: | ---: | ---: |
| 1–12 | 12 | 53 | 65 |
| 13–21, including a replacement-item follow-up | 12 | 47 | 59 |
| 22–30 | 9 | 57 | 66 |
| 31–36 | 18 | 50 | 68 |
| Total | 51 | 207 | 258 |

The foundation reviewer excluded previously seen AB week-1 tasks from the blind
sample and disclosed that prior exposure. One reviewer factoring mistake was
reconciled explicitly without silently rewriting the frozen solution. Authors
also performed secondary algebraic/numerical checks; these are distinct from
the independent blind samples.

All 162 assessment MC questions and all 83 FR subparts were independently
solved before key access. Every final answer agrees. Review included all 111
unit-objective mappings, the supplied figures, calculator policies, distractor
reasoning and mathematical scoring criteria. Subsequent choice shuffles were
checked against frozen answer texts before mapping to final letters.

Material course repairs included:

- Removing premature prerequisite assumptions, clarifying a symmetric
  difference estimate, correcting a calculator-policy mismatch and completing
  requested numerical checks in the keys.
- Allowing exact Euler approximations instead of forcing an over/under choice;
  explaining concavity through a nondifferentiable join using monotonicity of
  the first derivative; supplying the missing area-with-respect-to-y figure.
- Teaching the signed Lagrange remainder and explicit index/coefficient
  matching before exercises that require them.
- Replacing duplicate or merely numerical-variant tasks, correcting a
  disconnected-domain MVT candidate and a review accumulation total, and
  supplying the Taylor inequality needed for a self-contained investigation.
- Correcting the inherited AB co-function derivative wording and the
  second-derivative interval claim in `ab-w20-b6`; the latter's final
  inflection-point answer remains unchanged.

Assessment repairs included repeated answer-position cycles, algebraically
duplicate wrong alternatives, inaccurate distractor explanations, unsupported
secondary tags and an integral-test item that initially assessed only algebra
with a supplied bound. Rubrics now accept valid alternative methods, including
complete endpoint/critical-value comparisons, direct comparison, horizontal
shells, IVP uniqueness and known-series reasoning. Figure-axis clipping was
also repaired. A final periodic-key audit found no repeated short cycle across
any of the 37 AP assessment documents.

## Browser, print and release verification

Chromium checks exercised all 36 BC lessons and all 108 worksheet selections
with their keys at 320 pixels. Additional checks covered first, middle, dense
and final weeks at 390 and 1,280 pixels in light/dark modes, keyboard tab and
week navigation, and worked-lesson printing with initially closed solutions.
Printing included the solutions and restored the disclosure state afterward.

The AP hub, BC plan, unit-10 student/key views and practice exam passed 30
light/dark/viewport combinations, plus a 200% text check. Switching from a key
to a student route removed the key and rubric DOM. Actual week-30 student and
key downloads were opened and printed separately after opening an on-screen
key; the student copy retained blank workspaces and excluded solutions.

Actual Letter PDFs were inspected for worked lessons in weeks 1, 18, 30 and
36, a student/key worksheet pair, unit 10 and the full practice exam. The exam
student/key PDFs have 26/29 pages; unit 10 has 9/11. Sampled PDF text and page
rasters showed no blank pages, clipped drawings or answer leakage into student
copies. Repairs kept FR introductions and given figures with the first part,
kept lesson section headings with their first example, wrapped long BC topic
identifiers on phone keys, and split two overlong numerical sums. Redundant
worksheet-letter prefixes were removed from series sheet titles. The AP hub
uses two desktop columns for its four courses.

Real SAT/ACT browser checks covered MC and numeric responses, hints, both
feedback modes, navigator/review/report, timed save/reload/resume, independent
set/test storage slots and the module wall clock. ACT essays survived draft
resume and download, stayed out of accuracy, and did not leak draft text into
progress. A generated SAT Math module printed 22 questions, including nine
numeric responses, across 14 pages with its intentionally appended key. A full
ACT student export contained all 171 questions across 35 pages; its separate
key had 49 pages. Sampled pages retained passages, lettering, math and space.

Release commands:

```sh
node tools/check-all.js
node tools/report-content.js --write
git diff --check
```

The full gate passes all 893 tests, complete content/coverage admission,
template identity/review checks, build and static smoke checks. The SAT/ACT
content report is unchanged. The final source is rechecked before release.

## Limits

These are agent reviews, not human editorial approval or evidence of learning
outcomes. Weekly solution review is sampled, although every assessment answer
was independently solved. Suggested timing and difficulty are editorial, with
no student pilot or calculator-hardware study. Browser and PDF inspection is
sampled across devices and layouts. Passing counts, tag coverage, duplicate
heuristics or automated tests does not prove exhaustive semantic correctness.
Only official HTML scope/format metadata was consulted; no official questions,
scoring guides, equation sheets or CED PDFs were ingested.
