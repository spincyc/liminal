# Physics 1 and Physics C: Mechanics exam preparation

Built and reviewed 2026-10-22, after the
[Calculus AB exam-prep work](2026-10-22-ab-exam-prep.md) and on the same
request: exam-preparation coursework and pages for every AP® course on the
site that lacked them. Authors never verified their own work, and every
solver froze answers before seeing a key. This is agent review, not human
editorial approval or evidence of learning outcomes. Paper investigations
and invented data sets do not replace the hands-on lab work the AP® physics
courses require.

## What was added

| Piece | Physics 1 | Physics C: Mechanics |
| --- | ---: | ---: |
| Practice exams B, C, D (42 MC + 4 FR, one of each type) | 3 | 3 |
| Mixed timed sets (15 MC in 30 minutes, primary topics from every unit) | 6 | 6 |
| Free-response workshop: a guide and a four-question set per question type | 4 | 4 |
| Unit reviews, retrieval first | 8 | 7 |
| Strategy guides | 5 | 6 |
| Review plans (eight-week, four-week, in-course) | 3 | 3 |
| New multiple choice / free response | 216 / 28 (113 scored parts) | 216 / 28 (130 scored parts) |
| Guide self-checks | 139 | 140 |
| New figures | 110 | 96 |

The strategy guides are exam format and pacing, multiple-choice methods,
writing free-response answers, using the formula reference, and taking and
learning from a practice exam. Physics C adds calculus methods for
mechanics. Pages: `ap.html#physics-1/prep` and
`ap.html#physics-c-mechanics/prep`.

## Platform

The workshop is organized by the four free-response question types, so a
set holds one type and its questions carry that type's points:

- **Blueprints.** A physics `frSet` has `frTypes` (equal to the practice
  exam's), `minutesByType` and `questions`. `LiminalAp.blueprintProblems`
  checks one type per set, the type's points for each question, and part
  minutes equal to the sum of the type's pace. The validator requires the
  types and points to match the practice exam and whole minutes for every
  type. Physics mixed sets are one part with a calculator.
- **Pace.** Liminal's practice pace is MR 22, TBR 28, EDA 27 and QQT 18
  minutes. It sums to the section's 95 minutes and sits inside the suggested
  times practice exam A already printed (20–25, 25–30, 25–30, 15–20). An
  authoring lane found that the first pace, in proportion to points, put
  EDA outside those suggested times, so it was changed before release.
- **Page.** The prep page's timing sentences come from the blueprints:
  "with a calculator" for physics parts, a calculator throughout plus the
  appended formula reference for exams, and the per-type pace for the
  workshop. Tests cover the physics set blueprint, the validator rules and
  the physics prep page.

## Exam facts

Rechecked on College Board HTML pages only (no PDFs) on 2026-10-22. Every
count, time and section weight was confirmed. Added: the 3-hour length,
Bluebook's built-in Desmos scientific or graphing calculator with up to two
handheld calculators, and the equation sheet printed for the room and
available in Bluebook. Not stated on any allowed page: the points per
free-response type (10, 12, 10, 8), now labeled as Liminal practice
conventions in the exam blocks, source notes and guides.

## Process

| Stage | Agents | Outcome |
| --- | ---: | --- |
| Authoring (each exam form in a multiple-choice half and a free-response half) | 38 | Every draft passed the real validator in an isolated tree |
| Blind solve, review and repair by a different agent | 26 | Every key agreed with an independent blind solve |
| Cold pass: second blind solve of every item a verifier changed (54 and 58), final near-duplicate repairs, page coherence | 2 | All changed items agreed; seven more near-duplicates rewritten |
| Final blind solve of the cold-pass rewrites | 1 | 7 of 7 agreed |

Findings were about originality, teaching and rubrics rather than keys:

- **Repeated scenarios.** Multiple-choice items repeated their own exam's
  free-response scenario (written in parallel from one palette).
- **Near-duplicates.** Items nearly duplicated unit tests, exam A, the
  weekly courses or one another; mixed sets especially drew on scenarios the
  weekly courses already use.
- **Guide leaks and rules.** Workshop guides quoted their own sets'
  answers. One guide claimed the exam's equation sheet lists certain
  relations, which goes beyond the exam block. Some rules lacked
  hypotheses, such as bar-chart totals with internal energy conversions.
- **Rubrics and figures.** Some rubrics refused valid alternative
  arguments, and one key figure's arrow lengths contradicted its rubric.

Two verifiers sometimes repaired an overlap from both sides into the same
new scenario. The cold pass caught those, including one rewrite that
recreated a scenario already ruled a duplicate of a weekly item.

## Limits

- Agent review is not human editorial approval. Difficulty, timing and exam
  likeness are editorial judgments with no student pilot.
- Raw points are practice evidence. Nothing here estimates an AP score.
- The free-response pace and the points per type are Liminal conventions;
  College Board's pages give only the section's 95 minutes.
- The automated near-duplicate sweep compares wording, so it rarely flags
  physics items, whose duplicates are scenarios; physics overlaps were found
  by reading.
